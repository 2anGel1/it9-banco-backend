import PassMail from "../mail-template/pass-mail";
import { generatePDF, logoAttachment, generateQRCODE, deleteFile } from "../utils/pdf-utils";
import { sendMail } from "../utils/mail-utils";
import { readFilePath, writeFilePath } from "../config/index";
import { render } from "@react-email/render";
import { Request, Response } from 'express';
import { prisma } from "../config";
import { scanPassValidator } from "../validators/user-validators";
import { comparePlainTextToHashedText } from "../utils/hash-utils";

// send student pass
export const sendPass = async (req: Request, res: Response) => {
  try {

    const student = await prisma.etutiant.findUnique({
      where: {
        id: req.params.studentId
      }
    });

    if (!student) {
      return res.status(200).json({ status: false, message: "Cet étudiant n'existe pas." });
    }

    let studentPass = await prisma.pass.findUnique({
      where: {
        etudiantId: student.id
      }
    });

    if (!studentPass) {
      return res.status(200).json({ status: false, message: "Cet étudiant n'a pas de ticket." });
    }

    const fileName = student.lastName + ".pdf";
    const qrcodeWritePath = writeFilePath + "/qrcodes/" + student.lastName + ".png";
    const qrcodeReadPath = readFilePath + "/qrcodes/" + student.lastName + ".png";

    await generateQRCODE(studentPass.qrValue, qrcodeWritePath);
    await generatePDF(fileName, { firstName: student.firstName, lastName: student.lastName, classe: student.class }, false, qrcodeReadPath);
    await sendMail({
      subject: "IT9 - Banco",
      to: student.email,
      html: render(PassMail({ firstName: student.firstName, lastName: student.lastName })),
      attachments: [
        {
          filename: fileName,
          path: readFilePath + "/pdf/" + fileName,
        },
        logoAttachment
      ]
    });

    await deleteFile(writeFilePath + "/pdf/" + fileName);
    await deleteFile(qrcodeWritePath);

    return res.status(200).json({ status: true, message: "Ticket envoyé avec succès." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
// download student pass
export const downloadPass = async (req: Request, res: Response) => {
  try {

    const student = await prisma.etutiant.findUnique({
      where: {
        id: req.params.studentId
      }
    });

    if (!student) {
      return res.status(200).json({ status: false, message: "Cet étudiant n'existe pas." });
    }

    let studentPass = await prisma.pass.findUnique({
      where: {
        etudiantId: student.id
      }
    });

    if (!studentPass) {
      return res.status(200).json({ status: false, message: "Cet étudiant n'a pas de ticket." });
    }

    const fileName = student.lastName + ".pdf";
    const qrcodeWritePath = writeFilePath + "/qrcodes/" + student.lastName + ".png";
    const qrcodeReadPath = readFilePath + "/qrcodes/" + student.lastName + ".png";

    await generateQRCODE(studentPass.qrValue, qrcodeWritePath);
    const result = await generatePDF(fileName, { firstName: student.firstName, lastName: student.lastName, classe: student.class }, true, qrcodeReadPath);
    await deleteFile(qrcodeWritePath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

    result.pipe(res);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur interne au serveur" });
  }
}
// scan pass qrcode
export const scanPass = async (req: Request, res: Response) => {
  try {

    const reqBody = req.body;
    const { studentId, qrcodeValue } = await scanPassValidator.validate(reqBody);

    const student = await prisma.etutiant.findFirst({
      where: {
        id: studentId
      },
      include: {
        pass: true
      }
    });

    if (!student) {
      return res.status(200).json({ status: false, message: "Qr-code invalide" });
    }

    const isQrcodeValid = comparePlainTextToHashedText(student!.matricule, qrcodeValue);
    if (!isQrcodeValid) {
      return res.status(200).json({ status: false, message: "Qr-code invalide" });
    }

    let pass = await prisma.pass.findFirst({
      where: {
        etudiantId: studentId
      }
    });

    if (!pass?.aCheck) {
      await prisma.pass.update({
        where: {
          etudiantId: studentId
        },
        data: {
          aCheck: true
        }
      });

      return res.status(200).json({ status: true, message: "Bienvenue" });
    } else if (!pass.dCheck) {

      await prisma.pass.update({
        where: {
          etudiantId: studentId
        },
        data: {
          dCheck: true
        }
      });

      return res.status(200).json({ status: true, message: "Aurevoir" });
    }

    return res.status(200).json({ status: false, message: "Qr-code expiré" });

  } catch (error: any) {

    // console.log(error);
    if (error.code == "E_VALIDATION_ERROR") {
      console.log("Erreur de validation");
      return res.status(200).json({ status: false, message: "Remplissez tous les champs correctement" })
    }
    return res.status(500).json({ message: "Erreur interne au serveur" });

  }
}