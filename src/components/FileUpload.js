import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Button, TextField, CircularProgress, Box, Snackbar, Alert } from '@mui/material';

function FileUpload({ setSummary }) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a PDF file.');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:5000/api/pdf/summarize', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setSummary(response.data.summary);
        } catch (error) {
            console.error(error);
            setError('Failed to summarize the PDF.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (loading) {
            timerRef.current = setInterval(() => {
                setElapsedTime((prevTime) => prevTime + 1);
            }, 1000);
        } else {
            clearInterval(timerRef.current);
            setElapsedTime(0);
        }
        return () => clearInterval(timerRef.current);
    }, [loading]);

    return (
        <form onSubmit={handleSubmit}>
            <Box display="flex" alignItems="center">
                <Button variant="contained" component="label">
                    Upload PDF
                    <input type="file" hidden onChange={handleFileChange} accept="application/pdf" />
                </Button>
                <TextField
                    variant="outlined"
                    value={file ? file.name : ''}
                    placeholder="No file selected"
                    margin="normal"
                    fullWidth
                    disabled
                    style={{ marginLeft: 16 }}
                />
            </Box>
            <Button type="submit" variant="contained" color="primary" disabled={loading} fullWidth>
                {loading ? 'Summarizing...' : 'Summarize'}
            </Button>
            {loading && (
                <Box display="flex" justifyContent="center" mt={2}>
                    <CircularProgress />
                </Box>
            )}
            {loading && (
                <Box mt={2} textAlign="center">
                    <p>Time elapsed: {elapsedTime} seconds</p>
                </Box>
            )}

            {/* Error Snackbar */}
            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError('')}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </form>
    );
}

export default FileUpload;
