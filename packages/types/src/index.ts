import { z } from "zod";

//authentication schema validation
const SignUpSchema = z.object({
  name: z.string().min(3, { message: "Name Must have 3 characters" }),
  email: z.string().email({ message: "Enter a valid email" }),
  password: z.string().min(8, { message: "Password must have 8 characters" }),
});

type TypeSignUp = z.infer<typeof SignUpSchema>;

const SignInSchema = z.object({
  email: z.string().email({
    message: "Enter a valid email",
  }),
  password: z.string().min(8),
});

type TypeSignIn = z.infer<typeof SignInSchema>;

// zap schema

const CreateZapSchema = z.object({
  availableTriggerId: z.string(),
  triggerType: z.string(),
  triggerMetaData: z.any().optional(),
});

type TypeCreateZapSchema = z.infer<typeof CreateZapSchema>;


