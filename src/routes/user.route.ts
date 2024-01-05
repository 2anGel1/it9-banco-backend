import { updateStudent, storeStudent, storeFile, getAll } from "../controllers/user.controller";
import { requireAuth } from "../middlewares/auth.middleware";
const fileUpload = require("express-fileupload");
import { Router } from "express";

const uploadsOpt = {
  tempFileDir: "/tmp/",
  useTempFiles: true,
};

const userRoute = Router();

// import excel file
userRoute.post("/import-file", requireAuth, fileUpload(uploadsOpt), storeFile);
// upadte student
userRoute.post("/update", requireAuth, updateStudent);
// store student
userRoute.post("/store", requireAuth, storeStudent);
// get connected user
userRoute.post("/all", requireAuth, getAll);

export default userRoute;
