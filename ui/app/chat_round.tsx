import { Message } from "@/llm/base";
import { chatCall, Interpreter } from "@/app/api_calls";
import { Approver } from "@/app/approver";


export type ChatRoundState = "not active" | "waiting for model" |
  "waiting for interpreter" | "waiting for approval"

export class ChatRound {
  constructor(
    private _history: Message[],
    private readonly _setHistory: (message: Message[]) => void,
    private readonly _approverIn: Approver,
    private readonly _approverOut: Approver,
    private readonly _interpreter: Interpreter,
    private readonly _setState: (state: ChatRoundState) => void,
    private readonly _setError: (message: string) => void
  ) {}

  private extendHistory(message: Message) {
    const newHistory = [...this._history, message]
    this._setHistory(newHistory)
    this._history = newHistory
  }

  trigger = async (message: string) => {
    this.extendHistory({ role: "user", text: message })
    this._setState("waiting for model")
    let msg: Message
    try {
      msg = await chatCall(this._history)
    } catch(e) {
      this._setError(e.message)
      return
    }
    await this.onModelMessage(msg)
  }

  private onModelMessage = async (message: Message) => {
    this.extendHistory(message)
    if(message.code !== undefined) {
      this._setState("waiting for approval")
      await this._approverIn.getApproval(message.code)
      await this.executeCode(message.code!)
    }
    else {
      this._setState("not active")
      // done
    }
  }

  private executeCode = async (code: string) => {
    this._setState("waiting for interpreter")
    const result = await this._interpreter.run(code)
    this._setState("waiting for approval")
    const tmpAutoApprove = result === ""
    const resultText = tmpAutoApprove ?
      "(empty output was automatically approved)" : result
    await this._approverOut.getApproval(resultText, tmpAutoApprove)
    await this.executeCodeDone(result)
  }

  private executeCodeDone = async (result: string) => {
    const newMessage: Message = { role: "interpreter", code_result: result }
    this.extendHistory(newMessage)
    this._setState("waiting for model")
    const msg = await chatCall(this._history)
    await this.onModelMessage(msg)
  }

}
