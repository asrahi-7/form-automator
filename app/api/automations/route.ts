import { NextResponse } from "next/server";
import { Queue } from "bullmq";
import { connection } from "@/lib/redis";
import { prisma } from "@/lib/prisma";

const submissionQueue = new Queue("form-submissions", { connection });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      formId,
      cronExpression,
      scheduledAt,
      scheduledTime,
      timezone,
      answers,
    } = body;

    if (!formId) {
      return NextResponse.json(
        { error: "Form ID is required" },
        { status: 400 }
      );
    }

    // 1. Fetch the Form from the DB to get the owner userId & form structure
    const form = await prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      return NextResponse.json(
        { error: "Form not found" },
        { status: 404 }
      );
    }

    // 2. Map question ID -> questionType from the form structure
    const questionTypeMap: Record<string, string> = {};
    if (form.structure) {
      try {
        const parsedStructure =
          typeof form.structure === "string"
            ? JSON.parse(form.structure)
            : form.structure;

        const questions = Array.isArray(parsedStructure)
          ? parsedStructure
          : parsedStructure?.fields || parsedStructure?.questions || [];

        if (Array.isArray(questions)) {
          questions.forEach((q: any) => {
            const id = q.id || q.questionId;
            if (id) {
              questionTypeMap[String(id)] = q.type || q.questionType || "TEXT";
            }
          });
        }
      } catch (e) {
        console.warn("Could not parse form structure:", e);
      }
    }

    // 3. Format answers to match Prisma's required schema (questionId, questionType, value)
    const formattedAnswers = Object.entries(answers || {}).map(
      ([questionId, val]) => {
        let stringVal = "";
        if (typeof val === "string") {
          stringVal = val;
        } else if (val !== null && val !== undefined) {
          stringVal =
            typeof val === "object" ? JSON.stringify(val) : String(val);
        }

        return {
          questionId: String(questionId),
          questionType: questionTypeMap[String(questionId)] || "TEXT",
          value: stringVal,
        };
      }
    );

    // 4. Ensure 'name' is never undefined or empty
    const safeName =
      name && typeof name === "string" && name.trim() !== ""
        ? name.trim()
        : "Scheduled Form Submission";

    // 5. Calculate precise delay in milliseconds from future target time
    const rawTargetTime =
      scheduledAt || scheduledTime || cronExpression || new Date().toISOString();
    const targetTimeMs = new Date(rawTargetTime).getTime();
    const currentTimeMs = Date.now();
    const delayMs = Math.max(0, targetTimeMs - currentTimeMs);

    console.log(`📅 Target Scheduled Time: ${new Date(targetTimeMs).toISOString()}`);
    console.log(`⏱ Scheduled Delay: ${Math.round(delayMs / 1000)} seconds (${Math.round(delayMs / 60000)} minutes)`);

    // 6. Create Automation record in Prisma DB
    const automation = await prisma.automation.create({
      data: {
        name: safeName,
        userId: form.userId,
        formId: form.id,
        status: "PENDING",
        cronExpression: new Date(targetTimeMs).toISOString(),
        timezone: timezone || "Asia/Dhaka",
        answers: {
          create: formattedAnswers,
        },
      },
    });

    // 7. Add job to BullMQ Queue with calculated delay and RETRY logic
await submissionQueue.add(
  "form-submissions",
  { automationId: automation.id },
  {
    delay: delayMs,
    removeOnComplete: true,
    removeOnFail: false, // Keep failed jobs in Redis so we can inspect them
    attempts: 3, // Retry up to 3 times if it fails
    backoff: {
      type: "exponential",
      delay: 5000, // Wait 5s, then 25s, then 125s before retrying
    },
  }
);

    return NextResponse.json({
      success: true,
      automationId: automation.id,
      scheduledFor: new Date(targetTimeMs).toLocaleString(),
      delayInSeconds: Math.round(delayMs / 1000),
    });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error?.message || "Something went wrong while saving automation." },
      { status: 500 }
    );
  }
}