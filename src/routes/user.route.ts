import { requireAuth } from "../middlewares/auth.middleware";
import {
  getLoggedInUser,
  updateStudent,
  storeStudent,
} from "../controllers/user.controller";
import { Router } from "express";

const userRoute = Router();

// get connected user
userRoute.get("/user", requireAuth, getLoggedInUser);
// upadte student
userRoute.put("/update", requireAuth, updateStudent);
// store student
userRoute.post("/store", requireAuth, storeStudent);

export default userRoute;
