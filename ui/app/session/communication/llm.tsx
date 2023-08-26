import { Message } from "@/app/session/communication/message";

export default class LLM {
  constructor(
    private readonly llmUrl: string,
    private readonly authToken: string,
  ) {}

  private connect(): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`${this.llmUrl}/chat`);
      ws.onopen = () => {
        ws.send(this.authToken);
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

  chatCall(
    messages: Message[],
    onResponse: (response: Message) => void,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.connect()
        .then((ws) => {
          ws.send(JSON.stringify(messages));
          ws.onmessage = (event) => {
            if (event.data.startsWith("_success_")) {
              const message = JSON.parse(event.data.substring(10)) as Message;
              message.role = "model";
              onResponse(message);
            } else if (event.data.startsWith("_error_")) {
              reject(Error(event.data.substring(8)));
            } else {
              reject(Error("Invalid response"));
            }
          };
          this.waitClose(ws)
            .then(() => {
              resolve();
            })
            .catch((e) => {
              reject(e);
            });
        })
        .catch((e) => {
          reject(e);
        });
    });
  }
}
