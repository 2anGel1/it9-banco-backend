import { PrismaClient } from '@prisma/client'
import dotenv from "dotenv";


dotenv.config();

export const ACCOUNT_VERIFICATION_TOKEN_KEY = process.env.ACCOUNT_VERIFICATION_TOKEN_KEY;

export const PASSWORD_RESET_TOKEN_KEY = process.env.PASSWORD_RESET_TOKEN_KEY;

export const SENDER_MAIL_PASSWORD = process.env.SENDER_MAIL_PASSWORD || "";

export const SENDER_MAIL_ADDRESS = process.env.SENDER_MAIL_ADDRESS || "";

export const PORT = Number(process.env.PORT);

export const prisma = new PrismaClient;

export const readFilePath = "https://it9-banco-backend.onrender.com/ressources";
// export const readFilePath = "http://localhost:8000/ressources";
export const writeFilePath = process.cwd() + "/src/assets";



