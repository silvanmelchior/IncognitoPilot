export default class Interpreter {
  private ws: WebSocket | null = null;
  private readonly interpreterUrl: string;

  constructor() {
    this.interpreterUrl = process.env.NEXT_PUBLIC_INTERPRETER_URL ?? "";
    if (this.interpreterUrl === "") {
      try {
        this.interpreterUrl = location.host;
      } catch (e) {
        this.interpreterUrl = "localhost";
      }
    }
    this.interpreterUrl += "/api/interpreter";
  }

  private connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(`ws://${this.interpreterUrl}/run`);
      this.ws!.onmessage = (event) => {
        if (event.data === "_ready_") {
          resolve();
        } else {
          reject(Error(event.data));
        }
      };
      this.ws!.onerror = () => {
        reject(Error("Could not connect to interpreter"));
      };
    });
  }

  private send(code: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.ws!.readyState === WebSocket.OPEN) {
        this.ws!.send(code);
        this.ws!.onmessage = (event) => {
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
    if (this.ws === null) {
      await this.connect();
    }
    return await this.send(code);
  }
}
