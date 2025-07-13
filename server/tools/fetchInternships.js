import { tool } from "@langchain/core/tools";
import axios from "axios";

export async function fetchInternshipsFunction({ field, location }) {
  console.log("[fetchInternships] Fetching internships for:", { field, location });

  const options = {
    method: 'GET',
    url: 'https://internships-api.p.rapidapi.com/active-jb-7d',
    params: {
      title_filter: field,
      location_filter: location,
      limit: 3,
      description_type: 'text',
      include_ai: 'true'
    },
    headers: {
      'x-rapidapi-key': process.env.RAPID_API_KEY,
      'x-rapidapi-host': 'internships-api.p.rapidapi.com',
    },
  };

  try {
    // api call
    const response = await axios.request(options);
    const jobs = (response.data.jobs || response.data || []).slice(0, 3);
    if (!jobs.length) {
      return {
        internships: [],
        display: "Sorry, I couldn't find any internships for your search right now."
      };
    }

    // format output for user
    let output = `## Here are some internships in ${field}${location ? " in " + location : ""}:\n\n`;
    jobs.forEach((job) => {
      output +=
        `### ${job.title || "N/A"}\n` +
        `**Organization:** ${job.organization || "N/A"}  \n` +
        `**Location:** ${job.location || job.cities_derived?.[0] || "N/A"}  \n` +
        `**Salary:** ${job.ai_salary_minvalue ? `€${job.ai_salary_minvalue}/${job.ai_salary_unittext?.toLowerCase() || 'month'}` : "N/A"}  \n` +
        `**Description:** ${(job.description_text || "").slice(0, 200)}...  \n` +
        `[Link](${job.url || '#'})\n\n---\n\n`;
    });
    return {
      internships: jobs,
      display: output.trim()
    };
  } catch (error) {
    console.error("[fetchInternships] API error:", error.response?.data || error.message);
    return {
      internships: [],
      display: "There was an error fetching internships. Please try again later."
    };
  }
}

// tool wrapper for LangChain
export const fetchInternships = tool(fetchInternshipsFunction, {
  name: "fetchInternships",
  description: "Fetch and format a list of internships for a given field and location.",
  schema: {
    type: "object",
    properties: {
      field: { type: "string", description: "The field/industry to search internships for." },
      location: { type: "string", description: "Preferred city, country, or region." }
    },
    required: ["field", "location"]
  }
});
