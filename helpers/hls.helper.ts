import Ffmpeg from "fluent-ffmpeg";
import { QUALITIES } from "../config/ffmpeg.config";
import { QualityKey } from "../types/hls.type";
import fs from "fs/promises";
import path from "path";
import { unlinkSync } from "fs";

class HLSService {
  static async createHLSForQuality(
    inputPath: string,
    outputDir: string,
    quality: QualityKey,
    FULL_FILE_NAME?: string,
    progressCallback?: (progress: number) => void // Add this
  ): Promise<void> {
    const preset = QUALITIES[quality];
  
    return new Promise<void>((resolve, reject) => {
      Ffmpeg(inputPath)
        .outputOptions([
          "-profile:v main",
          "-c:v h264",
          "-c:a aac",
          `-vf scale=${preset.resolution}`,
          `-b:v ${preset.bitrate}`,
          `-b:a ${preset.audioBitrate}`,
          "-hls_time 10",
          "-hls_list_size 0",
          "-hls_segment_filename",
          `${outputDir}/${quality}_%03d.ts`,
          "-f hls",
        ])
        .output(`${outputDir}/playlist.m3u8`)
        .on("progress", (progress) => {
          const percent = progress.percent || 0; // Ensure percent is always a number
          if (progressCallback) {
            progressCallback(percent); // Call the progress callback
          }
        })
        .on("end", async () => {
          if (FULL_FILE_NAME) {
            const removeMainFile = path.join(outputDir, "..", FULL_FILE_NAME);
  
            try {
              await fs.unlink(removeMainFile);
              console.log(`Successfully deleted file: ${removeMainFile}`);
            } catch (err: any) {
              console.error(`Error deleting file: ${err.message}`);
            }
          }
          resolve();
        })
        .on("error", (err: Error) => reject(err))
        .run();
    });
  }
  

  static createMasterPlaylist(
    videoId: string,
    qualities: QualityKey[]
  ): string {
    const content =
      "#EXTM3U\n" +
      "#EXT-X-VERSION:3\n" +
      qualities
        .map((quality) => {
          const preset = QUALITIES[quality];
          const resolution = preset.resolution.split("x");
          return `#EXT-X-STREAM-INF:BANDWIDTH=${parseInt(
            preset.bitrate
          )}000,RESOLUTION=${preset.resolution}\n${quality}/playlist.m3u8`;
        })
        .join("\n");

    return content;
  }

  /**
   * Process a video into multiple HLS qualities
   * @param inputPath - Path to the input video file
   * @param outputDir - Base directory for HLS output
   * @param qualities - Array of quality preset keys to process
   * @returns Promise that resolves when all qualities are processed
   */
  static async processVideo(
    inputPath: string,
    outputDir: string,
    qualities: QualityKey[] = Object.keys(QUALITIES) as QualityKey[]
  ): Promise<void> {
    try {
      // Process all qualities in parallel
      await Promise.all(
        qualities.map((quality) => {
          const qualityDir = path.join(outputDir, quality);
          return fs
            .mkdir(qualityDir, { recursive: true })
            .then(() =>
              this.createHLSForQuality(inputPath, qualityDir, quality)
            );
        })
      );

      // Create master playlist
      const masterPlaylist = this.createMasterPlaylist(
        outputDir.split("/").pop() || "video",
        qualities
      );

      // Write master playlist to file
      await fs.writeFile(path.join(outputDir, "master.m3u8"), masterPlaylist);
    } catch (error: any) {
      throw new Error(`Failed to process video: ${error.message}`);
    }
  }
}

export default HLSService;
