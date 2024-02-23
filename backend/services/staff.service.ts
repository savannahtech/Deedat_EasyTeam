import { StaffMember } from "@prisma/client";
import prisma from "../lib/prisma";
const getStaffMembersService = async (): Promise<StaffMember[]> => {
  try {
    const staff = await prisma.staffMember.findMany();
    return staff;
  } catch (error) {
    throw error;
  }
};

export { getStaffMembersService };
