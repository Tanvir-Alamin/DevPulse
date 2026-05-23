

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/app.ts
import cors from "cors";
import express from "express";

// src/modules/auth/auth.route.ts
import { Router } from "express";

// src/modules/auth/auth.service.ts
import bcrypt from "bcryptjs";

// src/db/index.ts
import { Pool } from "pg";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  port: process.env.PORT,
  Connection_String: process.env.CONNECTION_STRING,
  Jwt_Secret: process.env.JWT_SECRET
};
var config_default = config;

// src/db/index.ts
var pool = new Pool({ connectionString: config_default.Connection_String });
var initDB = async () => {
  try {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(50),
        email VARCHAR(50) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(20) DEFAULT 'contributor' CHECK(role IN ('contributor', 'maintainer')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW())`);
    console.log("User Table Connected");
    await pool.query(`
        CREATE TABLE IF NOT EXISTS issues(
        id SERIAL PRIMARY KEY,
        title VARCHAR(150),
        description TEXT UNIQUE NOT NULL CHECK(LENGTH(description)>=20),
        type VARCHAR(20) NOT NULL CHECK(type IN ('bug', 'feature_request')),
        status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'resolved')),
        reporter_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW())`);
    console.log("Issue Table Connected");
  } catch (error) {
    console.log("ERROR", error);
  }
};

// src/modules/auth/auth.service.ts
import jwt from "jsonwebtoken";
var signUpUserDataIntoDB = async (payLoad) => {
  const { name, password, email, role } = payLoad;
  const hashPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
    INSERT INTO users (name, password, email, role) VALUES ($1, $2, $3, COALESCE($4, 'contributor')) RETURNING id, name, email, role, created_at, updated_at`,
    [name, hashPassword, email, role]
  );
  return result;
};
var logInUser = async (payLoad) => {
  const { email, password } = payLoad;
  const userData = await pool.query(
    `
    SELECT * FROM users WHERE email=$1`,
    [email]
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
    role: user.role
  };
  const token = jwt.sign(jwtPayLoad, config_default.Jwt_Secret, {
    expiresIn: "1d"
  });
  return { token, user };
};
var authService = {
  signUpUserDataIntoDB,
  logInUser
};

// src/modules/auth/auth.controller.ts
var signUp = async (req, res) => {
  try {
    const result = await authService.signUpUserDataIntoDB(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal Server Error",
      error
    });
  }
};
var logIn = async (req, res) => {
  try {
    const result = await authService.logInUser(req.body);
    res.status(201).json({
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal Server Error",
      error
    });
  }
};
var authController = {
  signUp,
  logIn
};

// src/modules/auth/auth.route.ts
var router = Router();
router.post("/signup", authController.signUp);
router.post("/login", authController.logIn);
var authRouter = router;

// src/modules/issues/issue.route.ts
import { Router as Router2 } from "express";

