import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Stack } from '@mui/material';
import { formatDate } from '../../utils/formatDate';
import { highlightText } from '../../utils/highlightText';

const LawCard = ({ law, search }) => {
    return (
        <Card sx={{ mb: 2, boxShadow: 2, borderRadius: 2, '&:hover': { boxShadow: 6, borderColor: 'primary.main' }, textDecoration: 'none' }}>
            <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ flex: 1 }}>
                        <Typography
                            variant="h6"
                            sx={{ fontWeight: 600 }}
                            component="div"
                            gutterBottom
                            dangerouslySetInnerHTML={{ __html: highlightText(law.title || law.lawNumber, search) }}
                        />
                        <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                            <Chip label={law.metadata?.type || 'Khác'} size="small" color="primary" />
                            <Chip label={formatDate(law.issuedDate)} size="small" />
                            <Chip label={`Số hiệu: ${law.lawNumber}`} size="small" />
                            {law.metadata?.issuer && <Chip label={law.metadata.issuer} size="small" />}
                        </Stack>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default LawCard; 