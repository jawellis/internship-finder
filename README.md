# Internship Finder

A simple React + Express app for finding and summarizing internships with the help of an AI assistant. 
This app uses Rapid's Internships API for fetching real time internships applications, posted on LinkedIn. 

### API Overview
"The perfect API for students and developers looking for high quality internship job postings. This API has two endpoints:

Internships from over 100,000 company career sites
Internships from leading job boards. We index over 2 million jobs per week!
This database contains active jobs listed during the last 7 days and is refreshed hourly."

Copied from: https://rapidapi.com/fantastic-jobs-fantastic-jobs-default/api/internships-api

---

## Features

- **Full Chat UI:** AI and user messages in a modern, centered chat window.
- **Internship Search/Fetch:** Fetches live internships through filters, via a third-party API.
- **LLM Summaries:** Explains how each internship fits the user’s criteria (field, paid/unpaid, location).
- **Tool Calling:** Uses LangChain’s `bindTools` for multi-step AI logic (fetch + summarize).
- **Markdown Support:** AI messages support Markdown formatting for links, bold, lists, etc.
- **Streaming:** AI replies stream word-by-word for better UX.
- **UX:** Send button is disabled during requests; errors and token exhaustion are handled with a friendly popup and reset.

---

## Local Setup

1. Clone the Repository

- git clone <project>


2. Install Dependencies

Backend:

- cd server
- npm install

Frontend:

- cd ../client
- npm install


3. Set Up Environment Variables:

**Create a .env file in /server:**

AZURE_OPENAI_API_KEY=your_azure_openai_key

AZURE_OPENAI_API_VERSION=2024-03-01-preview

AZURE_OPENAI_API_INSTANCE_NAME=your-instance-name

AZURE_OPENAI_API_DEPLOYMENT_NAME=your-deployment-name

RAPID_API_KEY=your_rapidapi_key


Get Rapid API key at: https://rapidapi.com/fantastic-jobs-fantastic-jobs-default/api/internships-api/pricing


4. Start the Server

**From /server:**

npm run dev

Server running on http://localhost:xxxx



5. Start the Frontend

**From /client:**

npm start

Local: http://localhost:xxxx