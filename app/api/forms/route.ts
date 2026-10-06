import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper function to resolve forms.gle shortened URLs to full Google Form URLs
async function resolveGoogleFormUrl(inputUrl: string): Promise<string> {
  let url = inputUrl.trim();

  // If it's a shortened link (forms.gle), expand it
  if (url.includes("forms.gle") || !url.includes("docs.google.com")) {
    try {
      const response = await fetch(url, {
        method: "GET",
        redirect: "follow",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });
      url = response.url; // Resolved full URL
    } catch (error) {
      console.warn("Could not resolve shortened URL, attempting with original URL:", error);
    }
  }

  return url;
}

export async function POST(req: Request) {
  try {
    const { url: rawUrl, userId } = await req.json();

    if (!rawUrl) {
      return NextResponse.json({ error: "Form URL is required" }, { status: 400 });
    }

    // 1. Unshorten forms.gle link if provided
    const resolvedUrl = await resolveGoogleFormUrl(rawUrl);

    console.log(`🔗 Input URL: ${rawUrl}`);
    console.log(`🎯 Resolved Full URL: ${resolvedUrl}`);

    // 2. Normalize viewform URL
    let cleanUrl = resolvedUrl;
    if (cleanUrl.includes("/viewform")) {
      cleanUrl = cleanUrl.split("?")[0];
    } else {
      cleanUrl = cleanUrl.replace(/\/$/, "") + "/viewform";
    }

    // Proceed with your existing form structure parsing logic...
    // ...

    return NextResponse.json({
      success: true,
      resolvedUrl: cleanUrl,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}