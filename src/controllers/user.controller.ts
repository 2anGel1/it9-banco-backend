import { storeStudentValidator } from "../validators/user-validators";
const readXlsxFile = require('read-excel-file/node');
import { deleteFile } from "../utils/pdf-utils";
import { Request, Response } from 'express';
import { hash } from "../utils/hash-utils";
import { prisma } from "../config";


// get all students
export const getAll = async (req: Request, res: Response) => {
  try {
    const reqBody = req.body;
    let students: Array<any> = [];

    if (!reqBody.filter) {

      students = await prisma.etutiant.findMany({
        include: {
          pass: true
        }
      });

    } else {

      students = await prisma.etutiant.findMany({
        where: {
          pass: reqBody.filter == "a" ? {
            aCheck: true
          } : { dCheck: true }
        }
      });

    }
    res.status(200).json({ status: true, data: students });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
// store student
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

    const etudiant = await prisma.etutiant.create({
      data: {
        firstName: userData.firstName.toUpperCase(),
        lastName: userData.lastName.toUpperCase(),
        class: userData.class,
        email: userData.email
      }
    });

    await prisma.pass.create({
      data: {
        etudiantId: etudiant.id,
        qrValue: hash(etudiant.matricule)
      }
    });

    return res.status(200).json({ status: true, message: "Etudiant crée avec succès." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
// update student 
export const updateStudent = async (req: Request, res: Response) => {
  try {

    const reqBody = req.body;
    const existingStudent = await prisma.etutiant.findUnique({
      where: {
        id: reqBody.studentId
      }
    });

    if (!existingStudent) {
      return res.status(400).json({ message: "Cet étudiant n'existe déja." });
    }

    await prisma.etutiant.update({
      where: {
        id: existingStudent.id
      },
      data: {
        firstName: reqBody.firstName.toUpperCase(),
        lastName: reqBody.lastName.toUpperCase(),
        class: reqBody.class,
        email: reqBody.email
      }
    });

    return res.status(200).json({ status: true, message: "Etudiant mis à jour avec succès." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
// import users excel file
export const storeFile = async (req: any, res: Response) => {
  try {

    const excel = req.files.file;

    if (excel.mimetype != "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      res.status(200).json({ message: "Fichier invalide" });
      deleteFile(excel.tempFilePath);
    }

    await readXlsxFile(excel.tempFilePath).then(async (rows: any) => {
      await rows.forEach(async (row: any) => {
        try {
          const firstName = row[1];
          const lastName = row[0];
          const classe = row[2];
          const email = row[3];

          let exEtudiant = await prisma.etutiant.findUnique({
            where: {
              email: email
            }
          });

          if (!exEtudiant) {
            exEtudiant = await prisma.etutiant.create({
              data: {
                class: classe,
                firstName: firstName.toUpperCase(),
                lastName: lastName.toUpperCase(),
                email,
              }
            });
            await prisma.pass.create({
              data: {
                qrValue: hash(exEtudiant.matricule),
                etudiantId: exEtudiant.id,
              }
            });
          }
        } catch (error) {
          res.status(200).json({ message: "Fichier invalide" });
        }

      });
    })

    res.status(200).json({ status: true, message: "Fichier importé avec succès" });

  } catch (error: any) {
    console.log(error);
    if (error.code == 'ENOENT' || error.errno == -2) {
      console.log("File import issue");
      res.status(200).json({ message: "Fichier invalide" });
    }else if(error.code == 'ERR_HTTP_HEADERS_SENT'){
      res.status(200).json({ message: "Fichier invalide" });
    }
    res.status(500).json({ message: "Erreur interne au serveur" });
  }
}

