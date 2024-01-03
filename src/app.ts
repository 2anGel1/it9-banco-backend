const cookieParser = require('cookie-parser');
import authRoute from "./routes/auth.route";
import userRoute from "./routes/user.route";
import passRoute from "./routes/pass.route";
const session = require("express-session");
import { Session } from "express-session";
import express from "express";
const cors = require("cors");
import path from 'path';
import ms from "ms";
import { rootPath } from "./utils/code-utils";

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
app.use(basePath + "/student", userRoute);
app.use(basePath + "/auth", authRoute);
app.use(basePath + "/pass", passRoute);


app.use('/ressources', express.static(path.join(__dirname, 'assets')));

var process = require('child_process');
process.exec('ls src/assets',function (err: any, stdout:any ,stderr:any) {
    if (err) {
        console.log("\n"+stderr);
    } else {
        console.log(stdout);
    }
});

export { app };
