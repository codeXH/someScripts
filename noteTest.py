import json
import os
import time
import requests
from requests.exceptions import RequestException, JSONDecodeError

# DeepSeek API 配置 (请确认最新API地址)
API_URL = 'https://api.deepseek.com/chat/completions'  # 更新为最新API地址
API_KEY = 'sk-'  # 替换为你的实际API key
MODEL_NAME = 'deepseek-chat'  # 根据API文档确认模型名称
REQUEST_TIMEOUT = 60  # 请求超时时间(秒)
RATE_LIMIT_DELAY = 1  # API速率限制防护延迟

def read_notes_from_folder(folder_path):
    """读取指定文件夹下的文本文件，支持多种格式"""
    valid_extensions = ('.txt', '.md', '.docx', '.rst')
    return [
        {
            'filename': filename,
            'content': open(os.path.join(folder_path, filename), 'r', encoding='utf-8').read(),
            'extension': os.path.splitext(filename)[1]
        }
        for filename in os.listdir(folder_path)
        if filename.endswith(valid_extensions)
    ]

def generate_polish_prompt(original_text):
    """生成优化提示词模板"""
    return f'''请帮我专业地润色和优化以下文本，要求：
1. 保持原始语义不变
2. 优化逻辑结构
3. 修正语法错误
4. 使用更专业的学术表达
5. 输出Markdown格式

原始文本：
{original_text}'''

def polish_with_deepseek(content, max_retries=5):
    """调用DeepSeek API进行文本优化"""
    headers = {
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }

    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": "你是一个专业的文本优化助手"},
            {"role": "user", "content": generate_polish_prompt(content)}
        ],
        "temperature": 0.3  # 控制输出稳定性
    }

    for attempt in range(max_retries):
        try:
            response = requests.post(
                API_URL,
                json=payload,
                headers=headers,
                timeout=REQUEST_TIMEOUT
            )
            response.raise_for_status()
            
            # 解析响应内容
            result = response.json()
            return result['choices'][0]['message']['content']
            
        except RequestException as e:
            print(f"API请求失败 (尝试 {attempt+1}/{max_retries}):")
            print(f"状态码: {e.response.status_code if e.response else '无响应'}")
            print(f"错误详情: {str(e)}")
            
            if attempt < max_retries - 1:
                wait_time = 2 ** attempt  # 指数退避
                print(f"{wait_time}秒后重试...")
                time.sleep(wait_time)
        except JSONDecodeError:
            print("响应解析失败，请检查API返回格式")
            return None
            
    print("所有重试失败")
    return None

def save_polished_file(folder_path, original_name, extension, content):
    """保存优化后的文件，保留原始格式"""
    new_filename = f"polished_{os.path.splitext(original_name)[0]}{extension}"
    output_path = os.path.join(folder_path, new_filename)
    
    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"文件已保存: {new_filename}")
        return True
    except IOError as e:
        print(f"文件保存失败: {str(e)}")
        return False

def batch_process(folder_path):
    """批量处理工作流"""
    if not API_KEY:
        print("错误：缺少API密钥配置")
        return

    notes = read_notes_from_folder(folder_path)
    print(f"发现 {len(notes)} 个待处理文件")
    
    for index, note in enumerate(notes, 1):
        print(f"\n正在处理 ({index}/{len(notes)}): {note['filename']}")
        
        polished = polish_with_deepseek(note['content'])
        if not polished:
            print("跳过该文件...")
            continue
            
        save_polished_file(
            folder_path,
            note['filename'],
            note['extension'],
            polished
        )
        
        time.sleep(RATE_LIMIT_DELAY)  # 遵守速率限制

if __name__ == "__main__":
    target_folder = '/Users/xiaohei/Downloads/note'  # 修改为你的笔记路径
    
    if not os.path.exists(target_folder):
        print(f"路径不存在: {target_folder}")
    else:
        batch_process(target_folder)
        print("\n处理完成！检查polished_前缀的文件")