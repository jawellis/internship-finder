import { tool } from "@langchain/core/tools";
import { AzureChatOpenAI } from "@langchain/openai";

async function summarizeInternshipsFunction({ internships, userPreferences }) {
  console.log("[summarizeInternships] Called with user prefs:", userPreferences);

  const jobsText = internships.map((job, idx) => (
    `Internship ${idx + 1}:
    Title: ${job.title || "N/A"}
    Organization: ${job.organization || "N/A"}
    Location: ${job.location || job.cities_derived?.[0] || "N/A"}
    Salary: ${job.ai_salary_minvalue ? `€${job.ai_salary_minvalue}/${job.ai_salary_unittext?.toLowerCase() || "month"}` : "N/A"}
    Description: ${(job.description_text || "").split(" ").slice(0, 200).join(" ")}...
    Link: ${job.url || "#"}`
  )).join('\n\n');

  // tool prompt
  const prompt = `
  You are a helpful assistant.
  A user asked for internships with these preferences:
  - Field: ${userPreferences.field}
  - Location: ${userPreferences.location}
  - Paid: ${userPreferences.paid}

  Below are the details for each internship (including a brief description).
  For each internship, do ALL of the following:
  1. Write a concise summary (1–2 sentences) about what the internship/company offers, focusing on how it fits or does not fit the user's preferences.
  2. Include a pro's and cons list using markdown bullets (\`- Pro: ...\`, \`- Con: ...\`).
  IMPORTANT:
  - Do NOT just repeat raw fields or list data again.
  - Only return the analysis.
  - Be specific and honest.

Internships:
${jobsText}
`;

  // set up new model 
  const model = new AzureChatOpenAI({
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
    azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
    azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
    azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
    temperature: 0.3,
    maxTokens: 1000,
  });

  const response = await model.invoke(prompt);
  return response.content?.trim() || "No summary generated.";
}

// tool wrapper for LangChain
export const summarizeInternships = tool(summarizeInternshipsFunction, {
  name: "summarizeInternships",
  description: "Summarize each internship for fit, giving pros/cons vs user preferences.",
  schema: {
    type: "object",
    properties: {
      internships: {
        type: "array",
        description: "List of internship objects (from fetchInternships).",
        items: { type: "object" }
      },
      userPreferences: {
        type: "object",
        description: "User's field, location, paid.",
        properties: {
          field: { type: "string" },
          location: { type: "string" },
          paid: { type: "string" },
        },
        required: ["field", "location", "paid"]
      }
    },
    required: ["internships", "userPreferences"]
  }
});
