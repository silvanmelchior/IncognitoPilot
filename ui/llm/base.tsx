// a user sends a text
// a model sends a text, code, or both
// an interpreter sends a code_result
export type Message = {
  role: "user" | "model" | "interpreter";
  text?: string;
  code?: string;
  code_result?: string;
};

// is thrown if something goes wrong during messaging
export class LLMException extends Error {}
