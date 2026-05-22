import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env"),
});
const config = {
  port: process.env.PORT,
  Connection_String: process.env.CONNECTION_STRING,
  Jwt_Secret: process.env.JWT_SECRET,
};

export default config;
