import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pathToEnv = path.join(__dirname, "/.env");

dotenv.config({ path: pathToEnv });

export const ARKHIA_API_KEY = process.env.ARKHIA_API_KEY;
export const TOKEN_ID = process.env.TOKEN_ID;
export const DECIMAL_PRECISION = process.env.DECIMAL_PRECISION;
export const MIN_BALANCE = process.env.MIN_BALANCE;
