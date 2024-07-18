from playwright.sync_api import sync_playwright
import sys
from urllib.parse import urlparse

def take_screenshot(url, screenshot_path):
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            parsed_url = urlparse(url)
            domain = parsed_url.netloc
            page.goto(url)
            page.screenshot(path=screenshot_path)
            print(screenshot_path)  # Print the path to be captured in server.js
        except Exception as e:
            print(f"Error taking screenshot: {e}")
        finally:
            browser.close()

def main():
    if len(sys.argv) != 3:
        print("Usage: python take_screenshot.py <url> <screenshot_path>")
        return

    url = sys.argv[1]
    screenshot_path = sys.argv[2]

    take_screenshot(url, screenshot_path)

if __name__ == "__main__":
    main()
