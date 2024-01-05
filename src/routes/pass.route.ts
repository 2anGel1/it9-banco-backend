import { requireAuth } from "../middlewares/auth.middleware";
import {
  downloadPass,
  scanPass,
  sendPass,
} from "../controllers/pass.controller";

import { Router } from "express";

const passRoute = Router();

// send pass by email
passRoute.get("/send/:studentId", requireAuth, sendPass);
// download pass
passRoute.get("/download/:studentId", downloadPass);
// scan pass qrcode
passRoute.post("/scan", requireAuth, scanPass);

export default passRoute;
