import type { Request, Response } from "express";

import express from "express";
import { authRouter } from "./modules/auth/auth.route";
const app = express();
app.use(express.json())

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});
app.use("/api/auth", authRouter);

export default app;
