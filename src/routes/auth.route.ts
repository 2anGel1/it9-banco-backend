import { login, logout, newPassword, passwordReset, signup, verificationForPasswordReset, getAllAdmin, deleteAdmin } from "../controllers/auth.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import express from "express";

const authRoute = express.Router();

// password reset: finalisation
authRoute.post("/password-reset/verification", requireAuth, verificationForPasswordReset);
// password reset: verification
authRoute.post("/password-reset/new-password", requireAuth, newPassword);
// sign up first user
authRoute.delete("/delete/:adminId", requireAuth, deleteAdmin);
// password reset: initialisation
authRoute.post("/password-reset", requireAuth, passwordReset);
// get all admin
authRoute.get('/all', requireAuth, getAllAdmin);
// store an admin
authRoute.post("/store", requireAuth, signup);
// logout admin
authRoute.get("/logout", requireAuth, logout);
// sign up first user
authRoute.post("/seed", signup);
// login user
authRoute.post("/login", login);

export default authRoute;
