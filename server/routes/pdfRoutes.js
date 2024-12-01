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

router.post('/summarize', upload.single('file'), async (req, res) => {
    try {
        const filePath = req.file.path;

       
        const fileBuffer = fs.readFileSync(filePath);
        const hash = crypto.createHash('md5').update(fileBuffer).digest('hex');

        
        if (processedFiles.has(hash)) {
            console.log(`Duplicate file detected: ${hash}`);
            const summary = processedFiles.get(hash);
            fs.unlinkSync(filePath);
            return res.json({ summary });
        }

        const text = await extractText(filePath);
        const summary = await generateSummary(text);
        fs.unlinkSync(filePath);

        processedFiles.set(hash, summary);
        
        res.json({ summary });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while processing the file.' });
    }
});

module.exports = router;
