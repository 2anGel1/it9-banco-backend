import { login, logout, newPassword, passwordReset, signup, verificationForPasswordReset } from "../controllers/auth.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import express from "express";

const authRoute = express.Router();
// store an admin
authRoute.post("/store", requireAuth, signup);
// logout admin
authRoute.get("/logout", requireAuth, logout);
// sign up first user
authRoute.post("/seed", signup);
// login user
authRoute.post("/login", login);
// Password reset
authRoute.post("/password-reset", passwordReset);
authRoute.post("/password-reset/verification", verificationForPasswordReset);
authRoute.post("/password-reset/new-password", newPassword);

export default authRoute;
