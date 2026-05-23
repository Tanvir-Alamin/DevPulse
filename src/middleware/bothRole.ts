import type { Role_type } from "../types/role";
import type { NextFunction, Request, Response } from "express";

const bothRole = (...roles: Role_type[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const userRole = (req as any).user.role;
      if (roles.length && !roles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You don't have permission",
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Role check failed",
      });
    }
  };
};
