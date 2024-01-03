import { Router } from "express";
import {
  downloadStudentPass,
  storeStudentPass,
  sendStudentPass,
  getLoggedInUser,
  storeStudent,
} from "../controllers/user.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const userRoute = Router();

userRoute.get("/user", requireAuth, getLoggedInUser);

// create student
userRoute.post("/store", requireAuth, storeStudent);
// generate pass
userRoute.post("/store/pass", requireAuth, storeStudentPass);
// send pass by email
userRoute.get("/pass/send/:studentId", requireAuth, sendStudentPass);
// download pass
userRoute.get("/pass/dowload/:studentId", requireAuth, downloadStudentPass);

export default userRoute;
