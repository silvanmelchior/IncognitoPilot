import axios from "axios";
import { Message } from "@/llm/base";

const INTERPRETER_URL = process.env.NEXT_PUBLIC_INTERPRETER_URL

export async function chatCall(messages: Message[]): Promise<Message> {
  const response = await axios.post("/api/chat", messages)
  return response.data
}

export async function codeCall(code: string): Promise<string> {
  const response = await axios.post(INTERPRETER_URL + "/run", { code })
  return response.data.result
}
