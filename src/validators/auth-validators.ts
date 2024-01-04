import vine from "@vinejs/vine";
import { emailSchema, firstNameSchema, lastNameSchema, passwordSchema, pseudoSchema, usernameSchema } from "./user-validators";

//
const codeShema = vine.string().fixedLength(6);
//
const jwtSchema = vine.string().jwt();
// usernameSchema

const loginSchema = vine.object({
  password: passwordSchema,
  email: emailSchema,
});

const signupSchema = vine.object({
  email: emailSchema,
  password: passwordSchema,
  pseudo: pseudoSchema,
});

export const passwordResetSchema = vine.object({
  email: emailSchema,
});

export const verificationForPasswordResetSchema = vine.object({
  code: codeShema,
  token: jwtSchema,
});

export const newPasswordSchema = vine.object({
  newPassword: passwordSchema,
  token: jwtSchema,
});
const googleAccessTokenSchema = vine.string();
const sessionIdSchema = vine.string().maxLength(400);

export const usernameValidator = vine.compile(usernameSchema);

export const loginValidator = vine.compile(loginSchema);
export const signupValidator = vine.compile(signupSchema);
export const passwordResetValidator = vine.compile(passwordResetSchema);
export const verificationForPasswordResetValidator = vine.compile(verificationForPasswordResetSchema);
export const newPasswordValidator = vine.compile(newPasswordSchema);

export const googleAccessTokenValidator = vine.compile(googleAccessTokenSchema);
export const sessionIdValidator = vine.compile(sessionIdSchema);
