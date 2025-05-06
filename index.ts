import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import videoRoutes from "./routes/Video.route";
import userRoutes from "./routes/User.route";
import channelRoutes from "./routes/Channel.route";
import searchRoutes from "./routes/Search.route";
import commentRoutes from "./routes/Comment.routes";
import storyRoutes from "./routes/Story.routes";
import swaggerUi from "swagger-ui-express";
import { swaggerDocs } from "./utils/swaggerOptions";

const app: Express = express();
const port: number = process.env.PORT ? parseInt(process.env.PORT) : 3005;

// Middleware
app.use(cors());
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(compression());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Error handling middleware
interface Error {
  status?: number;
  message?: string;
}

// Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/video", videoRoutes);
app.use("/api/v1/channels", channelRoutes);
app.use("/api/v1/search", searchRoutes);
app.use("/api/v1/comment", commentRoutes);
app.use("/api/v1/story", storyRoutes);
// Middleware to serve Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
// Add more routes as needed

// Basic route
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Welcome to Express TypeScript API" });
});

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
