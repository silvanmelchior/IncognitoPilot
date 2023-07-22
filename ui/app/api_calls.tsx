import axios from "axios";
import { Message } from "@/llm/base";

export async function chatCall(messages: Message[]): Promise<Message> {
  const response = await axios.post("/api/chat", messages)
  return response.data
}

export class Interpreter {
  private _ws: WebSocket | null = null

  private connect() {
    this._ws = new WebSocket(`ws://${process.env.NEXT_PUBLIC_INTERPRETER_URL}/run`);
    return new Promise((resolve, reject) => {
      this._ws!.onopen = () => {
        resolve()
      }
    })
  }

  private send(code: string) {
    return new Promise((resolve, reject) => {
      this._ws!.send(code)
      this._ws!.onmessage = (event) => {
        resolve(event.data);
      }
    })
  }

  run(code: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if(this._ws === null) {
        this.connect().then(() => {
          this.send(code).then(resolve)
        })
      } else {
        this.send(code).then(resolve)
      }
    })
  }

}
