import { NextResponse } from "next/server";
import { analyzeWithNova } from "@/lib/nova";
import { sendApiDownAlert } from "@/lib/mailer";

function analyzeStressFallback(message: string, context: string) {
  const text = message.toLowerCase();

  const highStressWords = [
    "overwhelmed",
    "anxious",
    "panic",
    "stressed",
    "too much",
    "can't",
    "cannot",
    "freaking out",
    "i'm scared",
    "i am scared",
    "nervous",
    "i don't think i can",
  ];

  const mediumStressWords = [
    "worried",
    "busy",
    "not sure",
    "uncertain",
    "pressure",
    "hard",
    "concerned",
    "late",
    "struggling",
  ];

  let score = 0;

  for (const word of highStressWords) {
    if (text.includes(word)) score += 2;
  }

  for (const word of mediumStressWords) {
    if (text.includes(word)) score += 1;
  }

  let stressLevel = "Low";
  let pressureType = "General Pressure";
  let calmMode = false;
  let rewrittenMessage = message;
  let supportMessage =
    "Your message appears calm and manageable. Normal mode is active.";

  if (context === "school") {
    pressureType = "Academic Pressure";
  } else if (context === "social") {
    pressureType = "Social Overload";
  } else {
    pressureType = "Workload Anxiety";
  }

  if (score >= 4) {
    stressLevel = "High";
    calmMode = true;
    supportMessage =
      "Your message shows strong signs of pressure, so Calm Mode has been activated.";

    if (context === "school") {
      rewrittenMessage =
        "I’m feeling a bit overwhelmed at the moment and may need a little more time. Would it be possible to extend the deadline?";
    } else if (context === "social") {
      rewrittenMessage =
        "I’m feeling a little overwhelmed right now, so I may not be able to respond fully at the moment. Thank you for understanding.";
    } else {
      rewrittenMessage =
        "I’m currently managing a heavy workload and may need a little more time to complete this. Would tomorrow work?";
    }
  } else if (score >= 2) {
    stressLevel = "Medium";
    calmMode = true;
    supportMessage =
      "Your message suggests some pressure, so a lighter Calm Mode has been activated.";

    if (context === "school") {
      rewrittenMessage =
        "I’m working through a few things right now and may need a bit more time to complete this. Thank you for your patience.";
    } else if (context === "social") {
      rewrittenMessage =
        "I’m a little occupied right now, but I’ll get back to you as soon as I can.";
    } else {
      rewrittenMessage =
        "I’m handling a few priorities at the moment and may need slightly more time to finish this task.";
    }
  } else {
    stressLevel = "Low";
    calmMode = false;
    supportMessage =
      "Your message appears calm and manageable. Normal mode is active.";

    if (context === "school") {
      rewrittenMessage = "I’m working on this and will share an update soon.";
    } else if (context === "social") {
      rewrittenMessage = "Thanks for your message — I’ll get back to you shortly.";
    } else {
      rewrittenMessage = "I’m working on this and will update you shortly.";
    }
  }

  return {
    stressLevel,
    pressureType,
    calmMode,
    rewrittenMessage,
    supportMessage,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, context } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    try {
      const result = await analyzeWithNova(message, context || "work");
      console.log("Nova success");
      return NextResponse.json({
  ...result,
  calmMode: result.calmMode ?? true
});
    } catch (novaError) {
      console.error("Nova failed, using fallback:", novaError);
      const errorMessage = novaError instanceof Error ? novaError.message : String(novaError);
      const isApiDown =
        /Nova API error: [45]\d\d/.test(errorMessage) ||
        errorMessage.includes("fetch failed") ||
        errorMessage.includes("ECONNREFUSED") ||
        errorMessage.includes("ENOTFOUND");
      if (isApiDown) sendApiDownAlert(errorMessage).catch(console.error);

      const fallbackResult = analyzeStressFallback(message, context || "work");

      return NextResponse.json({
        ...fallbackResult,
        supportMessage:
          fallbackResult.supportMessage + " (Fallback mode was used.)",
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong while analyzing the message." },
      { status: 500 }
    );
  }
}