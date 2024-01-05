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
userRoute.post("/import-file", fileUpload(uploadsOpt), storeFile);
// upadte student
userRoute.post("/update", updateStudent);
// store student
userRoute.post("/store", storeStudent);
// get connected user
userRoute.post("/all", getAll);

export default userRoute;
