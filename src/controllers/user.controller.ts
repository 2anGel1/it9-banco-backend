import { storeStudentValidator } from "./../validators/user-validators"
import PassMail from "../mail-template/pass-mail";
import { sendMail } from "../utils/mail-utils";
import { render } from "@react-email/render";
import { Request, Response } from 'express'
import { hash } from "../utils/hash-utils";
import { prisma } from "../config";
import { generatePDF } from "../utils/pdf-utils";
import { saveAs } from 'file-saver';
const fs = require("fs");


export const getLoggedInUser = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(400).json({ message: "User doesn't exist" });
      return;
    }
    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const storeStudent = async (req: Request, res: Response) => {
  try {

    const reqBody = req.body;
    let userData = await storeStudentValidator.validate(reqBody);

    const existingStudent = await prisma.etutiant.findUnique({
      where: {
        email: userData.email
      }
    });

    if (existingStudent) {
      return res.status(400).json({ message: "Cet étudiant existe déja." });
    }

    const et = await prisma.etutiant.create({
      data: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        class: userData.class,
        email: userData.email
      }
    });

    if (reqBody.pass) {
      await prisma.pass.create({
        data: {
          etudiantId: et.id,
          qrValue: hash(et.matricule)
        }
      });

      // await sendMail({
      //   subject: "IT9 - Banco",
      //   to: et.email,
      //   html: render(PassMail({ firstName: et.firstName, lastName: et.lastName }))
      // })
    }

    return res.json({ message: "Etudiant crée avec succès." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const storeStudentPass = async (req: Request, res: Response) => {
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

export const sendStudentPass = async (req: Request, res: Response) => {
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
      studentPass = await prisma.pass.create({
        data: {
          etudiantId: student.id,
          qrValue: hash(student.matricule)
        }
      });
    }

    // const result = await generatePDF({ "data": "this is a message" });

    await sendMail({
      subject: "IT9 - Banco",
      to: student.email,
      html: render(PassMail({ firstName: student.firstName, lastName: student.lastName, logoPath: "/Users/scopy/Documents/it9-banco-backend/src/assets/images/bancoLogo.png" })),
      attachements: [
        // {
        //   filename: "example.pdf",
        //   path: "/Users/scopy/Documents/it9-banco-backend/src/assets/pdf/example.pdf",
        // },
      ]
    });

    return res.json({ message: "" });


  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const downloadStudentPass = async (req: Request, res: Response) => {
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
        studentPass = await prisma.pass.create({
          data: {
            etudiantId: student.id,
            qrValue: hash(student.matricule)
          }
        });
      }

      const result = await generatePDF({ "data": "this is a message" });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=export.pdf`);

      result.pipe(res);

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } catch (error) {

  }
}