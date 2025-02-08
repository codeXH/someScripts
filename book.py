import requests
import time
from bs4 import BeautifulSoup

# 定义书籍的ID
book_id = 175319

def remove_html_tags(text):
    soup = BeautifulSoup(text, "html.parser")
    return soup.get_text()

# 获取章节列表
def get_chapter_list(book_id):
    url = f"https://api.97yd.com/menu?&bookid={book_id}&start=0"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        if data['code'] == 200:
            cList = data['data']
            print(f"list = {list}")
            reversed_arr = list(reversed(cList))
            return cList
        else:
            print(f"获取章节列表失败，消息：{data['msg']}")
            return []
    else:
        print(f"获取章节列表失败，HTTP 状态码：{response.status_code}")
        return []

# 获取每个章节的内容
def get_chapter_content(book_id, chapter_id):
    url = f"https://api.97yd.com/reader?&bookid={book_id}&chapterid={chapter_id}"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        if data['code'] == 200:
            html_text = data['data']  # 获取章节内容
            plain_text = remove_html_tags(html_text)
            return plain_text
        else:
            print(f"获取章节 {chapter_id} 内容失败，消息：{data['msg']}")
            return None
    else:
        print(f"获取章节 {chapter_id} 内容失败，HTTP 状态码：{response.status_code}")
        return None

# 保存小说内容到文件
def save_novel(book_id, filename="巨鱼.txt"):
    chapter_list = get_chapter_list(book_id)
    if not chapter_list:
        print("没有章节数据，退出！")
        return

    with open(filename, 'a', encoding='utf-8') as file:
        for chapter in chapter_list:
            chapter_id = chapter.get('chapterid')
            chapter_title = chapter.get('chaptername')

            print(f"正在获取章节: {chapter_title}")
            chapter_content = get_chapter_content(book_id, chapter_id)
            if chapter_content:
                content = chapter_content.strip()
                if content:
                    file.write(f"【{chapter_title}】\n{content}\n\n")
                else:
                    file.write(f"【{chapter_title}】\n（内容无法加载）\n\n")

            # 适当延迟，防止请求过于频繁
            time.sleep(1)

    print(f"小说已保存至 {filename}")

if __name__ == "__main__":
    save_novel(book_id)