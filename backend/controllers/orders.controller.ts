import { Request, Response } from "express";
import {
  getOrdersService,
  saveCommissionPlanService,
} from "../services/order.service";

export const ordersController = {
  getOrders: async (request: Request, response: Response) => {
    try {
      const { start, end } = request.body;
      const orders = await getOrdersService({ start, end });
      response.status(200).json({
        status: 200,
        success: true,
        orders,
      });
    } catch (error: any) {
      response.status(500).json({
        status: 500,
        success: false,
        message: error.message,
      });
    }
  },
  saveCommissionPlan: async (request: Request, response: Response) => {
    try {
      const { commissions, staffMemberId } = request.body;
      const newCommissions = await saveCommissionPlanService({
        commissions,
        staffMemberId,
      });
      response.status(200).json({
        status: 200,
        success: true,
        newCommissions,
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
