const { spawn } = require('child_process');
const path = require('path');

const generateSummary = (text) => {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, 'generate_summary.py');
        const pythonProcess = spawn('python3', [scriptPath, text]);

        let result = '';
        pythonProcess.stdout.on('data', (data) => {
            result += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error('Error:', data.toString());
        });

        pythonProcess.on('close', () => {
            resolve(result.trim());
        });

        pythonProcess.on('error', (err) => {
            reject(err);
        });
    });
};

module.exports = generateSummary;
