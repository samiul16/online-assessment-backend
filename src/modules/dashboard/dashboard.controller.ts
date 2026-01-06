import { Request, Response } from "express";
import * as dashboardService from "./dashboard.service";

export const getDashboardOverview = async (req: Request, res: Response) => {
  try {
    // Assuming your auth middleware populates req.user
    const userId = (req as any).user.id;

    const data = await dashboardService.getStudentDashboardData(userId);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch dashboard data",
    });
  }
};
