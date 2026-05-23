import { pool } from "../../db";
import type { Issue_Type } from "./interface";

const createIssue = async (payLoad: Issue_Type, userId: Number) => {
  const { title, description, type } = payLoad;

  const result = await pool.query(
    `
    INSERT INTO issues (title, description, type, reporter_id) VALUES ($1, $2, $3, $4) RETURNING *`,
    [title, description, type, userId],
  );
  return result.rows[0];
};
const getAllIssue = async (sort?: string) => {
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
    [reporterId],
  );
  const userMap = new Map();
  users.rows.forEach((user) => {
    userMap.set(user.id, user);
  });
  const result = issues.rows.map((issue) => {
    return {
      ...issue,
      reporter: userMap.get(issue.reporter_id),
    };
  });
  return result;
};
const getSingleIssue = async (id: Number) => {
  const issue = await pool.query(
    `
    SELECT * FROM issues WHERE id = $1`,
    [id],
  );
  if (issue.rows.length === 0) {
    throw new Error("Issue not found");
  }
  const reporterId = issue.rows[0].reporter_id;
  const user = await pool.query(
    `
    SELECT id, name, role FROM users WHERE id= $1`,
    [reporterId],
  );
  const issueObj = issue.rows[0];
  const result = { ...issueObj, reporter: user.rows[0] };

  return result;
};
const updateIssue = async (payLoad: Issue_Type, id: Number) => {
  const { title, description, type } = payLoad;

  const result = await pool.query(
    `
    UPDATE issues 
    SET title = $1,
    description = $2,
    type = $3,
    updated_at = NOW()
   WHERE id=$4 RETURNING *`,
    [title, description, type, id],
  );
  if (result.rows.length === 0) {
    throw new Error("Issue not found");
  }
  return result.rows[0];
};
const deleteIssue = async (id: Number) => {
  const result = await pool.query(
    `
    DELETE FROM issues WHERE id=$1`,
    [id],
  );

  return result;
};

export const issueService = {
  createIssue,
  getAllIssue,
  getSingleIssue,
  updateIssue,
  deleteIssue,
};
