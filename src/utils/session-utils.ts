import { prisma } from '../config'
import { nanoid } from "nanoid";

export const generateSessionToken = () => {
  return nanoid(60);
};

export const calculateSessionExpiration = () => {
  const currentDate = new Date();
  const hoursToAdd = 24;
  const expirationDate = new Date(currentDate.getTime() + hoursToAdd * 60 * 60 * 1000);
  return expirationDate;
};

//
//

export const createSession = async (userId: string) => {

  const sessionToken = generateSessionToken();
  const expires = calculateSessionExpiration();

  try {
    let session = await prisma.session.findFirst({
      where: {
        userId,
        OR: [
          {
            active: true
          },
          {
            expires: {
              gte: new Date(),
            }
          }
        ]
      }
    });
    if (!session) {
      session = await prisma.session.create({
        data: {
          userId,
          sessionToken,
          expires,
        },
      });
    }
    return session.sessionToken;

  } catch (error) {
    console.error("Erreur lors de la création de la session :", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

//
//
//
export const getActiveSession = async (sessionToken: string) => {
  const session = await prisma.session.findFirst({
    where: {
      sessionToken,
      expires: {
        gte: new Date(),
      },
    },
  });

  if (!session || !session.active) {
    return null;
  }

  return session;
};
//
//
//
export const leaveSession = async (sessionToken: string) => {
  const session = await prisma.session.findFirst({
    where: {
      sessionToken,
      active: true,
    },
  });

  if (!session) {
    throw new Error("La session n'est pas active ou n'existe pas.");
  }

  await prisma.session.update({
    where: {
      sessionToken,
    },
    data: {
      active: false,
      expires: new Date(),
    },
  });
};
