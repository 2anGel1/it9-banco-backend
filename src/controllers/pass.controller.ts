import PassMail from "../mail-template/pass-mail";
import { generatePDF, logoAttachment, generateQRCODE } from "../utils/pdf-utils";
import { sendMail } from "../utils/mail-utils";
import { readFilePath, writeFilePath } from "../utils/code-utils";
import { render } from "@react-email/render";
import { Request, Response } from 'express';
import { hash } from "../utils/hash-utils";
import { prisma } from "../config";


// store student pass
export const storePass = async (req: Request, res: Response) => {
  try {

    const reqBody = req.body;

    const student = await prisma.etutiant.findUnique({
      where: {
        id: reqBody.studentId
      }
    });

    if (student) {
      const existingPass = await prisma.pass.findUnique({
        where: {
          etudiantId: student.id
        }
      });

      if (existingPass) {
        return res.status(400).json({ message: "Cet étudiant a déja un ticekt." });
      }

      await prisma.pass.create({
        data: {
          etudiantId: student.id,
          qrValue: hash(student.matricule)
        }
      });

      return res.json({ message: "Ticket généré avec succès." });
    }

    return res.status(400).json({ message: "Cet étudiant n'existe pas." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
// send student pass
export const sendPass = async (req: Request, res: Response) => {
  try {

    const student = await prisma.etutiant.findUnique({
      where: {
        id: req.params.studentId
      }
    });

    if (!student) {
      return res.status(400).json({ message: "Cet étudiant n'existe pas." });
    }

    let studentPass = await prisma.pass.findUnique({
      where: {
        etudiantId: student.id
      }
    });

    if (!studentPass) {
      return res.status(400).json({ message: "Cet étudiant n'a pas de ticket." });
    }

    const fileName = student.lastName + ".pdf";
    const qrcodeWritePath = writeFilePath + "/qrcodes/" + student.lastName + ".png";
    const qrcodeReadPath = readFilePath + "/qrcodes/" + student.lastName + ".png";
    
    await generateQRCODE(studentPass.qrValue, qrcodeWritePath);
    await generatePDF(fileName, student.firstName, student.lastName, false, qrcodeReadPath);
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

    return res.json({ message: "Ticket envoyé avec succès." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
// download student pass
export const downloadPass = async (req: Request, res: Response) => {
  try {
    try {

      const student = await prisma.etutiant.findUnique({
        where: {
          id: req.params.studentId
        }
      });

      if (!student) {
        return res.status(400).json({ message: "Cet étudiant n'existe pas." });
      }

      let studentPass = await prisma.pass.findUnique({
        where: {
          etudiantId: student.id
        }
      });

      if (!studentPass) {
        return res.status(400).json({ message: "Cet étudiant n'a pas de ticket." });
      }

      const fileName = student.lastName + ".pdf";
      const qrcodeWritePath = writeFilePath + "/qrcodes/" + student.lastName + ".png";
      const qrcodeReadPath = readFilePath + "/qrcodes/" + student.lastName + ".png";
      
      await generateQRCODE(studentPass.qrValue, qrcodeWritePath);
      const result = await generatePDF(fileName, student.firstName, student.lastName, true, qrcodeReadPath);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

      result.pipe(res);

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } catch (error) {

  }
}