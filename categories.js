const axios = require('axios');

async function fetchDomainCategories(domain) {
    const apiUrl = 'https://branalyzerazuredomainfunctions.azurewebsites.net/api/GetDomainCategories';
    const params = {
        code: 'i1wUn2KLjnQ8kKV077fD3xBXGNw3kJZtC3fUb6vNDvseF2AjerbV8w==',
        Url: domain,
        Country: 'India'
    };
    const headers = {
        'Accept': 'application/json, text/plain, /',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7',
        'Connection': 'keep-alive',
        'Host': 'branalyzerazuredomainfunctions.azurewebsites.net',
        'Origin': 'https://branalyzer.com',
        'Referer': 'https://branalyzer.com/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
    };

    try {
        const response = await axios.get(apiUrl, { params, headers });
        const data = response.data;
        return data;
    } catch (error) {
        console.error('Error fetching domain categories:', error);
        return null;
    }
}

module.exports = { fetchDomainCategories };
