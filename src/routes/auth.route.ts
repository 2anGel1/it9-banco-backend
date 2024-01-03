import express from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { login, logout, newPassword, passwordReset, signup, verificationForPasswordReset } from "../controllers/auth.controller";

const authRoute = express.Router();
//
authRoute.post("/signup", signup);
authRoute.post("/login", login);
authRoute.get("/logout", requireAuth, logout);
// Password reset
authRoute.post("/password-reset", passwordReset);
authRoute.post("/password-reset/verification", verificationForPasswordReset);
authRoute.post("/password-reset/new-password", newPassword);

export default authRoute;
