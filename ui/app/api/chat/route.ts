import { NextRequest, NextResponse } from "next/server";
import { LLMException, Message } from "@/llm/base";
import { chat } from "@/llm/gpt4";

export async function POST(
  request: NextRequest,
): Promise<NextResponse<Message> | Response> {
  try {
    const history = (await request.json()) as Message[];
    const response = await chat(history);
    return NextResponse.json(response);
  } catch (e) {
    if (e instanceof LLMException) {
      return new Response(e.message, { status: 500 });
    }
    throw e;
  }
}
