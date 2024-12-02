const express = require('express');
const path = require('path');

const cors = require('cors');

const app = express();
app.use(cors({
    origin: 'https://pdfsum.ebg.tw/',
}));

app.use(express.static(path.join(__dirname, '../build')));

app.use('/api/pdf', require('./routes/pdfRoutes'));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

const PORT = 54088;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

