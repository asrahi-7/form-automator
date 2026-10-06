import { Queue } from "bullmq";
import { connection } from "./redis";

// Create a queue named "form-submissions"
export const submissionQueue = new Queue("form-submissions", {
  connection,
});