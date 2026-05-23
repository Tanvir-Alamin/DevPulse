import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";

const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "   Access",
      });
    }
    const decoded = jwt.verify(
      token as string,
      config.Jwt_Secret as string,
    ) as JwtPayload;

    const userData = await pool.query(
      `
        SELECT * FROM users WHERE id=$1`,
      [decoded.id],
    );
    if (userData.rows.length == 0) {
      return res.status(404).json({
        success: false,
        message: "Unauthorized",
        errors: "User not found",
      });
    }
    const user = userData.rows[0];
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
      errors: error instanceof Error ? error.message : "Invalid token",
    });
  }
};
export default auth;
