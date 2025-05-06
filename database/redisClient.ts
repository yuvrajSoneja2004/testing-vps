import Redis from "ioredis";

export const redisClient = new Redis({
  host: "singapore-keyvalue.render.com", // Extracted from your Redis URL
  port: 6379, // Default Redis port
  username: "default", // Render Redis default username
  password: "nmmoBclIuLOtiPv3dtpweMyVyqvn3wYP", // Your Redis password
  tls: {
    rejectUnauthorized: false, // Necessary for Render Redis
  },
});

// Handle connection events
redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

redisClient.on("error", (error) => {
  console.error("Redis connection error:", error);
});
