declare namespace Express {
  export interface Request {
    user?: {
      id: string
      rule: string
    };
  }
}
