import { requireAuth } from "../middlewares/auth.middleware";
import {
  downloadPass,
  scanPass,
  sendPass,
} from "../controllers/pass.controller";

import { Router } from "express";

const passRoute = Router();

// download pass
passRoute.get("/download/:studentId", downloadPass);
// send pass by email
passRoute.get("/send/:studentId", sendPass);
// scan pass qrcode
passRoute.post("/scan", scanPass);

export default passRoute;
