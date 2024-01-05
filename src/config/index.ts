import dotenv from "dotenv";
import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient


dotenv.config();

export const PORT = Number(process.env.PORT);

export const ACCOUNT_VERIFICATION_TOKEN_KEY = process.env.ACCOUNT_VERIFICATION_TOKEN_KEY;

export const PASSWORD_RESET_TOKEN_KEY = process.env.PASSWORD_RESET_TOKEN_KEY;

export const SENDER_MAIL_ADDRESS = process.env.SENDER_MAIL_ADDRESS || "";

export const SENDER_MAIL_PASSWORD = process.env.SENDER_MAIL_PASSWORD || "";

export const GOOGLE_OAUTH_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID || "";
export const GOOGLE_OAUTH_CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET || "";

// export const readFilePath = "http://localhost:8000/ressources";
export const readFilePath = "https://it9-banco-backend.onrender.com/ressources";

export const writeFilePath = process.cwd() + "/src/assets";



