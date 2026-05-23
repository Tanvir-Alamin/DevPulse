import type { Request, Response } from "express";
import cors from "cors";

import express from "express";
import { authRouter } from "./modules/auth/auth.route";
import { issueRoute } from "./modules/issues/issue.route";
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
  }),
);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});
app.use("/api/auth", authRouter);
app.use("/api/issues", issueRoute);

export default app;
