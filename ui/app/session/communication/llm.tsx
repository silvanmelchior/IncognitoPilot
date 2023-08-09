import { Message } from "@/llm/base";

export default class LLM {
  constructor(private readonly llmUrl: string) {}

  private connect(): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`ws://${this.llmUrl}/chat`);
      ws.onopen = () => {
        resolve(ws);
      };
      ws.onerror = () => {
        reject(Error("Could not connect to LLM"));
      };
    });
  }

  private waitClose(ws: WebSocket): Promise<void> {
    return new Promise((resolve, reject) => {
      ws.onclose = () => {
        resolve();
      };
    });
  }

  async chatCall(
    messages: Message[],
    onResponse: (response: Message) => void,
  ): Promise<void> {
    const ws = await this.connect();

    ws.send(JSON.stringify(messages));
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data) as Message;
      message.role = "model";
      onResponse(message);
    };

    await this.waitClose(ws);
  }
}
