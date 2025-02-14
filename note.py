import os
import time
import requests

# DeepSeek API URL（你需要根据官方文档更新URL）
api_url = 'https://api.deepseek.com'

# 设置DeepSeek的API密钥
api_key = 'sk-'

# 读取本地笔记
def read_notes_from_folder(folder_path):
    notes = []
    for filename in os.listdir(folder_path):
        if filename.endswith('.txt') or filename.endswith('.md'):
            with open(os.path.join(folder_path, filename), 'r', encoding='utf-8') as file:
                notes.append({'filename': filename, 'content': file.read()})
    return notes

# 向DeepSeek API发送请求，润色和格式化文本
def polish_and_format_note(note_content):
    retries = 3
    for _ in range(retries):
        try:
            response = requests.post(
                api_url,
                json={'text': note_content},
                headers={'Authorization': f'Bearer {api_key}'}
            )
            response.raise_for_status()  # 如果请求失败，会抛出异常
            return response.json().get('polished_text')  # 假设API返回"polished_text"
        except requests.exceptions.RequestException as e:
            print(f"请求失败: {e}. 重试中...")
            time.sleep(2)
    return None  # 如果重试失败，返回None

# 保存整理后的笔记
def save_polished_note(folder_path, filename, polished_content):
    with open(os.path.join(folder_path, f"polished_{filename}"), 'w', encoding='utf-8') as file:
        file.write(polished_content)

# 主函数，批量处理笔记
def batch_process_notes(folder_path):
    notes = read_notes_from_folder(folder_path)
    for note in notes:
        print(f"正在处理：{note['filename']}")
        polished_content = polish_and_format_note(note['content'])
        if polished_content:
            save_polished_note(folder_path, note['filename'], polished_content)
            print(f"处理完成：{note['filename']}")
        else:
            print(f"处理失败：{note['filename']}，请检查日志。")

# 执行批量处理
folder_path = 'path/to/your/notes'  # 替换为笔记所在文件夹的路径
batch_process_notes(folder_path)