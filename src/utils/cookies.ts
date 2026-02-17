import { Response } from "express";

export const cookies = {
  getOptions: () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 1000 * 60 * 15, // 15 minutes
  }),

  set(res: Response, name: string, value: string, options: object = {}) {
    res.cookie(name, value, { ...this.getOptions(), ...options });
  },

  clear(res: Response, name: string) {
    res.clearCookie(name, { ...this.getOptions(), maxAge: 0 });
  },

  get(req: any, name: string) {
    return req.cookies[name];
  },
};
