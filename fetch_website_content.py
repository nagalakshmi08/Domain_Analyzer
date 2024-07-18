import sys
import requests
from bs4 import BeautifulSoup

def fetch_website_content(url):
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for 4XX and 5XX status codes
        soup = BeautifulSoup(response.content, 'html.parser')
        return soup.get_text()
    except requests.RequestException as e:
        print(f"Error fetching content from {url}: {e}")
        return None

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python fetch_website_content.py <domain>")
        sys.exit(1)

    domain = sys.argv[1]
    url = f"https://{domain}"  # Assuming HTTPS protocol
    content = fetch_website_content(url)
    if content:
        with open('website_content.txt', 'w', encoding='utf-8') as file:
            file.write(content)
            print("Content written to website_content.txt")
    else:
        print("No content fetched.")
