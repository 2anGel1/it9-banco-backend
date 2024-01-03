import { customAlphabet } from "nanoid";

export const generateRandomCode = customAlphabet("0123456789", 6);

export const rootPath = "http://localhost:8000/ressources";
// export const rootPath = "https://it9-banco-backend.onrender.com/ressources";