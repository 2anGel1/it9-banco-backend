import vine from "@vinejs/vine";

import { studentIdSchema, qrCodeSchema } from "./schemas";

//
export const scanPassSchema = vine.object({ qrcodeValue: qrCodeSchema, studentId: studentIdSchema, });