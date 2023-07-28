import {Message} from "@/llm/base";
import {chatCall, Interpreter} from "@/app/api_calls";
import {Approver} from "@/app/approver";


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
  ) {}

  private extendHistory(message: Message) {
    const newHistory = [...this._history, message]
    this._setHistory(newHistory)
    this._history = newHistory
  }

  private sendMessage = async (message: Message): Promise<Message> => {
    this.extendHistory(message)
    this._setState("waiting for model")
    const response = await chatCall(this._history)
    this.extendHistory(response)
    return response
  }

  start = async (message: string) => {
    const newMessage: Message = { role: "user", text: message }
    const response = await this.sendMessage(newMessage)
    await this.handleModelResponse(response)
  }

  private handleModelResponse = async (message: Message) => {
    if(message.code !== undefined) {
      await this.approveIn(message.code)
      const result = await this.executeCode(message.code!)
      await this.approveOut(result)
      const response = await this.executeCodeDone(result)
      await this.handleModelResponse(response)
    }
    else {
      this._setState("not active")
      // done
    }
  }

  private approveIn = async (code: string) => {
    this._setState("waiting for approval")
    await this._approverIn.getApproval(code)
  }

  private executeCode = async (code: string): Promise<string> => {
    this._setState("waiting for interpreter")
    return await this._interpreter.run(code)
  }

  private approveOut = async (result: string) => {
    this._setState("waiting for approval")
    const tmpAutoApprove = result === ""
    const resultText = tmpAutoApprove ?
      "(empty output was automatically approved)" : result
    await this._approverOut.getApproval(resultText, tmpAutoApprove)
  }

  private executeCodeDone = async (result: string) => {
    const newMessage: Message = { role: "interpreter", code_result: result }
    return await this.sendMessage(newMessage)
  }

}
