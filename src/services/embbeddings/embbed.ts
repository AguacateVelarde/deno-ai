import OpenAI from "https://deno.land/x/openai@v4.68.1/mod.ts";

const client = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY")!,
});

export const generateEmbeddings = async (text: string) => {
  const response = await client.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });
  return response;
};

export const embeddingInterface = () => client.embeddings;
