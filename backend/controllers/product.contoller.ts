import { getProductsService } from "../services/product.service";
import { Request, Response } from "express";

export const productsController = {
  getProducts: async (request: Request, response: Response) => {
    try {
      const products = await getProductsService();
      response.status(200).json({
        status: 200,
        success: true,
        products,
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
