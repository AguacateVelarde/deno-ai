import type { Db } from "mongodb";
import { GetCompanyContextRepository } from "./company-context.ts";
import { GetEmbeddingsRepository } from "./embedding.ts";
import { GetCompanyFunctionRepository } from "./company-function.ts";
import { getPineconeDb } from "../pinecone.ts";

export const GetRepositories = (database: Db) => {
  const pineconeIndex = getPineconeDb();
  return {
    companyContextRepository: GetCompanyContextRepository(database),
    embeddingsRepository: GetEmbeddingsRepository(pineconeIndex),
    companyFunctionRepository: GetCompanyFunctionRepository(database),
  };
};
