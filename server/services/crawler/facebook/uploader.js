const cloudinary = require('../../../configs/cloudinaryConfig');

class UploadManager {
    static async uploadVideo(videoUrl, postId) {
        try {
            const videoResult = await cloudinary.uploader.upload(videoUrl, {
                resource_type: 'video',
                folder: 'videos_upload',
                public_id: `video_${postId}`,
                overwrite: false
            });

            const thumbnailUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload/videos_upload/video_${postId}.jpg`;

            return {
                video_url: videoResult.secure_url,
                thumbnail_url: thumbnailUrl
            };
        } catch (err) {
            console.error(`Lỗi khi upload lên Cloudinary: ${err.message}`);
            return null;
        }
    }
}

module.exports = UploadManager;