const express = require('express');
const cors = require('cors');
const { analyzeBacklinks } = require('./backlinks');
const { fetchDomainCategories } = require('./categories');
const { fetchOpenGraphData } = require('./openGraph');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');
const axios = require('axios');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors());

app.use(express.static('public'));
app.use(express.json());

// Create the pdfs directory if it doesn't exist
const pdfsDir = path.join(__dirname, 'pdfs');
if (!fs.existsSync(pdfsDir)) {
    fs.mkdirSync(pdfsDir);
}

const takeScreenshot = (domain) => {
    const url = domain.startsWith('http') ? domain : `https://${domain}`;
    const screenshotPath = path.join(__dirname, `screenshot_${domain}.png`);

    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', ['take_screenshot.py', url, screenshotPath]);

        pythonProcess.stdout.on('data', (data) => {
            console.log(`Screenshot path: ${data.toString().trim()}`);
            resolve(screenshotPath);
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Error taking screenshot: ${data.toString()}`);
            reject(data.toString());
        });
    });
};

const fetchSocialMediaData = (domain) => {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', ['social_media_scraper.py', domain]);

        pythonProcess.stdout.on('data', (data) => {
            try {
                const socialMediaData = JSON.parse(data);
                resolve(socialMediaData);
            } catch (error) {
                console.error('Error parsing social media data:', error);
                reject(error);
            }
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Error fetching social media data: ${data}`);
            reject(data.toString());
        });
    });
};

const callPythonScript = (domain) => {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', ['fetch_website_content.py', domain]);

        pythonProcess.stdout.on('data', (data) => {
            console.log(data.toString());
            resolve();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Error calling Python script: ${data.toString()}`);
            reject(data.toString());
        });
    });
};

const sendEmailWithPDF = (pdfFilePath, recipient) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'our mail id',
            pass: 'our mail password',
        },
    });

    const mailOptions = {
        from: 'our mail id',
        to: recipient,
        subject: 'Generated PDF Report',
        text: 'Please find the attached PDF report.',
        attachments: [
            {
                filename: path.basename(pdfFilePath),
                path: pdfFilePath,
            },
        ],
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return reject(error);
            }
            resolve(info);
        });
    });
};

app.post('/api/analyzeDomain', async (req, res) => {
    const domain = req.body.domain;

    try {
        const backlinksData = await analyzeBacklinks(domain);
        const socialMediaData = await fetchSocialMediaData(domain);
        const categoriesData = await fetchDomainCategories(domain);
        const openGraphData = await fetchOpenGraphData(domain);
        const screenshotPath = await takeScreenshot(domain);
        await callPythonScript(domain);

        const pdfFileName = `${domain}_report.pdf`;
        const pdfFilePath = path.join(pdfsDir, pdfFileName);
        const pdfDoc = new PDFDocument();
        pdfDoc.pipe(fs.createWriteStream(pdfFilePath));

        pdfDoc.text('Backlinks Data:');
        pdfDoc.text(JSON.stringify(backlinksData, null, 2));
        pdfDoc.text('\n');

        pdfDoc.text('Social Media Data:');
        pdfDoc.text(JSON.stringify(socialMediaData, null, 2));
        pdfDoc.text('\n');

        pdfDoc.text('Domain Categories Data:');
        pdfDoc.text(JSON.stringify(categoriesData, null, 2));
        pdfDoc.text('\n');
        pdfDoc.addPage();

        pdfDoc.text('Screenshot:');
        pdfDoc.image(screenshotPath, { width: pdfDoc.page.width - 100 });
        pdfDoc.text('\n');
        pdfDoc.addPage();

        pdfDoc.text('Open Graph Data:');
        pdfDoc.text(`Title: ${openGraphData.title || 'N/A'}`);
        pdfDoc.text(`Image URL: ${openGraphData.image || 'N/A'}`);
        if (openGraphData.imagePath) {
            pdfDoc.text('Open Graph Image:');
            pdfDoc.image(openGraphData.imagePath, { width: pdfDoc.page.width - 100 });
        } else {
            pdfDoc.text('No OG image found');
        }
        pdfDoc.text('\n');

        pdfDoc.end();

        await sendEmailWithPDF(pdfFilePath, 'lakshmireddwarampudi436@gmail.com');

        res.json({ message: 'Report generated successfully and emailed.' });
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ error: 'Error generating report.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
