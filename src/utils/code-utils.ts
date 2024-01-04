import { customAlphabet } from "nanoid";

export const generateRandomCode = customAlphabet("0123456789", 6);

// export const readFilePath = "http://localhost:8000/ressources";
export const readFilePath = "https://it9-banco-backend.onrender.com/ressources";

export const writeFilePath = process.cwd() + "/src/assets";
