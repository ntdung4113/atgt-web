import React, { useEffect, useState } from 'react';
import { fetchViolations, fetchViolationFilters, VEHICLE_TYPE_ORDER, TOPIC_ORDER } from '../services/violationService';
import { Box, Typography, TextField, MenuItem, Select, FormControl, InputLabel, Pagination, Card, CardContent, Chip, Stack } from '@mui/material';

const LIMIT = 10;

function useViolationFilters() {
    const [vehicleTypes, setVehicleTypes] = useState([]);
    const [topics, setTopics] = useState([]);
    useEffect(() => {
        fetchViolationFilters().then(data => {
            // Sắp xếp vehicleTypes theo VEHICLE_TYPE_ORDER, các loại khác cho vào cuối
            const sortedVehicleTypes = [...VEHICLE_TYPE_ORDER];
            (data.vehicle_types || []).forEach(type => {
                if (!sortedVehicleTypes.includes(type)) sortedVehicleTypes.push(type);
            });
            setVehicleTypes(sortedVehicleTypes.filter(type => (data.vehicle_types || []).includes(type)));
            // Sắp xếp topics theo TOPIC_ORDER, các chủ đề khác cho vào cuối
            const sortedTopics = [...TOPIC_ORDER];
            (data.topics || []).forEach(tp => {
                if (!sortedTopics.includes(tp)) sortedTopics.push(tp);
            });
            setTopics(sortedTopics.filter(tp => (data.topics || []).includes(tp)));
        });
    }, []);
    return { vehicleTypes, topics };
}

const ViolationList = () => {
    const [vehicleType, setVehicleType] = useState('');
    const [topic, setTopic] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [violations, setViolations] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const { vehicleTypes, topics } = useViolationFilters();

    useEffect(() => {
        setLoading(true);
        fetchViolations({ vehicle_type: vehicleType, topic, search, page, limit: LIMIT })
            .then(data => {
                setViolations(data.data || []);
                setTotalPages(data.totalPages || 1);
            })
            .finally(() => setLoading(false));
    }, [vehicleType, topic, search, page]);

    const handleVehicleTypeChange = (e) => {
        setVehicleType(e.target.value);
        setPage(1);
    };
    const handleTopicChange = (e) => {
        setTopic(e.target.value);
        setPage(1);
    };
    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };
    const handlePageChange = (e, value) => setPage(value);

    return (
        <Box sx={{ maxWidth: 1000, mx: 'auto', px: 2, py: 3 }}>
            <Typography variant="h4" gutterBottom fontWeight={700} color="primary.main">Danh sách vi phạm giao thông</Typography>
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
            {loading ? (
                <Typography>Đang tải...</Typography>
            ) : violations.length === 0 ? (
                <Typography>Không có vi phạm nào.</Typography>
            ) : (
                <Box>
                    {violations.map((violation, idx) => (
                        <Card key={idx} sx={{ mb: 2, boxShadow: 2, borderRadius: 2 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {violation.violation_name}
                                </Typography>
                                <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                                    <Chip label={violation.vehicle_type} size="small" color="primary" />
                                    <Chip label={violation.topic} size="small" />
                                </Stack>
                                <Typography variant="body2" sx={{ mt: 1 }}><b>Mức phạt:</b> {violation.fine}</Typography>
                                {violation.additional_penalty && violation.additional_penalty !== 'N/A' && (
                                    <Typography variant="body2"><b>Xử phạt bổ sung:</b> {violation.additional_penalty}</Typography>
                                )}
                                {violation.other_penalty && violation.other_penalty !== 'N/A' && (
                                    <Typography variant="body2"><b>Khác:</b> {violation.other_penalty}</Typography>
                                )}
                                {violation.remedial_measures && violation.remedial_measures !== 'N/A' && (
                                    <Typography variant="body2"><b>Biện pháp khắc phục:</b> {violation.remedial_measures}</Typography>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
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