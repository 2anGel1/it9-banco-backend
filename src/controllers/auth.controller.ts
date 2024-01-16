import { verificationForPasswordResetValidator, passwordResetValidator, newPasswordValidator, signupValidator, loginValidator } from "../validators/auth-validators";
import { generatePasswordResetToken, verifyPasswordResetToken } from "../utils/token-utils";
import { passwordResetCookie, sessionIdCookie } from "../constants/cookies-constants";
import { comparePlainTextToHashedText, hash } from "../utils/hash-utils";
import PasswordResetMail from "../mail-template/password-reset-mail";
import { createSession, leaveSession } from "../utils/session-utils";
import { generateRandomCode } from "../utils/code-utils";
import { sendMail } from "../utils/mail-utils";
import { render } from "@react-email/render";
import { Request, Response } from 'express';
import { prisma } from "../config";
const axios = require('axios');

// login user
export const login = async (req: Request, res: Response) => {
  try {

    const reqBody = await req.body;
    const { email, password } = await loginValidator.validate(reqBody);

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(200).json({ status: false, message: "Email incorrecte." });
    }
    const isPasswordValid = comparePlainTextToHashedText(
      password,
      user.passwordHash!
    );
    if (!isPasswordValid) {
      return res.status(200).json({ status: false, message: "Mot de passe incorrect." });
    }

    const sessionToken = await createSession(user.id);
    return res.status(200).json({ status: true, message: "Login success", token: sessionToken });

  } catch (error: any) {

    console.log(error);
    if (error.code == "E_VALIDATION_ERROR") {
      console.log("Erreur de validation");
      return res.status(200).json({ status: false, message: "Remplissez tous les champs correctement" })
    }
    return res.status(500).json({ message: "Erreur interne au serveur" });
  }

};
// logout user
export const logout = async (req: Request, res: Response) => {
  try {
    const sessionToken = req.body.session.sessionToken;

    await leaveSession(sessionToken);

    // Effacez le cookie de session
    res.clearCookie(sessionIdCookie.name, {
      ...sessionIdCookie.options,
    });

    res.status(200).json({ status: true, message: "Logout success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// signup user
export const signup = async (req: Request, res: Response) => {

  try {

    const reqBody = await req.body;
    let userData = !req.body.seed ? await signupValidator.validate(reqBody) : { pseudo: "admin", email: "admin@gmail.com", password: "admin" };
    const { email, password, pseudo } = userData;


    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (existingUser) {
      return res.status(200).json({ status: false, message: "Cet utilisateur existe déjà." });
    }

    await prisma.user.create({
      data: {
        email: email,
        pseudo: pseudo,
        passwordHash: hash(password)
      }
    });

    return res.status(200).json({ status: true, message: "Utilisateur crée avec succès." });

  } catch (error: any) {
    // console.log(error);
    if (error.code == "E_VALIDATION_ERROR") {
      console.log("Erreur de validation");
      return res.status(200).json({ status: false, message: "Remplissez tous les champs correctement" })
    }
    return res.status(500).json({ message: "Erreur interne au serveur" });
  }
};
// password reset request
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
// paswword reset verification 
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
// new password generation
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
// get all admin
export const getAllAdmin = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json({ status: true, data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
// delete admin
export const deleteAdmin = async (req: Request, res: Response) => {

  try {

    const id = req.params.adminId;

    const admin = await prisma.user.findUnique({
      where: {
        id
      }
    });

    if (!admin) {
      return res.status(200).json({ status: false, message: "Id invalide" });
    }

    if (admin.email == "admin@gmail.com") {
      return res.status(200).json({ status: false, message: "Cet utilisateur ne peut pas être supprimé" });
    }

    await prisma.user.delete({
      where: {
        id
      }
    });

    return res.status(200).json({ status: true, message: "Étudiant supprimé avec succès" });

  } catch (error) {

    return res.status(500).json({ message: "Erreur interne au serveur" });

  }

}


//
export const firbaseTest = async (req: Request, res: Response) => {
  try {

    await axios.post("https://fcm.googleapis.com/fcm/send", {
      to: "eogHvfe2QOGfb0YaRPUrqB:APA91bFx1lL-AQZpeFPcoMf3VRkIDiXbptX1DNQ8ztyZF4JhYUJWmdFmVkNGQcVyoBGVezXZP1aXRLiwq7-EdbYWTcqeqBzKnLiCquymf4brFeaVSz3faAK5f6X8PRVpLH-vLpPxGxWO",
      notification: {
        title: req.body.title,
        body: req.body.body
      },
      data: {
        url: "data:image/png;base64,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"
      }
    }, {
      headers: {
        "Authorization": "key=AAAAohxw37Y:APA91bF5x6YBxF7w2QNp3ueHLDLCsvnu1mYilgzQ1L6P4AL5tGBwv_hqPfig63NeDKAC-JMs1y0JbaOyFIDxkIOn0oYVD54xFPukYKDzL_kCeRjyRNfuHF5ZxXvGbGj-MiEiQ_MJSo2H"
      }
    }).then((rr: any) => {
      console.log("RESPONSE");
      if (rr.status == 200) {
        res.status(200).json({ message: "Ok" });
      }
    }).catch((err: any) => {
      console.log("ERROR");
      console.error(err);
      return res.status(400).json({ message: "Erreur", error: err });


    })

  } catch (error) {

    return res.status(500).json({ message: "Erreur interne au serveur" });

  }
} 
