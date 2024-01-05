import { requireAuth } from "../middlewares/auth.middleware";
import {
  downloadPass,
  sendPass,
} from "../controllers/pass.controller";

import { Router } from "express";

const passRoute = Router();

// download pass
passRoute.get("/download/:studentId", downloadPass);
// send pass by email
passRoute.get("/send/:studentId", sendPass);

export default passRoute;
