import vine from "@vinejs/vine";

//
export const jwtSchema = vine.string().jwt();
//
export const idSchema = vine.string().minLength(10);