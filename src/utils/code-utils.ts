import { customAlphabet } from "nanoid";

export const generateRandomCode = customAlphabet("0123456789", 6);

export const rootPath = process.cwd() + "";