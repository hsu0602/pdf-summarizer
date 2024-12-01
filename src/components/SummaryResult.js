import React from 'react';
import { Typography, Card, CardContent } from '@mui/material';

function SummaryResult({ summary }) {
    if (!summary) return null;

    return (
        <Card variant="outlined" style={{ marginTop: 24 }}>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Summary:
                </Typography>
                <Typography variant="body1">{summary}</Typography>
            </CardContent>
        </Card>
    );
}

export default SummaryResult;
