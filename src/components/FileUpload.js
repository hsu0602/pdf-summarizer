import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Button, TextField, CircularProgress, Box, Snackbar, Alert, Typography  } from '@mui/material';

function FileUpload({ setSummary }) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [inputKey, setInputKey] = useState(Date.now());
    const [elapsedTime, setElapsedTime] = useState(0);
    const [completedTime, setCompletedTime] = useState(null);
    const timerRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type !== 'application/pdf') {
            setError('Only PDF files are allowed.');
            setFile(null);
            return;
        }
        setFile(selectedFile);
    };

    const handleSubmit = async (forceReprocess = false) => {
        //e.preventDefault();
        if (!file) {
            setError('Please select a PDF file.');
            return;
        }

        setLoading(true);
        setCompletedTime(null);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('forceReprocess', forceReprocess ? 'true' : 'false');

        try {
            const response = await axios.post('/api/pdf/summarize', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setSummary(response.data.summary);
            //setCompletedTime(elapsedTime);
            if (response.data.cached) {
                alert('Used cached summary. Click "Regenerate" to force reprocessing.');
            }
            setSuccess(true);
            setFile(null); 
        } catch (error) {
            console.error(error);
            const errorMessage =
                error.response?.data?.error || 'Failed to summarize the PDF. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
            setFile(null);
            setInputKey(Date.now());
        }
    };

    useEffect(() => {
        if (loading) {
            timerRef.current = setInterval(() => {
                setElapsedTime((prevTime) => prevTime + 1);

            }, 1000);
        } else {
            clearInterval(timerRef.current);
            setCompletedTime(elapsedTime);
            setElapsedTime(0);
        }
        return () => clearInterval(timerRef.current);
    }, [loading]);

    useEffect(() => {
        if (!loading) {
            setCompletedTime(elapsedTime);
            setElapsedTime(0); 
        }
    }, [loading]);

    return (
        <form onSubmit={handleSubmit}>
            <Box display="flex" alignItems="center">
                <Button 
                    variant="contained" 
                    component="label"
                    disabled={loading}
                    sx={{ 
                        minWidth: '150px' 
                    }}
                >
                    {loading ? 'PDF Phrasing...' : 'UPLOAD PDF'}
                    <input
                        key={inputKey} 
                        type="file"
                        hidden
                        onChange={handleFileChange}
                        accept="application/pdf"
                    />
                </Button>
                <TextField
                    variant="outlined"
                    value={file ? file.name : ''}
                    placeholder="No file selected"
                    margin="normal"
                    fullWidth
                    disabled
                    style={{ marginLeft: 12 }}
                />
            </Box>
            <Box display="flex" justifyContent="space-between" mt={2}>
            <Button
                    type="button"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    onClick={() => handleSubmit(false)}
                >
                    {loading ? 'Summarizing...' : 'Summarize'}
                </Button>
                <Button
                    type="button"
                    variant="contained"
                    color="secondary"
                    disabled={loading}
                    onClick={() => handleSubmit(true)}
                >
                    {loading ? 'Regenerating...' : 'Regenerate'}
                </Button>
            </Box>
            {loading && (
                <Box display="flex" justifyContent="center" mt={2}>
                    <CircularProgress />
                </Box>
            )}
            {(loading || completedTime !== null) && (
                <Box mt={2} textAlign="center">
                    <Typography variant="body2">
                        Time elapsed: {loading ? elapsedTime : completedTime} seconds
                    </Typography>
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

            {/* Success Snackbar */}
            <Snackbar
                open={success}
                autoHideDuration={6000}
                onClose={() => setSuccess(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
                    PDF summarized successfully!
                </Alert>
            </Snackbar>
        </form>
    );
}

export default FileUpload;
