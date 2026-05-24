import type { Request, Response } from "express";
import { issueService } from "./issue.service";

const postIssue = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const result = await issueService.createIssue(req.body, userId);
    res.status(201).json({
      success: true,
      message: "Issue created successfully",
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
const getAllIssue = async (req: Request, res: Response) => {
  try {
    const sort = (req.query.sort as string) || "newest";
    const result = await issueService.getAllIssue(sort);
    res.status(200).json({
      success: true,
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
const getSingleIssue = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = await issueService.getSingleIssue(id);
    res.status(200).json({
      success: true,
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
const issueUpdate = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const result = await issueService.updateIssue(req.body, id);

    res.status(200).json({
      success: true,
      message: "Issue updated successfully",
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
const deleteIssue = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = await issueService.deleteIssue(id);
    res.status(200).json({
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal Server Error",
      error,
    });
  }
};

export const issueController = {
  postIssue,
  getAllIssue,
  getSingleIssue,
  issueUpdate,
  deleteIssue,
};
