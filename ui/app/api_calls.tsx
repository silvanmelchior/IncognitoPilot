import axios, { AxiosError } from "axios";
import { Message } from "@/llm/base";

export async function chatCall(messages: Message[]): Promise<Message> {
  try {
    const response = await axios.post("/api/chat", messages);
    return response.data;
  } catch (e) {
    if (e instanceof AxiosError) {
      const msg = e.response?.data;
      if (msg !== undefined && msg !== "") {
        throw new Error(msg);
      }
    }
    throw e;
  }
}

export class Interpreter {
  private _ws: WebSocket | null = null;

  private connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const interpreterUrl = process.env.NEXT_PUBLIC_INTERPRETER_URL;
      if (interpreterUrl === undefined) {
        reject(Error("NEXT_PUBLIC_INTERPRETER_URL not set"));
        return;
      }
      this._ws = new WebSocket(`ws://${interpreterUrl}/run`);
      this._ws!.onmessage = (event) => {
        if (event.data === "_ready_") {
          resolve();
        } else {
          reject(Error(event.data));
        }
      };
      this._ws!.onerror = (event) => {
        reject(Error("Could not connect to interpreter"));
      };
    });
  }

  private send(code: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this._ws!.readyState === WebSocket.OPEN) {
        this._ws!.send(code);
        this._ws!.onmessage = (event) => {
          if (event.data.startsWith("_success_")) {
            resolve(event.data.substring(10));
          } else if (event.data.startsWith("_error_")) {
            reject(Error(event.data.substring(8)));
          } else {
            reject(Error("Invalid response"));
          }
        };
      } else {
        reject(Error("Could not connect to interpreter"));
      }
    });
  }

  async run(code: string): Promise<string> {
    if (this._ws === null) {
      await this.connect();
    }
    return await this.send(code);
  }
}
