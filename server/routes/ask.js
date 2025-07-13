import express from "express";
import { AzureChatOpenAI } from "@langchain/openai";
import { fetchInternships } from "../tools/fetchInternships.js";
import { summarizeInternships } from "../tools/summarizeInternships.js";

export const askRoute = express.Router();

// model setup
const model = new AzureChatOpenAI({
  azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
  azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
  azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
  azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
  temperature: 0.3,
  maxTokens: 1000,
}).bindTools([fetchInternships, summarizeInternships]);

let userPrefs = {};
let lastInternships = [];

askRoute.post("/", async (req, res) => {
  console.log("[ask.js] Received POST /ask with body:\n", JSON.stringify(req.body, null, 2));
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "No messages provided" });
  }
  console.log("[ask.js] Passing these messages to LLM:\n", messages);

  // system prompt
  const systemPrompt = {
    role: "system",
    content: `
      You are a helpful and highly reliable internship assistant.
      1. Greet the user warmly and ask them warmly about their internship preferences.
      - Always ask the user about the field (industry) and if they prefer paid or unpaid. Ask for location last.
      2. You MUST always use the fetchInternships tool as soon as you have both field and location.
      - When "fetchInternships" is called, ALWAYS output the list of internships to the user.
      - DO NOT invent internships and NEVER return an empty list.
      3. AFTER showing the fetched list, ask if the user wants a summary explaining why these fit their preferences.
      - Only call summarizeInternships if the user confirms they want a summary.
      - Only provide a concise summary with pros and cons.
      - Never guess, rewrite, or change the field or location; always use the user's input.
      - Be friendly and concise.
      `
  };

  const fullMessages = [systemPrompt, ...messages];
  res.setHeader("Content-Type", "text/plain");

  try {
    const response = await model.invoke(fullMessages);
    // check for tool calls
    if (response?.tool_calls && response.tool_calls.length > 0) {
      const toolCall = response.tool_calls[0];

      // ftch internships tool
      if (toolCall.name === "fetchInternships") {
        let toolArgs = {};
        try {
          toolArgs = typeof toolCall.args === "string" ? JSON.parse(toolCall.args) : toolCall.args;
        } catch (e) {
          console.error("[ask.js] Tool args parse error:", toolCall.args, e);
          return res.end("There was an error processing your request.");
        }
        userPrefs = { ...userPrefs, ...toolArgs };
        const toolResult = await fetchInternships.func(toolArgs);
        lastInternships = toolResult.internships || [];

        const toolCallMsg = {
          tool_call_id: toolCall.id,
          role: "tool",
          name: "fetchInternships",
          content: toolResult.display
        };
        const newMessages = [...fullMessages, {
          role: "assistant",
          tool_calls: response.tool_calls,
          content: ""
        }, toolCallMsg];

        // stream response
        const stream = await model.stream(newMessages);
        for await (const chunk of stream) {
          res.write(chunk.content);
        }
        res.end();
        return;
      }

      // summarize tool
      if (toolCall.name === "summarizeInternships") {
        let toolArgs = {};
        try {
          toolArgs = typeof toolCall.args === "string" ? JSON.parse(toolCall.args) : toolCall.args;
        } catch (e) {
          console.error("[ask.js] summarizeInternships Tool args parse error:", toolCall.args, e);
          return res.end("There was an error processing your request.");
        }
        const jobsForSummary = lastInternships.slice(0, 3);
        toolArgs.internships = jobsForSummary;
        toolArgs.userPreferences = userPrefs;
        const toolResult = await summarizeInternships.func(toolArgs);
        const toolCallMsg = {
          tool_call_id: toolCall.id,
          role: "tool",
          name: "summarizeInternships",
          content: toolResult
        };
        const newMessages = [...fullMessages, {
          role: "assistant",
          tool_calls: response.tool_calls,
          content: ""
        }, toolCallMsg];

        // stream response
        const stream = await model.stream(newMessages);
        for await (const chunk of stream) {
          res.write(chunk.content);
        }
        res.end();
        return;
      }
    }

    // general stream response
    const stream = await model.stream(fullMessages);
    for await (const chunk of stream) {
      res.write(chunk.content);
    }
    res.end();

  } catch (err) { 
    console.error("[ask.js] ERROR in /ask:", err);
    if (
    err?.message?.toLowerCase().includes("token") ||
    err?.message?.toLowerCase().includes("context") ||
    err?.message?.toLowerCase().includes("length")
  ) {
    res.write("You've sent too many messages. Please start a new conversation.");
  } else {
    res.write("Sorry, I didn't get a response. Please try again.");
  }
  res.end();
}
});
