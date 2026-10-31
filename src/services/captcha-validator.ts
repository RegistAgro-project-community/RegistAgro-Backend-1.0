export interface CaptchaValidator {
  validate(token: string | undefined, remoteIp?: string): Promise<boolean>;
}
