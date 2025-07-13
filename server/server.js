import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { askRoute } from "./routes/ask.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/ask", askRoute);
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
