import { z } from "zod";

const SignupSchema = z.object({
  name: z.string().min(3, { message: "Name Must have 3 characters" }),
  email: z.string().email({ message: "Enter a valid email" }),
  password: z.string().min(8, { message: "Password must have 8 characters" }),
});

type TypeSignup = z.infer<typeof SignupSchema>;

const SigninSchema = z.object({
  email: z.string().email({
    message: "Enter a valid email",
  }),
  password: z.string().min(8),
});

type TypeSignin = z.infer<typeof SigninSchema>;

const CreateZapSchema = z.object({
  availableTriggerId: z.string(),
  triggerMetaData: z.any().optional(),
  actions: z
    .object({
      availableActionId: z.string(),
      actionMetaData: z.any().optional(),
    })
    .array(),
});

type TypeCreateZapSchema = z.infer<typeof CreateZapSchema>;

const SelectedTriggerSchema = z.object({
  availableTriggerId: z.string(),
  triggerType: z.string(),
  triggerMetaData: z.any().optional(),
});

type TypeSelectedTrigger = z.infer<typeof SelectedTriggerSchema>;

const SelectedActionSchema = z.object({
  availableActionId: z.string(),
  actionType: z.string(),
  actionMetaData: z.any().optional(),
});

type TypeSelectedAction = z.infer<typeof SelectedActionSchema>;

export { SignupSchema, SigninSchema, CreateZapSchema };

export type {
  TypeSignup,
  TypeSignin,
  TypeCreateZapSchema,
  TypeSelectedTrigger,
  TypeSelectedAction,
};
