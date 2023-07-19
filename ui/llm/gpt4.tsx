import { Configuration, OpenAIApi } from "openai";
import { Message } from "@/llm/base";
import {ChatCompletionRequestMessage} from "openai/api";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

const MODEL = "gpt-4-0613"
const SYSTEM_MESSAGE = "You are a helpful coding assistant."
const FUNCTIONS = [
    {
        "name": "run_python_code",
        "description":
          "Runs arbitrary Python code and returns stdout and stderr. " +
          "The code is executed as a script, so print statements should be used, if any output is of interest. " +
          "The environment has internet and file system access. " +
          "The code does not have access to the variables or imports from the previous execution, only the file system is persistent. " +
          "The current working directory is shared with the user, so files can be exchanged. " +
          "There are many libraries pre-installed, including numpy, pandas, matplotlib, and scikit-learn. " +
          "You cannot show plots, but you can store them in the working directory and point the user to them.",
        "parameters": {
            "type": "object",
            "properties": {
                "code": {
                    "type": "string",
                    "description": "The Python code to run",
                }
            },
            "required": ["code"]
        }
    }
]

type GPTMessage = {
  role: "user" | "assistant" | "system" | "function",
  content: string | null
  name?: string,
  function_call?: {
    name: string,
    arguments: string
  }
}

function msgToGPTMsg(msg: Message): GPTMessage {
  if(msg.role == "user") {
    return {
      role: "user",
      content: msg.text !== undefined ? msg.text : null
    }
  }
  if(msg.role == "model") {
    return {
      role: "assistant",
      content: msg.text !== undefined ? msg.text : null,
      function_call: msg.code !== undefined ? {
        name: "run_python_code",
        arguments: JSON.stringify({code: msg.code})
      } : undefined
    }
  }
  if(msg.role == "interpreter") {
    return {
      role: "function",
      name: "run_python_code",
      content: JSON.stringify(msg.code_result)
    }
  }
  throw new Error("Invalid message role")
}

function GPTMsgToMsg(msg: GPTMessage): Message {
  if(msg.role == "user") {
    return {
      role: "user",
      text: msg.content !== null ? msg.content : undefined
    }
  }
  if(msg.role == "assistant") {
    return {
      role: "model",
      text: msg.content !== null ? msg.content : undefined,
      code: msg.function_call !== undefined ?
        JSON.parse(msg.function_call.arguments).code :
        undefined
    }
  }
  if(msg.role == "function") {
    return {
      role: "interpreter",
      code_result: msg.content !== null ? JSON.parse(msg.content) : undefined
    }
  }
  throw new Error("Invalid message role")
}

export async function chat(history: Message[]): Promise<Message> {
  const gptHistory = history.map(msgToGPTMsg)
  gptHistory.unshift({
    role: "system",
    content: SYSTEM_MESSAGE
  })

  const completion = await openai.createChatCompletion({
    model: MODEL,
    messages: gptHistory as ChatCompletionRequestMessage[],  // type in library is wrong
    functions: FUNCTIONS,
    function_call: "auto",
    temperature: 0.0
  })
  const message = completion.data.choices[0].message

  return GPTMsgToMsg(message)
}
