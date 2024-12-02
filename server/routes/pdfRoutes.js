const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const extractText = require('../utils/extractText');
const generateSummary = require('../utils/localModel');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const processedFiles = new Map();


setInterval(() => {
    processedFiles.clear();
    console.log('Cleared cached summaries');
}, 60 * 60 * 1000); 

router.post('/summarize', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { forceReprocess } = req.body;
        const isForceReprocess = forceReprocess === 'true';
        const filePath = req.file.path;
        
        const fileBuffer = fs.readFileSync(filePath);
        const hash = crypto.createHash('md5').update(fileBuffer).digest('hex');

        if (!isForceReprocess && processedFiles.has(hash)) {
            console.log(`Duplicate file detected: ${hash}`);
            const summary = processedFiles.get(hash);
            try {
                fs.unlinkSync(filePath);
            } catch (err) {
                console.error(`Failed to delete file: ${filePath}`, err);
            }
            return res.json({ summary, cached: true });
        }
        
    
        const text = await extractText(filePath).catch((err) => {
            throw new Error(`Error extracting text from PDF: ${err.message}`);
        });

        const summary = await generateSummary(text).catch((err) => {
            throw new Error(`Error generating summary: ${err.message}`);
        });

        
        try {
            fs.unlinkSync(filePath);
        } catch (err) {
            console.error(`Failed to delete file: ${filePath}`, err);
        }
        processedFiles.set(hash, summary);
        
        res.json({ summary,  cached: false});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while processing the file.' });
    }
});

module.exports = router;
