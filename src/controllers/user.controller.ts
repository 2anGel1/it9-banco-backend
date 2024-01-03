import { storeStudentValidator } from "../validators/user-validators";
import { Request, Response } from 'express';
import { hash } from "../utils/hash-utils";
import { prisma } from "../config";

// get connected user
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
    }

    return res.json({ message: "Etudiant crée avec succès." });

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
        firstName: reqBody.firstName,
        lastName: reqBody.lastName,
        class: reqBody.class,
        email: reqBody.email
      }
    });

    return res.json({ message: "Etudiant mis à jour avec succès." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
