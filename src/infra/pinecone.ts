import "jsr:@std/dotenv/load";
import { Pinecone } from "@pinecone-database/pinecone";

export const getPineconeDb = () => {
  const pineconeApiKey = Deno.env.get("PINECONE_API_KEY");

  if (!pineconeApiKey) {
    throw new Error("[ERROR]: PINECONE_API_KEY is not set");
  }
  const pc = new Pinecone({
    apiKey: pineconeApiKey,
  });

  return pc.index("embeddings");
};
