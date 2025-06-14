import React from 'react';
import { Card, CardContent, Typography, Stack, Chip } from '@mui/material';

const ViolationCard = ({ violation }) => {
    return (
        <Card sx={{ mb: 2, boxShadow: 2, borderRadius: 2 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    {violation.violation_name}
                </Typography>
                <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                    <Chip label={violation.vehicle_type} size="small" color="primary" />
                    <Chip label={violation.topic} size="small" />
                </Stack>
                <Typography variant="body2" sx={{ mt: 1 }}>
                    <b>Mức phạt:</b> {violation.fine}
                </Typography>
                {violation.additional_penalty && violation.additional_penalty !== 'N/A' && (
                    <Typography variant="body2">
                        <b>Xử phạt bổ sung:</b> {violation.additional_penalty}
                    </Typography>
                )}
                {violation.other_penalty && violation.other_penalty !== 'N/A' && (
                    <Typography variant="body2">
                        <b>Khác:</b> {violation.other_penalty}
                    </Typography>
                )}
                {violation.remedial_measures && violation.remedial_measures !== 'N/A' && (
                    <Typography variant="body2">
                        <b>Biện pháp khắc phục:</b> {violation.remedial_measures}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};

export default ViolationCard; 