import {
  loginValidator,
  newPasswordValidator,
  passwordResetValidator,
  signupValidator,
  verificationForPasswordResetValidator,
} from "../validators/auth-validators";
import { comparePlainTextToHashedText, hash } from "../utils/hash-utils";
import { createSession, leaveSession } from "../utils/session-utils";
import { generateRandomCode } from "../utils/code-utils";
import {
  passwordResetCookie,
  sessionIdCookie,
} from "../constants/cookies-constants";
import {
  generatePasswordResetToken,
  verifyPasswordResetToken,
} from "../utils/token-utils";
import { render } from "@react-email/render";
import { sendMail } from "../utils/mail-utils";
import PasswordResetMail from "../mail-template/password-reset-mail";
import { prisma } from "../config";
import { Request, Response } from 'express'


//
export const login = async (req: Request, res: Response) => {
  const reqBody = await req.body;

  const { email, password } = await loginValidator.validate(reqBody);

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return res.status(400).json({ message: "Email incorrecte." });
  }
  const isPasswordValid = comparePlainTextToHashedText(
    password,
    user.passwordHash!
  );
  if (!isPasswordValid) {
    return res.status(400).json({ message: "Mot de passe incorrect." });
  }

  const sessionId = await createSession(user.id);
  res.cookie(sessionIdCookie.name, sessionId, sessionIdCookie.options)
  return res.json({ message: "Login success" });
};

//
export const logout = async (req: Request, res: Response) => {
  try {
    const sessionToken = req.body.session.sessionToken;


    await leaveSession(sessionToken);

    // Effacez le cookie de session
    res.clearCookie(sessionIdCookie.name, {
      ...sessionIdCookie.options,
    });

    res.json({ message: "Logout success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//
export const signup = async (req: Request, res: Response) => {
  const reqBody = await req.body;
  let userData = !req.body.seed ? await signupValidator.validate(reqBody) : { pseudo: "admin", email: "admin@gmail.com", password: "admin" };
  const { email, password, pseudo } = userData;
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (existingUser) {
      return res.status(400).json({ message: "Cet utilisateur existe déjà." });
    }

    await prisma.user.create({
      data: {
        email: email,
        pseudo: pseudo,
        passwordHash: hash(password)
      }
    });

    return res.json({ status: true, message: "Utilisateur crée avec succès." });

  } catch (error: any) {
    return res.status(400).json({ message: "Une erreur inconnue ai survenue !" });
  }
};

//
//
export const passwordReset = async (req: Request, res: Response) => {
  const reqBody = await req.body;
  const { email } = await passwordResetValidator.validate(reqBody);

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (user === null) {
    return res.status(400).json({ message: "L'adresse mail ne correspond à aucun utilisateur" });
  }
  const plainCode = generateRandomCode();
  const hashedCode = hash(plainCode);
  console.log(plainCode);
  
  const passwordReset = await prisma.passwordReset.create({
    data: {
      code: hashedCode,
      userId: user.id,
      attempt: 1,
      codeVerified: false,
      ip: "ip",
      reset: false,
      createdAt: new Date(),
    },
  });
  const passwordResetToken = generatePasswordResetToken(passwordReset.id);

  await sendMail({
    subject: "Réinitialiser votre mot de passe",
    to: user.email!,
    html: render(PasswordResetMail({ verificationCode: plainCode })),
  });
  res.cookie(passwordResetCookie.name, passwordResetToken, passwordResetCookie.options);

  return res.status(200).json({ message: "A code has been sent to your e-mail address" });
};

//
export const verificationForPasswordReset = async (req: Request, res: Response) => {
  try {
    const reqBody = req.body;
    
    const passwordResetToken = req.cookies[passwordResetCookie.name];
    const { code, token } = await verificationForPasswordResetValidator.validate({
      code: reqBody.code,
      token: passwordResetToken,
    });

    const { id } = verifyPasswordResetToken(token);

    const passwordReset = await prisma.passwordReset.findUnique({
      where: {
        id,
      },
    });

    if (!passwordReset) {
      throw new Error("Not found");
    }

    if (passwordReset.codeVerified) {
      throw new Error("Déjà vérifié");
    }

    if (passwordReset.attempt === 5) {
      throw new Error("Le nombre maximal d'essais a été atteint");
    }

    const codeIsValid = comparePlainTextToHashedText(code, passwordReset.code);

    if (!codeIsValid) {
      await prisma.passwordReset.update({
        where: {
          id,
        },
        data: {
          attempt: {
            increment: 1,
          },
        },
      });
      throw new Error("Code incorrect");
    }

    await prisma.passwordReset.update({
      where: {
        id,
      },
      data: {
        codeVerified: true,
        codeVerifiedAt: new Date(),
        attempt: {
          increment: 1,
        },
      },
    });

    return res.json({ message: "Vérifié" });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error });
  }
};

//
export const newPassword = async (req: Request, res: Response) => {
  try {
    const reqBody = req.body;
    const passwordResetToken = req.cookies[passwordResetCookie.name];

    let { newPassword, token } = await newPasswordValidator.validate({
      newPassword: reqBody.newPassword,
      token: passwordResetToken,
    });

    const { id } = verifyPasswordResetToken(token);
    newPassword = hash(newPassword);

    const passwordReset = await prisma.passwordReset.findUnique({
      where: {
        id,
      },
    });

    if (!passwordReset) {
      throw new Error("Not found");
    }

    if (!passwordReset.codeVerified) {
      throw new Error("Code not verified");
    }

    if (passwordReset.reset) {
      throw new Error("Déjà réinitialisé");
    }

    await prisma.passwordReset.update({
      where: {
        id,
      },
      data: {
        reset: true,
        resetAt: new Date(),
      },
    });

    const user = await prisma.user.update({
      where: {
        id: passwordReset.userId,
      },
      data: {
        passwordHash: newPassword,
      },
    });

    const sessionId = await createSession(user.id);

    // Effacez le cookie passwordResetCookie
    res.clearCookie(passwordResetCookie.name);

    // Définissez le cookie de session
    // res.cookie(sessionIdCookie.name, sessionId, sessionIdCookie.options);

    return res.json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error });
  }
};

