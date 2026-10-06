import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST() {
  try {
    const userDataDir = path.join(process.cwd(), "google_session");

    if (fs.existsSync(userDataDir)) {
      // Delete the stored persistent browser profile
      fs.rmSync(userDataDir, { recursive: true, force: true });
      return NextResponse.json({
        success: true,
        message: "Browser session cleared successfully. Next time the worker runs, it will request a fresh login.",
      });
    }

    return NextResponse.json({
      success: true,
      message: "No active browser session found to clear.",
    });
  } catch (error: any) {
    console.error("Clear Session Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to clear browser session" },
      { status: 500 }
    );
  }
}