import { Request, Response } from "express";
import { PRISMA_CLIENT } from "../../database/prismaClient";

interface PaginatedRequest extends Request {
  query: {
    page?: string;
    limit?: string;
    userId?: string;
  };
}

export const getVideos = async (req: PaginatedRequest, res: Response) => {
  try {
    // Get pagination parameters from query
    const page = parseInt(req.query.page || "0");
    const limit = parseInt(req.query.limit || "8");
    const currentCategory = req.body.params.category;
    const userId = req.body.params.userId;
    console.log("userId", req.body);
    const skip = page * limit;

    console.log("currentCategory", currentCategory);

    // Get videos with pagination
    const [videos, totalCount] = await Promise.all([
      PRISMA_CLIENT.video.findMany({
        skip,
        take: limit,
        where: {
          category: currentCategory,
        },
        include: {
          channel: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc", // Assuming you have a createdAt field
        },
      }),
      PRISMA_CLIENT.video.count(), // Get total count of videos
    ]);
    console.log("userId", userId);
    // Calculate if there are more videos
    const hasMore = skip + videos.length < totalCount;
    const userWatchedDurations = await PRISMA_CLIENT.user.findFirst({
      where: {
        userId: userId,
      },
      select: {
        watchedVideosDurations: true,
      },
    });

    console.log("Disco", userWatchedDurations);

    res.status(200).json({
      videos,
      userWatchedDurations,
      totalCount,
      hasMore,
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({
      message: "Failed to fetch videos",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// You might also want to add types for your video data
export interface Video {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  createdAt: Date;
  channel: {
    id: string;
    name: string;
    // Add other channel fields you need
  };
  // Add other video fields you have
}
