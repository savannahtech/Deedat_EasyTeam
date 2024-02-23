import { Product } from "@prisma/client";
import prisma from "../lib/prisma";
const getProductsService = async (): Promise<Product[]> => {
  try {
    const products = await prisma.product.findMany();
    return products;
  } catch (error) {
    throw error;
  }
};

export { getProductsService };
