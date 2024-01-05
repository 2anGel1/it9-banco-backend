import PassMail from "../mail-template/pass-mail";
import { generatePDF, logoAttachment, generateQRCODE, deleteFile } from "../utils/pdf-utils";
import { sendMail } from "../utils/mail-utils";
import { readFilePath, writeFilePath } from "../config/index";
import { render } from "@react-email/render";
import { Request, Response } from 'express';
import { prisma } from "../config";

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
      const result = await generatePDF(fileName, { firstName: student.firstName, lastName: student.lastName, classe: student.class }, true, qrcodeReadPath);
      await deleteFile(qrcodeWritePath);

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