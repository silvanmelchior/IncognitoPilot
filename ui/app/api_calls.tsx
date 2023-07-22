import axios from "axios";
import { Message } from "@/llm/base";

export async function chatCall(messages: Message[]): Promise<Message> {
  const response = await axios.post("/api/chat", messages)
  return response.data
}

export class Interpreter {
  ws: WebSocket
  connected: boolean
  on_connection: Promise<void>

  constructor() {
    this.connected = false
    this.ws = new WebSocket(`ws://${process.env.NEXT_PUBLIC_INTERPRETER_URL}/run`);
    this.on_connection = new Promise((resolve, reject) => {
      this.ws.onopen = () => {
        this.connected = true
        resolve()
      }
    })
  }

  run(code: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if(this.connected) {
        this.ws.send(code);
      } else {
        this.on_connection.then(() => this.ws.send(code))
      }
      this.ws.onmessage = (event) => {
        resolve(event.data);
      }
    })
  }

}
