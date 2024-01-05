const session = require('express-session');
const cookieParser = require("cookie-parser");
import { Request, Response, NextFunction } from 'express';
import { getActiveSession } from "../utils/session-utils";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    console.log(req.headers);
    
    const tok = req.headers.authorization?.toString();
    const sessionToken = tok?.substring(7, tok.length);
    
    if (!sessionToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const session = await getActiveSession(sessionToken);

    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    req.body.session = session;
    next();

  } catch (error: any) {

    if (error.code == "E_VALIDATION_ERROR") {
      console.log(error);
      return res.status(200).json({ status: false, message: "Remplissez tous les champs correctement" })
    }

    res.status(500).json({ message: 'Erreur interne au serveur' });
  }
};
