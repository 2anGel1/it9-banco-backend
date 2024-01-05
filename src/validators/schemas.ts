import vine from "@vinejs/vine";

//
export const studentIdSchema = vine.string().minLength(10);
//
export const qrCodeSchema = vine.string().minLength(10);
//
export const jwtSchema = vine.string().jwt();
