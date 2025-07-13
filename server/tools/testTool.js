import dotenv from "dotenv";
dotenv.config();
import { fetchInternshipsFunction } from "./fetchInternships.js";
const input = { field: "fashion design" };

(async () => {
    console.log("[testTool.js] Calling fetchInternshipsFunction with:", input);

    const result = await fetchInternshipsFunction(input); 
    console.log("[testTool.js] Output from fetchInternshipsFunction:\n", result); 
})();
