const fs = require('fs');
const pdfParse = require('pdf-parse');

const extractText = (pdfPath) => {
    const dataBuffer = fs.readFileSync(pdfPath);
    return pdfParse(dataBuffer).then(data => data.text);
};

module.exports = extractText;
