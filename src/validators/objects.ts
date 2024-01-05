import vine from "@vinejs/vine";

import { jwtSchema, idSchema } from "./schemas";

export const scanPassSchema = vine.object({ qrcodeValue: jwtSchema, studentId: idSchema, });