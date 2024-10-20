// deno-lint-ignore-file no-explicit-any
import { Buffer } from "node:buffer";
import { generateEmbeddings } from "../../services/embbeddings/embbed.ts";
import { getRealtimeSocket } from "../../services/realtime-api/realtime.ts";
import type { Repositories } from "../../types.ts";
import { SystemMessageDefault, VOICE } from "./constants.ts";
import { logger } from "../../infra/logger.ts";

const LOG_EVENT_TYPES = [
  "error",
  "response.content.done",
  "rate_limits.updated",
  "response.done",
  "input_audio_buffer.committed",
  "input_audio_buffer.speech_stopped",
  "input_audio_buffer.speech_started",
  "session.created",
  "response.function_call_arguments.done",
];

function getQueryParams(url: string) {
  const params = new URL(url).searchParams;
  const queryParamsObj: any = {};

  for (const [key, value] of params.entries()) {
    queryParamsObj[key] = value;
  }

  return queryParamsObj;
}

export const incomingWebhook = async (
  request: Request,
  { embeddingsRepository, companyFunctionRepository }: Repositories,
) => {
  const wsOpenAI = getRealtimeSocket();
  const { socket, response } = Deno.upgradeWebSocket(request);
  const { companyId } = getQueryParams(request.url);

  let streamSid: null | string = null;
  let markQueue: any[] = [];
  let lastAssistantItem = 0;
  let latestMediaTimestamp = 0;
  let responseStartTimestampTwilio: null | number = null;

  // deno-lint-ignore no-unused-vars
  const functions = await companyFunctionRepository.findByCompanyId(companyId);

  const getContext = async (prompt: string) => {
    const { data } = await generateEmbeddings(prompt);
    const [firstContentEmbedded] = data;
    const response = await embeddingsRepository.searchByEmbbeding(
      firstContentEmbedded.embedding,
    );
    return response.matches.map((match: any) => match.context).join("\n");
  };

  const sendMark = (socket: any, streamSid: null | string) => {
    if (streamSid) {
      const markEvent = {
        event: "mark",
        streamSid: streamSid,
        mark: { name: "responsePart" },
      };
      socket.send(JSON.stringify(markEvent));
      markQueue.push("responsePart");
    }
  };

  const handleSpeechStartedEvent = () => {
    if (markQueue.length > 0 && responseStartTimestampTwilio != null) {
      const elapsedTime = latestMediaTimestamp - responseStartTimestampTwilio;

      if (lastAssistantItem) {
        const truncateEvent = {
          type: "conversation.item.truncate",
          item_id: lastAssistantItem,
          content_index: 0,
          audio_end_ms: elapsedTime,
        };
        socket.send(JSON.stringify(truncateEvent));
      }

      socket.send(JSON.stringify({
        event: "clear",
        streamSid: streamSid,
      }));

      markQueue = [];
      responseStartTimestampTwilio = null;
    }
  };

  socket.onopen = () => {
    const initializeSession = () => {
      const sessionUpdate = {
        type: "session.update",
        session: {
          turn_detection: { type: "server_vad" },
          input_audio_format: "g711_ulaw",
          output_audio_format: "g711_ulaw",
          voice: VOICE,
          instructions: SystemMessageDefault,
          modalities: ["text", "audio"],
          temperature: 0.8,
          tools: [
            {
              "type": "function",
              "name": "get_additional_context",
              "description":
                "Elaborate on the user's original query, providing additional context, specificity, and clarity to create a more detailed, expert-level question. The function should transform a simple query into a richer and more informative version that is suitable for an expert to answer.",
              "parameters": {
                "type": "object",
                "properties": {
                  "query": {
                    "type": "string",
                    "description":
                      "The elaborated user query. This should fully describe the user's original question, adding depth, context, and clarity. Tailor the expanded query as if the user were asking an expert in the relevant field, providing necessary background or related subtopics that may help inform the response. Start with 'Please use your knowledge base'",
                  },
                },
                "required": ["query"],
              },
            },
          ],
        },
      };

      logger.log(
        "Sending session update: " + JSON.stringify(sessionUpdate, null, 2),
      );
      wsOpenAI.send(JSON.stringify(sessionUpdate));

      sendInitialConversationItem();
    };

    const sendInitialConversationItem = () => {
      const initialConversationItem = {
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                'Greet the user with "Hola me llamo Alice, soy tu asistente virtual que te puede a ayudar con cualquier problema, ¿en qué puedo ayudarte hoy?"',
            },
          ],
        },
      };

      wsOpenAI.send(JSON.stringify(initialConversationItem));
      wsOpenAI.send(JSON.stringify({ type: "response.create" }));
    };

    wsOpenAI.on("open", () => {
      logger.log("Connected to the OpenAI Realtime API");
      initializeSession();
    });

    wsOpenAI.on("message", async (data: any) => {
      try {
        const response = JSON.parse(data);

        if (LOG_EVENT_TYPES.includes(response.type)) {
          logger.log(
            `Received event: ${response.type} :::: ${
              JSON.stringify(response, null, 2)
            }`,
          );
        } else {
          logger.debug(`Received event: ${response.type}`);
        }

        if (response.type === "response.audio.delta" && response.delta) {
          const audioDelta = {
            event: "media",
            streamSid: streamSid,
            media: {
              payload: Buffer.from(response.delta, "base64").toString("base64"),
            },
          };
          socket.send(JSON.stringify(audioDelta));

          if (!responseStartTimestampTwilio) {
            responseStartTimestampTwilio = latestMediaTimestamp;
          }

          if (response.item_id) {
            lastAssistantItem = response.item_id;
          }

          sendMark(socket, streamSid);
        }

        if (response.type === "input_audio_buffer.speech_started") {
          handleSpeechStartedEvent();
        }

        if (response.type === "response.function_call_arguments.done") {
          const { name: functionName, arguments: args, call_id } = response;

          if (functionName === "get_additional_context") {
            const { query } = JSON.parse(args);
            logger.log(
              `Received function call arguments for ${functionName}: ${query}`,
            );
            const result = await getContext(query);

            const response = {
              type: "conversation.item.create",
              "item": {
                "type": "function_call_output",
                "call_id": call_id,
                "output": result,
              },
            };

            wsOpenAI.send(JSON.stringify(response));
            wsOpenAI.send(JSON.stringify({ type: "response.create" }));
          }
        }
      } catch (error) {
        console.error(
          "Error processing OpenAI message:",
          error,
          "Raw message:",
          data,
        );
      }
    });

    logger.log(`Client connected!`);
  };

  socket.onmessage = (message: MessageEvent<string>) => {
    try {
      const data = JSON.parse(message.data);
      switch (data.event) {
        case "media":
          latestMediaTimestamp = data.media.timestamp;
          if (wsOpenAI.readyState === WebSocket.OPEN) {
            const audioAppend = {
              type: "input_audio_buffer.append",
              audio: data.media.payload,
            };
            wsOpenAI.send(JSON.stringify(audioAppend));
          }
          break;
        case "start":
          streamSid = data.start.streamSid;
          logger.log("Incoming stream has started " + streamSid);

          responseStartTimestampTwilio = null;
          latestMediaTimestamp = 0;
          break;
        case "mark":
          if (markQueue.length > 0) {
            markQueue.shift();
          }
          break;
        case "stop":
          if (streamSid) {
            const stopEvent = {
              type: "input_audio_buffer.stop",
              streamSid: streamSid,
            };
            wsOpenAI.send(JSON.stringify(stopEvent));
          }
          break;
        default:
          logger.log("Received non-media event: " + JSON.stringify(data));
          break;
      }
    } catch (error) {
      console.error("Error parsing message:", error, "Event:", message);
    }
  };

  socket.onclose = () => {
    logger.debug("DISCONNECTED");
    wsOpenAI.close();
  };
  socket.onerror = (error) => console.error("ERROR:", error);

  return response;
};
