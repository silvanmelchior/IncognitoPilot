import { Configuration, CreateChatCompletionResponse, OpenAIApi } from "openai";
import { LLMException, Message } from "@/llm/base";
import { AxiosResponse } from "axios";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const SYSTEM_MESSAGE = "You are a helpful coding assistant.";
const FUNCTIONS = [
  {
    name: "run_python_code",
    description:
      "Runs arbitrary Python code and returns stdout and stderr. " +
      "The code is executed in an interactive shell, imports and variables are preserved between calls. " +
      "The environment has internet and file system access. " +
      "The current working directory is shared with the user, so files can be exchanged. " +
      "There are many libraries pre-installed, including numpy, pandas, matplotlib, and scikit-learn. " +
      "You cannot show rich outputs like plots or images, but you can store them in the working directory and point the user to them. " +
      "If the code runs too long, there will be a timeout.",
    parameters: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description: "The Python code to run",
        },
      },
      required: ["code"],
    },
  },
];

type GPTMessage = {
  role: "user" | "assistant" | "system" | "function";
  content: string | null;
  name?: string;
  function_call?: {
    name: string;
    arguments: string;
  };
};

function msgToGPTMsg(msg: Message): GPTMessage {
  if (msg.role == "user") {
    return {
      role: "user",
      content: msg.text !== undefined ? msg.text : null,
    };
  }
  if (msg.role == "model") {
    return {
      role: "assistant",
      content: msg.text !== undefined ? msg.text : null,
      function_call:
        msg.code !== undefined
          ? {
              name: "run_python_code",
              arguments: JSON.stringify({ code: msg.code }),
            }
          : undefined,
    };
  }
  if (msg.role == "interpreter") {
    return {
      role: "function",
      name: "run_python_code",
      content: msg.code_result ?? "",
    };
  }
  throw new LLMException(`Invalid message role ${msg.role}`);
}

function GPTMsgToMsg(msg: GPTMessage): Message {
  if (msg.role == "user") {
    return {
      role: "user",
      text: msg.content !== null ? msg.content : undefined,
    };
  }
  if (msg.role == "assistant") {
    let code: string | undefined;
    try {
      code =
        msg.function_call !== undefined
          ? JSON.parse(msg.function_call.arguments).code
          : undefined;
    } catch (e) {
      throw new LLMException(`Model returned invalid JSON, cannot run code`);
    }
    return {
      role: "model",
      text: msg.content !== null ? msg.content : undefined,
      code: code,
    };
  }
  if (msg.role == "function") {
    return {
      role: "interpreter",
      code_result: msg.content ?? "",
    };
  }
  throw new LLMException(`Invalid message role ${msg.role}`);
}

export const chat =
  (model: string) =>
  async (history: Message[]): Promise<Message> => {
    if (OPENAI_API_KEY === undefined) {
      throw new LLMException("OPENAI_API_KEY environment variable not set");
    }

    const gptHistory = history.map(msgToGPTMsg);
    gptHistory.unshift({
      role: "system",
      content: SYSTEM_MESSAGE,
    });

    let completion: AxiosResponse<CreateChatCompletionResponse, any>;
    try {
      // type definitions of openai seem to be wrong, so had to disable multiple times
      completion = (await openai.createChatCompletion({
        model: model,
        messages: gptHistory as any,
        functions: FUNCTIONS,
        function_call: "auto",
        temperature: 0.0,
      })) as any;
    } catch (e: any) {
      if (e.response !== undefined) {
        throw new LLMException(
          `OpenAI API error ${e.response.status} ${e.response.statusText}`,
        );
      }
      throw e;
    }
    const message = completion.data.choices[0].message as GPTMessage;

    return GPTMsgToMsg(message);
  };
