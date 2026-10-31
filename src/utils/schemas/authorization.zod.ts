import z from "zod";

export const authorizationHeaderSchema = z.strictObject({
  authorization: z.string().regex(/^Bearer\s+\S+$/i),
});

export const captchaHeaderSchema = z.strictObject({
  "x-captcha-token": z.string().min(1).max(2048),
});
