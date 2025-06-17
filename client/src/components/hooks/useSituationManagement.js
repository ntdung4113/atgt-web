import { useState, useEffect } from 'react';
import { situationService } from '../../services/situationService';
import { useSnackbar } from 'notistack';

export const useSituationManagement = () => {
    const [checkedSituations, setCheckedSituations] = useState([]);
    const [pendingVideos, setPendingVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pendingPage, setPendingPage] = useState(1);
    const [pendingTotalPages, setPendingTotalPages] = useState(1);
    const { enqueueSnackbar } = useSnackbar();

    const fetchCheckedSituations = async (params = {}) => {
        try {
            setLoading(true);
            const response = await situationService.getCheckedSituations({
                page,
                limit: 20,
                ...params
            });
            setCheckedSituations(response.data || []);
            setTotalPages(response.totalPages || Math.ceil(response.total / response.limit) || 1);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Có lỗi xảy ra');
            enqueueSnackbar(err.response?.data?.error || 'Có lỗi xảy ra', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingVideos = async (params = {}) => {
        try {
            const response = await situationService.getPendingSituations({
                page: pendingPage,
                limit: 10,
                ...params
            });
            setPendingVideos(response.data || []);
            setPendingTotalPages(response.totalPages || Math.ceil(response.total / response.limit) || 1);
        } catch (err) {
            enqueueSnackbar(err.response?.data?.error || 'Có lỗi xảy ra', { variant: 'error' });
        }
    };

    useEffect(() => {
        fetchCheckedSituations();
    }, [page]);

    useEffect(() => {
        fetchPendingVideos();
    }, [pendingPage]);

    const refetchAll = () => {
        fetchCheckedSituations();
        fetchPendingVideos();
    };

    const handleApprove = async (id) => {
        try {
            await situationService.updateStatus(id, 'approved');
            enqueueSnackbar('Đã duyệt video thành công', { variant: 'success' });
            refetchAll();
        } catch (err) {
            enqueueSnackbar(err.response?.data?.error || 'Có lỗi xảy ra', { variant: 'error' });
        }
    };

    const handleDecline = async (id) => {
        try {
            await situationService.updateStatus(id, 'declined');
            enqueueSnackbar('Đã từ chối video', { variant: 'success' });
            refetchAll();
        } catch (err) {
            enqueueSnackbar(err.response?.data?.error || 'Có lỗi xảy ra', { variant: 'error' });
        }
    };

    const handleUpdateTags = async (id, tags) => {
        try {
            await situationService.updateTags(id, tags);
            enqueueSnackbar('Đã cập nhật thẻ thành công', { variant: 'success' });
            refetchAll();
        } catch (err) {
            enqueueSnackbar(err.response?.data?.error || 'Có lỗi xảy ra', { variant: 'error' });
        }
    };

    const handleCollectVideo = async (groupUrl, cookiesFile, maxVideos, scrollTimeout) => {
        try {
            const result = await situationService.collectVideos(groupUrl, cookiesFile, maxVideos, scrollTimeout);
            enqueueSnackbar('Đã thu thập video thành công', { variant: 'success' });
            refetchAll();
            return result;
        } catch (err) {
            enqueueSnackbar(err.response?.data?.error || 'Có lỗi xảy ra', { variant: 'error' });
            throw err;
        }
    };

    const handleDelete = async (id) => {
        enqueueSnackbar('Chức năng xóa chưa được hỗ trợ', { variant: 'warning' });
    };

    return {
        situations: checkedSituations,
        loading,
        error,
        page,
        totalPages,
        setPage,
        pendingVideos,
        pendingPage,
        pendingTotalPages,
        setPendingPage,
        handleApprove,
        handleDecline,
        handleUpdateTags,
        handleCollectVideo,
        handleDelete
    };
}; 