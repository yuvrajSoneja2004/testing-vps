import express, { Request, Response } from "express";
import { uploadVideo } from "../controllers/video/video.controller";
import { upload, uploadThumbnail } from "../middleware/upload.middleware";
import { generateThumbnails } from "../controllers/video/generateThumbnail.controller";
import cors from "cors";
import { getVideos } from "../controllers/video/getVideos.controller";
import { getMetaData } from "../controllers/video/getMetaData.controller";
import { getUpNextVideos } from "../controllers/video/getUpNextVideos.controller";
import { getChannelVideos } from "../controllers/video/getChannelVideos.controller";
import { likeVideo } from "../controllers/video/likeVideo.controller";
import { updateVideoWatchedDuration } from "../controllers/video/updateVideoWatchedDuration.controller";
import { getUserLikedVideos } from "../controllers/video/getUserLikedVideos.controller";

const router = express.Router();

// Serve static files from the 'tempHLS' directory
router.use("/videos", express.static("tempHLS"));
router.use("/tempThumbnails", express.static("tempThumbnails"));

/**
 * @swgetagger
 * /getVideos:
 *   :
 *     summary: Get a list of videos
 *     tags: [Videos]
 */
router.post("/getVideos", getVideos as any);
//test
/**
 * @swagger
 * /getChannelVideos/{channelId}:
 *   get:
 *     summary: Get videos for a specific channel by channel ID
 *     tags: [Videos]
 *     parameters:
 *       - name: channelId
 *         in: path
 *         required: true
 *         description: ID of the channel
 *         schema:
 *           type: string
 */
router.get("/getChannelVideos/:channelId", getChannelVideos as any);

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload a video file
 *     tags: [Videos]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 */
router.post("/upload", upload.single("video"), uploadVideo as any);

/**
 * @swagger
 * /generate-thumbnails:
 *   post:
 *     summary: Generate thumbnails for an uploaded video
 *     tags: [Videos]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 */
router.post(
  "/generate-thumbnails",
  uploadThumbnail.single("video"),
  generateThumbnails as any
);

/**
 * @swagger
 * /getMetaData/{videoUrlId}:
 *   get:
 *     summary: Get metadata for a specific video by video URL ID
 *     tags: [Videos]
 *     parameters:
 *       - name: videoUrlId
 *         in: path
 *         required: true
 *         description: URL ID of the video
 *         schema:
 *           type: string
 */
router.get("/getMetaData/:videoUrlId", getMetaData as any);

/**
 * @swagger
 * /getUpNextSuggestions/{videoUrlId}:
 *   get:
 *     summary: Get suggestions for the next videos to watch
 *     tags: [Videos]
 *     parameters:
 *       - name: videoUrlId
 *         in: path
 *         required: true
 *         description: URL ID of the video
 *         schema:
 *           type: string
 */
router.get("/getUpNextSuggestions/:videoUrlId", getUpNextVideos as any);

/**
 * @swagger
 * /updateVideoWatchedDuration/{userId}:
 *   put:
 *     summary: Update the watched duration for a video
 *     tags: [Videos]
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: ID of the user
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               duration:
 *                 type: number
 *                 description: Watched duration in seconds
 */
router.put(
  "/updateVideoWatchedDuration/:userId",
  updateVideoWatchedDuration as any
);

/**
 * @swagger
 * /likeVideo:
 *   post:
 *     summary: Like a video
 *     tags: [Videos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               videoId:
 *                 type: string
 *                 description: ID of the video to like
 */
router.post("/likeVideo", likeVideo as any);
router.get("/getUserLikedVideos/:userId", getUserLikedVideos as any);

export default router;
