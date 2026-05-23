import { Router } from "express";
import { issueController } from "./issue.controller";
import auth from "../../middleware/auth";
import bothRole from "../../middleware/bothRole";
import { user_role } from "../../types/role";

const router = Router();
router.post(
  "/",
  auth,
  bothRole(user_role.contributor, user_role.maintainer),
  issueController.postIssue,
);
router.get("/", issueController.getAllIssue);
router.get("/:id", issueController.getSingleIssue);
router.patch(
  "/:id",
  auth,
  bothRole(user_role.contributor, user_role.maintainer),
  issueController.issueUpdate,
);
router.delete("/:id", issueRoute)

export const issueRoute = router;
