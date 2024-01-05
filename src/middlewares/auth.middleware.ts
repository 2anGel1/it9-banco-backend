const session = require('express-session');
const cookieParser = require("cookie-parser");
import { Request, Response, NextFunction } from 'express';
import { sessionIdCookie } from "../constants/cookies-constants";
import { getActiveSession } from "../utils/session-utils";
import { sessionIdValidator } from "../validators/auth-validators";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(req.headers);
    // const sessionId = await sessionIdValidator.validate(
    //   req.cookies[sessionIdCookie.name]
    // );

    // const session = await getActiveSession(sessionId);

    // if (session) {
    //   req.body.session = session;
    //   next();
    // } else {
    //   res.status(401).json({ message: 'Unauthorized' });
    // }
  } catch (error: any) {
    if (error.code == "E_VALIDATION_ERROR") {
      console.log("Erreur de validation");
      return res.status(200).json({ status: false, message: "Remplissez tous les champs correctement" })
    } res.status(401).json({ message: 'Unauthorized' });
  }
};
