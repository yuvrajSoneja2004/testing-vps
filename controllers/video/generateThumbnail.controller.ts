import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";

export const generateThumbnails = async (req: Request, res: Response) => {
  try {
    // Check if the file is uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    

    const videoPath = req.file.path;
    const outputDir = path.join(__dirname, "../../tempThumbnails");

    // Create thumbnails directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Use ffmpeg to generate thumbnails
    ffmpeg(videoPath)
      .on("filenames", (filenames) => {
        console.log("Will generate thumbnails:", filenames.join(", "));
      })
      .on("end", () => {
        console.log("Thumbnails generated");

        // Read generated thumbnails and send them back to the client
        fs.readdir(outputDir, (err, files) => {
          if (err) {
            return res.status(500).json({ error: "Failed to read thumbnails" });
          }

          const thumbnails = files.map((file) => `/tempThumbnails/${file}`);
          res.json(thumbnails);
        });
      })
      .on("error", (err) => {
        console.error("Error generating thumbnails:", err);
        return res.status(500).json({ error: "Failed to generate thumbnails" });
      })
      .screenshots({
        count: 3, // Number of thumbnails to generate
        folder: outputDir,
        size: "320x200",
        filename: "thumbnail-%i.png", // Thumbnails will be named like 'thumbnail-1.png'
      });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
