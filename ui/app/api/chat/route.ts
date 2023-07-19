import { NextRequest, NextResponse } from "next/server";
import { Message } from "@/llm/base";
import { chat } from "@/llm/gpt4";


export async function POST(request: NextRequest): Promise<NextResponse<Message>> {
  const history = await request.json() as Message[];
  const response = await chat(history)
  return NextResponse.json(response);
}
