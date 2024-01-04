import { requireAuth } from "../middlewares/auth.middleware";
import {
  downloadPass,
  storePass,
  sendPass,
} from "../controllers/pass.controller";

import { Router } from "express";

const passRoute = Router();

// download pass
passRoute.get("/download/:studentId", requireAuth, downloadPass);
// send pass by email
passRoute.get("/send/:studentId", requireAuth, sendPass);
// generate pass
passRoute.post("/store", requireAuth, storePass);

export default passRoute;
