import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";

interface ConvertToGifOptions {
  videoPath: string;
  outputDir: string;
  duration?: number; // Optional duration parameter in seconds (default: 3 seconds)
  fps?: number; // Optional frame rate (default: 10)
  width?: number; // Optional width for scaling (default: 320)
  height?: number; // Optional height for scaling (default: 240)
}

export const convertToGif = async ({
  videoPath,
  outputDir,
  duration = 3,
  fps = 8,
  width = 320,
  height = 240,
}: ConvertToGifOptions): Promise<string> => {
  const IMGBB_API_KEY = "1860dbb564356e69f87167f8d4c2785c"; // Replace with your ImgBB API key

  const gifPath = path.join(outputDir, `${Date.now()}-output.gif`);

  // Get video duration to set a random start point
  const videoDuration = await new Promise<number>((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) reject(err);
      else resolve(metadata.format.duration || 0);
    });
  });

  // Ensure the start time leaves at least 3 seconds from the end of the video
  const maxStartTime = Math.max(0, videoDuration - duration);
  const startTime = Math.random() * maxStartTime;

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .setStartTime(startTime.toFixed(2)) // Start from a random position
      .duration(duration)
      .outputOptions([
        `-vf scale=${width}:${height}`, // Resize for smaller GIF
        `-r ${fps}`, // Lower frame rate
        "-preset slow", // Use slow preset for better compression
        "-crf 30", // Lower quality slightly for smaller size
        "-f gif", // Set output format to GIF
      ])
      .output(gifPath)
      .on("end", async () => {
        // Cleanup original video file
        fs.unlink(videoPath, (err) => {
          if (err) console.error("Error deleting original video:", err);
        });

        try {
          // Prepare form data for uploading the GIF as binary
          const formData = new FormData();
          formData.append("key", IMGBB_API_KEY);
          formData.append("image", fs.createReadStream(gifPath));

          // Upload to ImgBB
          const response = await axios.post(
            "https://api.imgbb.com/1/upload",
            formData,
            {
              headers: formData.getHeaders(),
            }
          );

          // Cleanup local GIF file after uploading
          fs.unlink(gifPath, (err) => {
            if (err) console.error("Error deleting generated GIF:", err);
          });
          console.log(response.data.data.url);
          // Resolve with the URL of the uploaded GIF
          resolve(response.data.data.url);
        } catch (error) {
          console.error("Error uploading GIF to ImgBB:", error);
          reject(new Error("Error uploading GIF to ImgBB"));
        }
      })
      .on("error", (err) => {
        console.error("Error processing video:", err);
        reject(new Error("Error processing video"));
      })
      .run();
  });
};
