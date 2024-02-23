import { Request, Response } from "express";
import { getStaffMembersService } from "../services/staff.service";

export const staffMembersController = {
  getStaffMembers: async (request: Request, response: Response) => {
    try {
      const staff = await getStaffMembersService();
      response.status(200).json({
        status: 200,
        success: true,
        staff,
      });
    } catch (error: any) {
      response.status(500).json({
        status: 500,
        success: false,
        message: error.message,
      });
    }
  },
};
