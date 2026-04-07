import { z } from "zod";

//authentication schema validation
const SignUpSchema = z.object({
  name: z.string().min(3, { message: "Name Must have 3 characters" }),
  email: z.string().email({ message: "Enter a valid email" }),
  password: z.string().min(8, { message: "Password must have 8 characters" }),
});

type TypeSignUp = z.infer<typeof SignUpSchema>;


