import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { formatDate } from '../../utils/formatDate';
import { highlightText } from '../../utils/highlightText';

const LawDetailContent = ({ law, search }) => {
    if (!law) return null;

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>{law.title}</Typography>
            <Typography variant="subtitle1" gutterBottom>
                <b>Số hiệu:</b> {law.lawNumber}
            </Typography>
            <Typography variant="subtitle2" gutterBottom>
                <b>Ngày ban hành:</b> {formatDate(law.issuedDate)}
            </Typography>
            <Typography variant="subtitle2" gutterBottom>
                <b>Cơ quan ban hành:</b> {law.metadata?.issuer}
            </Typography>
            <Box sx={{ mt: 2 }}>
                {law.rawHtml ? (
                    <div
                        style={{ fontSize: 16, lineHeight: 1.7 }}
                        dangerouslySetInnerHTML={{
                            __html: highlightText(law.rawHtml, search)
                        }}
                    />
                ) : (
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}
                        dangerouslySetInnerHTML={{
                            __html: highlightText(law.contentText, search)
                        }}
                    />
                )}
            </Box>
        </Paper>
    );
};

export default LawDetailContent; 