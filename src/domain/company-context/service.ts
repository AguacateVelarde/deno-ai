import { logger } from "../../infra/logger.ts";
import { generateEmbeddings } from "../../services/embbeddings/embbed.ts";
import { createSaptivaCompletition } from "../../services/saptive-ai/saptiva.ts";
import type { Repositories } from "../../types.ts";
import * as prompts from "./promts.ts";
import type { CompanyContextDTO } from "./service.dto.ts";
import crypto from "node:crypto";

export const saveCompanyContext = async (
  companyContext: CompanyContextDTO,
  { companyContextRepository, embeddingsRepository }: Repositories,
) => {
  logger.log(`Creating completition response...`);
  const completitionResponse = await createSaptivaCompletition({
    sysPrompt: prompts.SysAgentPromptsDefault,
    text: "",
    userMessage: companyContext.information,
    jsonResponse: true,
  });

  logger.log(
    `Completition response created successfull! ${completitionResponse.length}`,
  );

  const allEmbeddings = [];

  for (const { question, answer } of completitionResponse) {
    logger.log(`Generating embeddings for question: ${question}`);
    const promt = `Question: ${question} Answer: ${answer}`;
    const query = await generateEmbeddings(question);

    const { embedding }: { embedding: number[] } = Object.assign(
      [],
      query.data.shift()!,
    );

    allEmbeddings.push({
      id: crypto.randomUUID(),
      values: embedding,
      metadata: {
        promt,
        question,
        answer,
        companyId: companyContext.companyId,
        createdAt: new Date(),
      },
    });

    logger.log(`Total embedded: ${embedding.length}`);
  }

  await embeddingsRepository.createMany(allEmbeddings);

  logger.log(`Embeddings saved successfull!`);

  return companyContextRepository.create({
    ...companyContext,
    completitionResponse,
  });
};
