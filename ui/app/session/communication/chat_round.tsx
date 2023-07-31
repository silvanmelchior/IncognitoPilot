import { Message } from "@/llm/base";
import { chatCall, Interpreter } from "@/app/session/communication/api_calls";
import { Approver } from "@/app/session/approval/approver";

export type ChatRoundState =
  | "not active"
  | "waiting for model"
  | "waiting for interpreter"
  | "waiting for approval";

export class ChatRound {
  constructor(
    private _history: Message[],
    private readonly _setHistory: (message: Message[]) => void,
    private readonly _approverIn: Approver,
    private readonly _approverOut: Approver,
    private readonly _interpreter: Interpreter,
    private readonly _setState: (state: ChatRoundState) => void,
  ) {}

  private extendHistory(message: Message) {
    const newHistory = [...this._history, message];
    this._setHistory(newHistory);
    this._history = newHistory;
  }

  private sendMessage = async (message: Message): Promise<Message> => {
    this.extendHistory(message);
    this._setState("waiting for model");
    const response = await chatCall(this._history);
    this.extendHistory(response);
    return response;
  };

  run = async (message: string) => {
    let response = await this.sendMessage({ role: "user", text: message });
    let round = 0;
    for (; round < 10; round++) {
      const code = response.code;
      if (code !== undefined) {
        await this.approveIn(code);
        const result = await this.executeCode(code);
        await this.approveOut(result);
        response = await this.sendResult(result);
      } else {
        this._setState("not active");
        break;
      }
    }
    if (round == 10) {
      throw new Error("Stopped after 10 rounds");
    }
  };

  private approveIn = async (code: string) => {
    this._setState("waiting for approval");
    await this._approverIn.getApproval(code);
  };

  private executeCode = async (code: string): Promise<string> => {
    this._setState("waiting for interpreter");
    return await this._interpreter.run(code);
  };

  private approveOut = async (result: string) => {
    this._setState("waiting for approval");
    const tmpAutoApprove = result === "";
    const resultText = tmpAutoApprove
      ? "(empty output was automatically approved)"
      : result;
    await this._approverOut.getApproval(resultText, tmpAutoApprove);
  };

  private sendResult = async (result: string) => {
    const newMessage: Message = { role: "interpreter", code_result: result };
    return await this.sendMessage(newMessage);
  };
}
