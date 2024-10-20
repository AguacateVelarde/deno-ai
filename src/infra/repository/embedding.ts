import type {
  Index,
  QueryResponse,
  RecordMetadata,
} from "@pinecone-database/pinecone";

export interface IEmbeddingsRepository {
  createMany(embedding: any[]): Promise<void>;
  searchByEmbbeding(
    queryVector: number[],
    limit?: number,
  ): Promise<QueryResponse<RecordMetadata>>;
}

export const GetEmbeddingsRepository = (
  pineconeIndex: Index<RecordMetadata>,
): IEmbeddingsRepository => {
  return {
    createMany(companyEmbeddings: any[]) {
      return pineconeIndex.upsert(companyEmbeddings);
    },

    searchByEmbbeding(
      vector: number[],
      limit: number = 5,
    ) {
      return pineconeIndex.query({
        topK: limit,
        vector,
        includeValues: true,
        includeMetadata: true,
      });
    },
  };
};
