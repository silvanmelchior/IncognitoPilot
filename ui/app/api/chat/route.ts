import { NextRequest, NextResponse } from "next/server";
import { LLMException, Message } from "@/llm/base";
import { chat as gptChat } from "@/llm/gpt";

const DEFAULT_MODEL = "gpt:gpt-4";

function getLLM() {
  const setting = process.env.LLM ?? DEFAULT_MODEL;
  if (setting.startsWith("gpt:")) {
    return gptChat(setting.slice(4));
  }
  throw new LLMException("Invalid LLM setting");
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<Message> | Response> {
  try {
    const history = (await request.json()) as Message[];
    const chat = getLLM();
    const response = await chat(history);
    return NextResponse.json(response);
  } catch (e) {
    if (e instanceof LLMException) {
      return new Response(e.message, { status: 500 });
    }
    throw e;
  }
}
