import React, { useState } from 'react';
import {
  Box,
  Chip,
  Grid,
  Typography,
  Pagination,
  CircularProgress,
  Alert,
  TextField,
  Autocomplete
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SituationCard from '../../components/ui/Situation/SituationCard';
import VideoDialog from '../../components/ui/Situation/VideoDialog';
import { useSituations } from '../../components/hooks/useSituations';

const SearchContainer = styled(Box)(({ theme }) => ({
  maxWidth: 600,
  margin: '0 auto',
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  background: '#f9f9f9',
  borderRadius: 8,
  boxShadow: theme.shadows[1]
}));

const SituationList = () => {
  const {
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
    handleTagChange
  } = useSituations();
  const [openVideo, setOpenVideo] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const handleOpenVideo = (videoUrl) => {
    setSelectedVideo(videoUrl);
    setOpenVideo(true);
  };

  const handleCloseVideo = () => {
    setOpenVideo(false);
    setSelectedVideo(null);
  };

  if (loading && situations.length === 0 && !error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', py: 4, background: '#fff' }}>
      <Typography
        variant="h4"
        gutterBottom
        align="center"
        sx={{ color: 'primary.main', fontWeight: 700, mb: 3, letterSpacing: 1 }}
      >
        Tình huống giao thông
      </Typography>
      <SearchContainer>
        <Autocomplete
          multiple
          id="tags-search"
          options={availableTags || []}
          value={tags}
          onChange={handleTagChange}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="Tìm kiếm theo thẻ"
              placeholder="Chọn thẻ..."
              fullWidth
            />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => {
              const { key, ...tagProps } = getTagProps({ index });
              return (
                <Chip
                  key={key}
                  variant="outlined"
                  label={option}
                  size="small"
                  {...tagProps}
                />
              );
            })}
          loading={tagsLoading}
          disabled={tagsLoading || !!tagsError}
          fullWidth
          sx={{ bgcolor: 'white', borderRadius: 1 }}
        />
        {tagsError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {tagsError}
          </Alert>
        )}
      </SearchContainer>
      {error && (
        <Alert severity="error" sx={{ mb: 2, maxWidth: 600, mx: 'auto' }}>
          {error}
        </Alert>
      )}
      {situations.length === 0 && !loading && !error && (
        <Alert severity="info" sx={{ mb: 2, maxWidth: 600, mx: 'auto' }}>
          Không tìm thấy bài viết nào phù hợp với tiêu chí tìm kiếm.
        </Alert>
      )}
      <Grid
        container
        spacing={3}
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr 1fr',
            md: '1fr 1fr 1fr',
            lg: '1fr 1fr 1fr 1fr'
          },
          gap: 3
        }}
      >
        {situations.map((situation) => (
          <Box key={situation._id} sx={{ display: 'flex', justifyContent: 'center' }}>
            <SituationCard situation={situation} onVideoClick={handleOpenVideo} />
          </Box>
        ))}
      </Grid>
      {totalPages > 1 && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
            size="large"
          />
        </Box>
      )}
      <VideoDialog
        open={openVideo}
        onClose={handleCloseVideo}
        videoUrl={selectedVideo}
      />
    </Box>
  );
};

export default SituationList;