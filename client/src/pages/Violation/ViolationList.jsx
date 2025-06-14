import React from 'react';
import { Box, Typography, TextField, MenuItem, Select, FormControl, InputLabel, Pagination, Stack } from '@mui/material';
import ViolationCard from '../../components/ui/Violation/ViolationCard';
import { useViolations } from '../../components/hooks/useViolations';

const ViolationList = () => {
    const {
        vehicleType,
        topic,
        search,
        page,
        setPage,
        vehicleTypes,
        topics,
        violations,
        totalPages,
        isLoading,
        handleVehicleTypeChange,
        handleTopicChange,
        handleSearchChange
    } = useViolations();

    return (
        <Box sx={{ maxWidth: 1000, mx: 'auto', px: 2, py: 3 }}>
            <Typography variant="h4" gutterBottom fontWeight={700} color="primary.main">
                Danh sách vi phạm giao thông
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                <FormControl sx={{ minWidth: 180 }} size="small">
                    <InputLabel>Loại phương tiện</InputLabel>
                    <Select value={vehicleType} label="Loại phương tiện" onChange={handleVehicleTypeChange}>
                        <MenuItem value="">Tất cả</MenuItem>
                        {vehicleTypes.map(type => (
                            <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl sx={{ minWidth: 180 }} size="small">
                    <InputLabel>Chủ đề</InputLabel>
                    <Select value={topic} label="Chủ đề" onChange={handleTopicChange}>
                        <MenuItem value="">Tất cả</MenuItem>
                        {topics.map(tp => (
                            <MenuItem key={tp} value={tp}>{tp}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                    size="small"
                    label="Tìm kiếm tên vi phạm"
                    value={search}
                    onChange={handleSearchChange}
                    sx={{ flex: 1 }}
                />
            </Stack>
            {isLoading ? (
                <Typography>Đang tải...</Typography>
            ) : violations.length === 0 ? (
                <Typography>Không có vi phạm nào.</Typography>
            ) : (
                <Box>
                    {violations.map((violation, idx) => (
                        <ViolationCard key={idx} violation={violation} />
                    ))}
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(e, value) => setPage(value)}
                        sx={{ mt: 2, display: totalPages > 1 ? 'flex' : 'none', justifyContent: 'center' }}
                        color="primary"
                        shape="rounded"
                        size="large"
                    />
                </Box>
            )}
        </Box>
    );
};

export default ViolationList; 