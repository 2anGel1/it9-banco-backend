import express from "express";
const cors = require("cors");
const cookieParser = require('cookie-parser');
const session = require("express-session");
import ms from "ms";
import authRoute from "./routes/auth.route";
import { Session } from "express-session";
import userRoute from "./routes/user.route";

declare module "express" {
  interface Request {
    session: Session & { [key: string]: any };
  }
}

const app = express();
app.use(cookieParser());
const basePath = "/api";
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: ms("1y"),
    },
  })
);
app.use(express.json());
app.use(basePath + "/auth", authRoute);
app.use(basePath + "/student", userRoute);

export { app };
