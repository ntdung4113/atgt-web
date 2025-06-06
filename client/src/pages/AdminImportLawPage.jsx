import React from 'react';
import AdminImportLaw from '../components/admin/AdminImportLaw';
import AdminImportLawFromUrl from '../components/admin/AdminImportLawFromUrl';
import { Box, Divider } from '@mui/material';

function AdminImportLawPage() {
    return (
        <Box>
            <AdminImportLaw />
            <Divider sx={{ my: 4 }} />
            <AdminImportLawFromUrl />
        </Box>
    );
}

export default AdminImportLawPage; 