import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/inngest/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, message, tier = "free" } = body;

    if (!projectId || !message) {
      return NextResponse.json(
        { error: "Missing projectId or message" },
        { status: 400 }
      );
    }

    // Determine which function to call based on tier
    const eventName =
      tier === "free" ? "free-tier-code-agent/run" : "code-agent/run";

    console.log(`Triggering ${tier} tier agent for project ${projectId}`);

    // Send the event to Inngest
    const result = await inngest.send({
      name: eventName,
      data: {
        projectId,
        value: message,
      },
    });

    return NextResponse.json({
      success: true,
      eventId: result.ids[0],
      tier,
      message: `${
        tier === "free" ? "Free tier" : "Premium tier"
      } code agent triggered successfully`,
    });
  } catch (error) {
    console.error("Error triggering code agent:", error);
    return NextResponse.json(
      { error: "Failed to trigger code agent" },
      { status: 500 }
    );
  }
}

// Example usage:
// POST /api/code-agent
// Body: {
//   "projectId": "your-project-id",
//   "message": "Add a dark theme toggle button to the navbar",
//   "tier": "free" // or "premium"
// }
