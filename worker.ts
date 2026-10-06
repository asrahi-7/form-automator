import { Worker } from "bullmq";
import { connection } from "./lib/redis";
import { prisma } from "./lib/prisma";

console.log("🚀 Background Automation Worker Started...");

const worker = new Worker(
  "form-submissions",
  async (job) => {
    const { automationId } = job.data;
    console.log(`⚡ Processing Job ID: ${job.id} for Automation: ${automationId}`);

    // ১. ডাটাবেজ থেকে অটোমেশন ডাটা নেওয়া
    const automation = await prisma.automation.findUnique({
      where: { id: automationId },
      include: {
        form: true,
        answers: true,
      },
    });

    if (!automation) {
      console.error(`❌ Automation ${automationId} not found.`);
      return;
    }

    try {
      // ২. অটোমেশন স্ট্যাটাস IN_PROGRESS করা
      await prisma.automation.update({
        where: { id: automationId },
        data: { status: "IN_PROGRESS" },
      });

      console.log(`📝 Executing Form Submission for Form: ${automation.form.title}`);

      // TODO: এখানে আপনার Google Form Submit / API Submission Logic রান হবে।
      // উদাহরণ: fetch/axios দিয়ে গুগল ফর্মে পোস্ট রিকোয়েস্ট পাঠানো

      // ৩. সফল হলে স্ট্যাটাস COMPLETED করা
      await prisma.automation.update({
        where: { id: automationId },
        data: { status: "COMPLETED" },
      });

      console.log(`✅ Automation ${automationId} completed successfully!`);
    } catch (err: any) {
      console.error(`❌ Automation ${automationId} failed:`, err);

      await prisma.automation.update({
        where: { id: automationId },
        data: { status: "FAILED" },
      });
      throw err;
    }
  },
  { connection }
);

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed with error: ${err.message}`);
});