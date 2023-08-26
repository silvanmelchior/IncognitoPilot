import { Message } from "@/app/session/communication/message";
import Interpreter from "@/app/session/communication/interpreter";
import LLM from "@/app/session/communication/llm";
import { Approver } from "@/app/session/approval/approver";
import { SERVICES_URL } from "@/app/services";

export type ChatRoundState =
  | "not active"
  | "waiting for model"
  | "waiting for interpreter"
  | "waiting for approval";

export class ChatRound {
  private readonly llm: LLM;

  constructor(
    private history: Message[],
    private readonly setHistory: (message: Message[]) => void,
    private readonly approverIn: Approver,
    private readonly approverOut: Approver,
    private readonly interpreter: Interpreter,
    private readonly setState: (state: ChatRoundState) => void,
    private readonly setCodeResult: (result: string) => void,
    private readonly authToken: string,
  ) {
    const llmUrl =
      SERVICES_URL.replace("https://", "wss://").replace("http://", "ws://") +
      "/api/llm";
    this.llm = new LLM(llmUrl, authToken);
  }

  private extendHistory(message: Message) {
    const newHistory = [...this.history, message];
    this.setHistory(newHistory);
    this.history = newHistory;
  }

  private modifyHistory(message: Message) {
    const newHistory = [...this.history.slice(0, -1), message];
    this.setHistory(newHistory);
    this.history = newHistory;
  }

  private sendMessage = async (message: Message): Promise<Message> => {
    this.extendHistory(message);
    this.setState("waiting for model");
    const response: Message = { role: "model" };
    this.extendHistory(response);
    await this.llm.chatCall(this.history.slice(0, -1), (response) => {
      this.modifyHistory(response);
    });
    return this.history[this.history.length - 1];
  };

  run = async (message: string) => {
    let response = await this.sendMessage({ role: "user", text: message });
    let round = 0;
    for (; round < 10; round++) {
      const code = response.code;
      if (code !== undefined) {
        const approvedIn = await this.approveIn(code);
        let result = "ERROR: User did not approve code execution!";
        if (approvedIn) {
          const resultCode = await this.executeCode(code);
          const approvedOut = await this.approveOut(resultCode);
          if (approvedOut) {
            result = resultCode;
          }
        }
        response = await this.sendResult(result);
      } else {
        this.setState("not active");
        break;
      }
    }
    if (round == 10) {
      throw new Error("Stopped after 10 rounds");
    }
  };

  private approveIn = async (code: string) => {
    this.setState("waiting for approval");
    return await this.approverIn.getApproval();
  };

  private executeCode = async (code: string): Promise<string> => {
    this.setState("waiting for interpreter");
    return await this.interpreter.run(code, this.authToken);
  };

  private approveOut = async (result: string) => {
    this.setState("waiting for approval");
    const emptyAutoApprove = result === "";
    const resultText = emptyAutoApprove
      ? "(empty output was automatically approved)"
      : result;
    this.setCodeResult(resultText);
    if (!emptyAutoApprove) {
      return await this.approverOut.getApproval();
    }
    return true;
  };

  private sendResult = async (result: string) => {
    const newMessage: Message = { role: "interpreter", code_result: result };
    return await this.sendMessage(newMessage);
  };
}
