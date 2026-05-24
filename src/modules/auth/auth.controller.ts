import type { Request, Response } from "express";
import { authService } from "./auth.service";

const signUp = async (req: Request, res: Response) => {
  try {
    const result = await authService.signUpUserDataIntoDB(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result.rows[0],
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal Server Error",
      error,
    });
  }
};
const logIn = async (req: Request, res: Response) => {
  try {
    const result = await authService.logInUser(req.body);
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal Server Error",
      error,
    });
  }
};
export const authController = {
  signUp,
  logIn,
};
