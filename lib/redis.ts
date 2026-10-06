import { Redis } from "ioredis";

export const connection = new Redis(process.env.REDIS_URL as string, {
  maxRetriesPerRequest: null,
  tls: { rejectUnauthorized: false }, // Helps connect securely to Upstash
  family: 4, // Forces IPv4, preventing the ECONNRESET freeze
});