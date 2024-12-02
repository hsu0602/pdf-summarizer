const { spawn } = require('child_process');
const path = require('path');

function extractTextWithPython(pdfPath) {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, 'extract_text.py');
        const pythonProcess = spawn('python', [scriptPath, pdfPath]);

        let output = '';
        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error('Error:', data.toString());
        });

        pythonProcess.on('close', (code) => {
            if (code === 0) resolve(output.trim());
            else reject(new Error(`Process exited with code ${code}`));
        });
    });
}

module.exports = extractTextWithPython;