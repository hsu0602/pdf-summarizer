import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import SummaryResult from './components/SummaryResult';
import { Container, Typography } from '@mui/material';

function App() {
    const [summary, setSummary] = useState('');

    return (
        <Container maxWidth="md" style={{ marginTop: '100px' }}>
            <Typography variant="h3" align="center" gutterBottom>
                PDF Summarizer
            </Typography>
            <FileUpload setSummary={setSummary} />
            <SummaryResult summary={summary} />
        </Container>
    );
}

export default App;
