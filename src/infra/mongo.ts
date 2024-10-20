import "jsr:@std/dotenv/load";
import { MongoClient } from "npm:mongodb";

export const connectDatabase = async () => {
  const mongoUri = Deno.env.get("MONGO_URI");

  if (!mongoUri) {
    throw new Error("[ERROR]: MONGO_URI is not set");
  }

  const client = new MongoClient(mongoUri);
  await client.connect();

  console.log(`[INFO]: Connected to MongoDB 🐸`);

  const db = client.db("artificialdb");

  return db;
};
