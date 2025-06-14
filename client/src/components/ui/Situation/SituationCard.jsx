import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Button,
  Stack,
  Link,
  Box
} from '@mui/material';
import { styled } from '@mui/material/styles';
import FacebookIcon from '@mui/icons-material/Facebook';

const StyledCard = styled(Card)(({ theme }) => ({
  width: 300,
  minHeight: 380,
  borderRadius: 12,
  boxShadow: theme.shadows[1],
  border: '1px solid #eee',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  transition: 'box-shadow 0.2s, border 0.2s, transform 0.2s',
  background: '#fff',
  cursor: 'pointer',
  '&:hover': {
    boxShadow: theme.shadows[4],
    borderColor: theme.palette.primary.main,
    transform: 'translateY(-4px) scale(1.02)'
  }
}));

const ThumbnailBox = styled(Box)(({ theme }) => ({
  width: 260,
  height: 160,
  borderRadius: 10,
  overflow: 'hidden',
  background: '#000',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: theme.spacing(1.5),
  marginBottom: theme.spacing(1),
  boxShadow: theme.shadows[2]
}));

const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: 12,
  background: '#000'
}));

const AuthorLink = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  color: theme.palette.primary.main,
  textDecoration: 'none',
  marginBottom: theme.spacing(1),
  fontWeight: 500,
  '&:hover': {
    textDecoration: 'underline'
  }
}));

const ContentText = styled(Typography)(({ theme }) => ({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  height: '4.2em',
  lineHeight: '1.4em',
  marginBottom: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.primary,
  fontSize: '0.9rem'
}));

const TagsContainer = styled(Stack)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  minHeight: '28px',
  flexWrap: 'wrap',
  gap: theme.spacing(0.5),
  justifyContent: 'center'
}));

const ActionButton = styled(Button)(({ theme }) => ({
  height: '40px',
  textTransform: 'none',
  fontSize: '0.9rem',
  marginTop: theme.spacing(1.5),
  borderRadius: 6,
  fontWeight: 600
}));

const SituationCard = ({ situation, onVideoClick }) => {
  return (
    <StyledCard>
      <ThumbnailBox onClick={() => onVideoClick(situation.video_url)}>
        <StyledCardMedia
          component="img"
          image={situation.thumbnail_url || '/placeholder.jpg'}
          alt={situation.content || 'Bài viết'}
          loading="lazy"
        />
      </ThumbnailBox>
      <CardContent sx={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
        <AuthorLink
          href={situation.author?.link || '#'}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FacebookIcon fontSize="small" />
          <Typography variant="body2">
            {situation.author?.name || 'Ẩn danh'}
          </Typography>
        </AuthorLink>
        <ContentText variant="body2">
          {situation.content || 'Không có nội dung'}
        </ContentText>
        <TagsContainer direction="row" useFlexGap>
          {situation.tags?.length > 0 ? (
            situation.tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                color="primary"
              />
            ))
          ) : (
            <Chip label="Không có thẻ" size="small" />
          )}
        </TagsContainer>
        <ActionButton
          variant="contained"
          color="primary"
          fullWidth
          href={`https://facebook.com/${situation.situation_id}`}
          target="_blank"
          rel="noopener noreferrer"
          disabled={!situation.situation_id}
        >
          Xem bài viết
        </ActionButton>
      </CardContent>
    </StyledCard>
  );
};

export default SituationCard;