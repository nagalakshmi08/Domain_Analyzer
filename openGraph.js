const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const fetchOpenGraphData = async (domain) => {
    try {
        // Dynamically import node-fetch
        const fetchModule = await import('node-fetch');
        const fetch = fetchModule.default;

        const response = await fetch(`https://api.allorigins.win/get?url=https://${domain}`);
        const data = await response.json();
        const html = data.contents;
        const { document } = new JSDOM(html).window;
        const ogImage = document.querySelector('meta[property="og:image"]');
        const ogTitle = document.querySelector('meta[property="og:title"]');

        let openGraphData = {
            title: ogTitle ? ogTitle.getAttribute('content') : null,
            image: ogImage ? ogImage.getAttribute('content') : null,
        };

        if (openGraphData.image) {
            // Download the Open Graph image
            const imageUrl = openGraphData.image;
            const imageFileName = `opengraph_${domain}.png`;
            const imageDir = path.join(__dirname, 'images');
            const imagePath = path.join(imageDir, imageFileName);

            // Ensure the images directory exists
            if (!fs.existsSync(imageDir)) {
                fs.mkdirSync(imageDir);
            }

            const imageResponse = await fetch(imageUrl);
            const imageBuffer = await imageResponse.arrayBuffer();
            fs.writeFileSync(imagePath, Buffer.from(imageBuffer));
            openGraphData.imagePath = imagePath;
        }

        return openGraphData;
    } catch (error) {
        console.error('Error fetching Open Graph data:', error);
        return { title: null, image: null, imagePath: null };
    }
};

module.exports = { fetchOpenGraphData };