// src/modules/issues/issue.service.ts
var createIssue = async (payLoad, userId) => {
  const { title, description, type } = payLoad;
  const result = await pool.query(
    `
    INSERT INTO issues (title, description, type, reporter_id) VALUES ($1, $2, $3, $4) RETURNING *`,
    [title, description, type, userId]
  );
  return result.rows[0];
};
var getAllIssue = async (sort) => {
  let orderBy = "DESC";
  if (sort === "oldest") {
    orderBy = "ASC";
  }
  const issues = await pool.query(`
        SELECT * FROM issues ORDER BY created_at ${orderBy}
        `);
  const reporterId = issues.rows.map((i) => i.reporter_id);
  const users = await pool.query(
    `
    SELECT id, name, role FROM users WHERE id=ANY($1)`,
    [reporterId]
  );
  const userMap = /* @__PURE__ */ new Map();
  users.rows.forEach((user) => {
    userMap.set(user.id, user);
  });
  const result = issues.rows.map((issue) => {
    return {
      ...issue,
      reporter: userMap.get(issue.reporter_id)
    };
  });
  return result;
};
var getSingleIssue = async (id) => {
  const issue = await pool.query(
    `
    SELECT * FROM issues WHERE id = $1`,
    [id]
  );
  if (issue.rows.length === 0) {
    throw new Error("Issue not found");
  }
  const reporterId = issue.rows[0].reporter_id;
  const user = await pool.query(
    `
    SELECT id, name, role FROM users WHERE id= $1`,
    [reporterId]
  );
  const issueObj = issue.rows[0];
  const result = { ...issueObj, reporter: user.rows[0] };
  return result;
};
var updateIssue = async (payLoad, id) => {
  const { title, description, type } = payLoad;
  const result = await pool.query(
    `
    UPDATE issues 
    SET title = $1,
    description = $2,
    type = $3,
    updated_at = NOW()
   WHERE id=$4 RETURNING *`,
    [title, description, type, id]
  );
  if (result.rows.length === 0) {
    throw new Error("Issue not found");
  }
  return result.rows[0];
};
var deleteIssue = async (id) => {
  const result = await pool.query(
    `
    DELETE FROM issues WHERE id=$1`,
    [id]
  );
  return result;
};
var issueService = {
  createIssue,
  getAllIssue,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/modules/issues/issue.controller.ts
var postIssue = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await issueService.createIssue(req.body, userId);
    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal Server Error",
      error
    });
  }
};
var getAllIssue2 = async (req, res) => {
  try {
    const sort = req.query.sort || "newest";
    const result = await issueService.getAllIssue(sort);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal Server Error",
      error
    });
  }
};
var getSingleIssue2 = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await issueService.getSingleIssue(id);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal Server Error",
      error
    });
  }
};
var issueUpdate = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await issueService.updateIssue(req.body, id);
    res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal Server Error",
      error
    });
  }
};
var deleteIssue2 = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = issueService.deleteIssue(id);
    res.status(200).json({
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal Server Error",
      error
    });
  }
};
var issueController = {
  postIssue,
  getAllIssue: getAllIssue2,
  getSingleIssue: getSingleIssue2,
  issueUpdate,
  deleteIssue: deleteIssue2
};

// src/middleware/auth.ts
import jwt2 from "jsonwebtoken";
var auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "   Access"
      });
    }
    const decoded = jwt2.verify(
      token,
      config_default.Jwt_Secret
    );
    const userData = await pool.query(
      `
        SELECT * FROM users WHERE id=$1`,
      [decoded.id]
    );
    if (userData.rows.length == 0) {
      return res.status(404).json({
        success: false,
        message: "Unauthorized",
        errors: "User not found"
      });
    }
    const user = userData.rows[0];
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
      errors: error instanceof Error ? error.message : "Invalid token"
    });
  }
};
var auth_default = auth;

// src/middleware/bothRole.ts
var bothRole = (...roles) => {
  return (req, res, next) => {
    try {
      const userRole = req.user.role;
      if (roles.length && !roles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You don't have permission"
        });
      }
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Role check failed"
      });
    }
  };
};
var bothRole_default = bothRole;

// src/types/role.ts
var user_role = {
  contributor: "contributor",
  maintainer: "maintainer"
};

// src/modules/issues/issue.route.ts
var router2 = Router2();
router2.post(
  "/",
  auth_default,
  bothRole_default(user_role.contributor, user_role.maintainer),
  issueController.postIssue
);
router2.get("/", issueController.getAllIssue);
router2.get("/:id", issueController.getSingleIssue);
router2.patch(
  "/:id",
  auth_default,
  bothRole_default(user_role.contributor, user_role.maintainer),
  issueController.issueUpdate
);
router2.delete(
  "/:id",
  auth_default,
  bothRole_default(user_role.maintainer),
  issueController.deleteIssue
);
var issueRoute = router2;

// src/app.ts
var app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*"
  })
);
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use("/api/auth", authRouter);
app.use("/api/issues", issueRoute);
var app_default = app;

// src/server.ts
var main = async () => {
  await initDB();
  app_default.listen(config_default.port, () => {
    console.log(`Example app listening on port ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map