import bcrypt from "bcryptjs";
import type { ILoginUser, ISignUpUser } from "./interface";
import { pool } from "../../db";
import jwt from "jsonwebtoken";
import config from "../../config";

const signUpUserDataIntoDB = async (payLoad: ISignUpUser) => {
  const { name, password, email, role } = payLoad;
  const hashPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
    INSERT INTO users (name, password, email, role) VALUES ($1, $2, $3, COALESCE($4, 'contributor')) RETURNING id, name, email, role, created_at, updated_at`,
    [name, hashPassword, email, role],
  );
  return result;
};

const logInUser = async (payLoad: ILoginUser) => {
  const { email, password } = payLoad;
  const userData = await pool.query(
    `
    SELECT * FROM users WHERE email=$1`,
    [email],
  );

  if (userData.rows[0] === 0) {
    throw new Error("invalid Credential");
  }
  const user = userData.rows[0];
  const matchPassword = await bcrypt.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid Credential");
  }
  const jwtPayLoad = {
    id: user.id,
    name: user.name,
    role: user.role,
  };
  const token = jwt.sign(jwtPayLoad, config.Jwt_Secret as string, {
    expiresIn: "1d",
  });
  return { token, user };
};

export const authService = {
  signUpUserDataIntoDB,
  logInUser,
};
