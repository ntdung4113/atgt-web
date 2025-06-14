import { useState, useEffect, useCallback } from 'react';
import { situationService } from '../../services/situationService';

export const useSituations = (initialPage = 1, limit = 9) => {
  const [situations, setSituations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [tags, setTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [tagsError, setTagsError] = useState(null);

  const fetchTags = useCallback(async () => {
    try {
      setTagsLoading(true);
      const tags = await situationService.getAllTags();
      setAvailableTags(tags);
      setTagsError(null);
    } catch (err) {
      setTagsError(err.message || 'Có lỗi xảy ra khi tải danh sách thẻ');
      setAvailableTags([]);
    } finally {
      setTagsLoading(false);
    }
  }, []);

  const fetchSituations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await situationService.getSituations({
        page,
        status: 'approved',
        limit,
        tags
      });
      setSituations(response.data);
      setTotalPages(Math.ceil(response.total / response.limit));
      setError(null);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tải danh sách bài viết');
    } finally {
      setLoading(false);
    }
  }, [page, tags, limit]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  useEffect(() => {
    fetchSituations();
  }, [fetchSituations]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleTagChange = (event, newValue) => {
    setTags(newValue);
    setPage(1);
  };

  return {
    situations,
    loading,
    error,
    page,
    totalPages,
    tags,
    availableTags,
    tagsLoading,
    tagsError,
    handlePageChange,
    handleTagChange,
    fetchSituations
  };
};