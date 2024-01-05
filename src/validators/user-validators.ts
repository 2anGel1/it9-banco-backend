import vine from "@vinejs/vine";
import { scanPassSchema } from "./objects";

// Fields
export const firstNameSchema = vine.string().minLength(1).maxLength(50);
//
export const lastNameSchema = vine.string().minLength(1).maxLength(50);
//
export const emailSchema = vine.string().email();
//
export const usernameSchema = vine.string().minLength(3).maxLength(50);
//
export const passwordSchema = vine.string().minLength(5).maxLength(100);
//
export const pseudoSchema = vine.string().minLength(1).maxLength(50);
//
export const classSchema = vine.string().minLength(1).maxLength(50);

// Objects
export const updateUserPasswordSchema = vine.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
});

export const storeStudentSchema = vine.object({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  email: emailSchema,
  class: classSchema
})

// Validators
export const updateUserPasswordValidator = vine.compile(updateUserPasswordSchema);
//
export const storeStudentValidator = vine.compile(storeStudentSchema);

//
export const scanPassValidator = vine.compile(scanPassSchema)


