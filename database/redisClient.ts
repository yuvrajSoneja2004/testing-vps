import Redis from "ioredis";

export const redisClient = new Redis("rediss://red-cv3a1jrtq21c73bhr4cg:nmmoBclIuLOtiPv3dtpweMyVyqvn3wYP@singapore-keyvalue.render.com:6379", {
  tls: {
    rejectUnauthorized: false,
  },
});

redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

redisClient.on("error", (err) => {
  console.error("Redis connection error:", err);
});
