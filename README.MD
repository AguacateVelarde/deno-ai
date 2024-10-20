# Your Own Call Center

A real-time call center platform using AI to assist with customer support through Twilio. The system enables you to send documents, create a Retrieval-Augmented Generation (RAG) system, and define functions for an intelligent assistant that can help answer any customer query.

## 🚀 Stack
This project leverages a modern stack:

- **[Deno](https://deno.land/)**: A secure runtime for JavaScript and TypeScript.
- **TypeScript**: Type-safe programming language that builds on JavaScript.
- **[Llama](https://github.com/facebookresearch/llama)**: A powerful open-source language model for natural language processing vía Saptiva. 
- **OpenAI Realtime API**: Real-time AI capabilities for intelligent responses.
- **[Pinecone](https://www.pinecone.io/)**: Vector database for fast, scalable semantic search.
- **[MongoDB](https://www.mongodb.com/)**: NoSQL database for storing and managing document data.

## 📖 What does it do?

This project is a sophisticated call center platform where you can:

1. **Send a Document**: Upload any document, and the system will process it.
2. **Create a RAG (Retrieval-Augmented Generation)**: Use Pinecone to create a vectorized representation of the document for faster and more accurate retrieval of information.
3. **Add Functions**: Define custom functions that can be executed by the AI assistant during the interaction. (in progress)
4. **WebSocket Integration**: Set up a WebSocket connection through Twilio to handle real-time customer queries via voice calls, powered by the assistant's AI and RAG system.

## 🛠️ How to Run the Project

Follow these steps to set up and run the project:

1. **Clone the repository**:
    ```bash
    git clone https://github.com/aguacatevelarde/deno-ai.git
    cd deno-ai
    ```

2. **Copy and paste the environment file**:
    ```bash
    cp .env.example .env
    ```

3. **Fill in the required credentials** in the `.env` file, such as:
   - OpenAI API key
   - Pinecone API key
   - MongoDB connection string

4. **Run the project**:
    ```bash
    deno run dev
    ```

5. **Expose your local environment with `ngrok`**:
    ```bash
    ngrok http 8080
    ```

6. **Set up Twilio Webhook**:
   - Go to your [Twilio Console](https://console.twilio.com/) and set the webhook URL to the one provided by `ngrok`, appending `/api/v1/incoming-call` to handle incoming calls.
   
Now, Twilio will route incoming calls to the AI assistant, and the RAG will enable real-time, intelligent support to help answer questions from customers.

---

Feel free to contribute and make improvements to this project!
