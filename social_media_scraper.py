import sys
import json
from bs4 import BeautifulSoup
import requests

def fetch_social_media_data(domain):
    api_url = 'https://branalyzerazuresocialmediafunctions.azurewebsites.net/api/GetSocialMediaFromUrl'
    params = {
        'code': 'N0JyCYxIh62m1fu2eedLKkV0Nk1ce04pEU7s4JyfgTrpYvoUMo4JeQ==',
        'Url': domain
    }

    try:
        response = requests.get(api_url, params=params)
        response.raise_for_status()
        brand_summary = response.json()

        social_media_details = {
            'facebook': {
                'link': brand_summary.get('facebook'),
                'followers': None
            },
            'instagram': {
                'link': brand_summary.get('instagram'),
                'followers': None
            },
        }

        return social_media_details
    except requests.exceptions.RequestException as e:
        print('Error fetching brand summary:', e)
        return {}

def scrape_facebook_followers(url):
    api_key = 'BZHE2QR0V7LF3YQHX8RO05EKE9XKLWZ0UGBAJG59EQF5UBB2NCXOO6Y7HQ4AHKVQZMIBSWW8X3W7EK6F'
    response = requests.get(
        'https://app.scrapingbee.com/api/v1/',
        params={
            'api_key': api_key,
            'url': url,
            'render_js': 'true'  # Use JavaScript rendering
        }
    )
    html_content = response.text
    soup = BeautifulSoup(html_content, 'html.parser')
    followers_element = soup.select_one('div.x9f619 span.x193iq5w a[href*="/followers/"]')
    followers_count = 'Unknown'
    if followers_element:
        followers_count = followers_element.text.strip()
    return followers_count

def scrape_instagram_followers(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    followers = None
    try:
        followers = soup.find('meta', {'property': 'og:description'}).get('content').split(' ')[0]
    except Exception as e:
        print(f"Error scraping Instagram: {e}")
    return followers

def get_followers_count(social_media_links):
    followers_data = {}
    if social_media_links.get('facebook'):
        followers_data['facebook'] = {
            'link': social_media_links['facebook']['link'],
            'followers': scrape_facebook_followers(social_media_links['facebook']['link'])
        }
    if social_media_links.get('instagram'):
        followers_data['instagram'] = {
            'link': social_media_links['instagram']['link'],
            'followers': scrape_instagram_followers(social_media_links['instagram']['link'])
        }
    return followers_data

if __name__ == '__main__':
    domain = sys.argv[1]
    social_media_links = fetch_social_media_data(domain)
    followers_data = get_followers_count(social_media_links)
    print(json.dumps(followers_data))
