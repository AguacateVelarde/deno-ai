import { OPEN_AI_REALTIME_URL } from "../../constants.ts";
import WebSocket from "npm:ws";
import { logger } from "../../infra/logger.ts";

export const getRealtimeSocket = () => {
  const wsOpenAI = new WebSocket(OPEN_AI_REALTIME_URL, {
    headers: {
      "Authorization": "Bearer " + Deno.env.get("OPENAI_API_KEY")!,
      "OpenAI-Beta": "realtime=v1",
    },
  });
  logger.log(`Connected to openAI ☄️`);
  return wsOpenAI;
};
