import { requireAuth } from "../middlewares/auth.middleware";
import {
  updateStudent,
  storeStudent,
  getAll,
} from "../controllers/user.controller";
import { Router } from "express";

const userRoute = Router();

// get connected user
userRoute.get("/all", requireAuth, getAll);
// upadte student
userRoute.put("/update", requireAuth, updateStudent);
// store student
userRoute.post("/store", requireAuth, storeStudent);

export default userRoute;
