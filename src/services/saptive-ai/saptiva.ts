import { logger } from "../../infra/logger.ts";
import { BASE_URL, MODEL, TOKENS } from "./constants.ts";
import * as prompts from "./prompts.ts";

interface SaptivaCompletition {
  sysPrompt?: string;
  text?: string;
  userMessage?: string;
  jsonResponse?: boolean;
}

const cleanJsonString = (jsonString: string) => {
  const pattern = /^```json\s*(.*?)\s*```$/s;
  const cleanedString = jsonString.replace(pattern, "$1");
  return JSON.parse(cleanedString.trim());
};

export const createSaptivaCompletition = async (
  {
    sysPrompt = prompts.SysPromptsDefault,
    text = prompts.TextDefault,
    userMessage = prompts.UserMessageDefault,
    jsonResponse = false,
  }: SaptivaCompletition,
) => {
  const token = Deno.env.get("SAPTIVE_API_KEY");

  if (!token) {
    throw new Error("[ERROR]: SAPTIVE_API_KEY is not set");
  }

  const myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${token}`);
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    "modelName": MODEL,
    "newTokens": TOKENS,
    "sysPrompt": sysPrompt,
    "text": text,
    "userMessage": userMessage,
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  const response = await fetch(BASE_URL, requestOptions);
  const data = await response.json();

  logger.debug(JSON.stringify(data, null, 2));

  if (jsonResponse) {
    return cleanJsonString(data.response);
  }

  return data.response;
};
