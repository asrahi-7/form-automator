import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Queue } from "bullmq";
import { connection } from "@/lib/redis";

const submissionQueue = new Queue("form-submissions", { connection });

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Automation ID required" }, { status: 400 });
    }

    // 1. Remove scheduled job from BullMQ queue
    try {
      const job = await submissionQueue.getJob(`one-time-${id}`);
      if (job) {
        await job.remove();
      }
    } catch (qErr) {
      console.warn("Could not remove job from queue:", qErr);
    }

    // 2. Delete related records in database
    await prisma.automationAnswer.deleteMany({
      where: { automationId: id },
    });

    await prisma.executionLog.deleteMany({
      where: { automationId: id },
    });

    // 3. Delete automation
    await prisma.automation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Automation deleted successfully" });
  } catch (error: any) {
    console.error("Delete Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete automation" },
      { status: 500 }
    );
  }
}