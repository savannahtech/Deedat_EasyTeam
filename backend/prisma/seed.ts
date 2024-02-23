import prisma from "../lib/prisma";
import { faker } from "@faker-js/faker";

async function clearDatabase() {
  await prisma.commission.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.staffMember.deleteMany();
}

// async function main() {
//   clearDatabase();
//   createProducts();
//   createStaffMembers();
// }
// main()
//   .then(async () => {
//     await prisma.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prisma.$disconnect();
//     process.exit(1);
//   });
async function main() {
  await clearDatabase();
  // Create staff members
  const staffMembers = await Promise.all(
    Array.from({ length: 5 }).map(async () => {
      const name = faker.person.fullName();
      return prisma.staffMember.create({ data: { name } });
    })
  );

  // Create orders with associated products and commissions
  await Promise.all(
    Array.from({ length: 1000 }).map(async () => {
      const orderName = faker.commerce.department();
      // const staffMemberId = faker.helpers.arrayElement(staffMembers).id;
      const products = await Promise.all(
        Array.from({ length: faker.number.int({ min: 1, max: 5 }) }).map(
          async () => {
            const name = faker.commerce.productName();
            const price = faker.number.float({
              min: 1,
              max: 100,
              fractionDigits: 2,
            });
            const category = faker.commerce.department();
            const imageUrl = faker.image.avatar();
            return prisma.product.create({
              data: { name, price, category, imageUrl },
            });
          }
        )
      );

      const order = await prisma.order.create({
        data: {
          orderName,
          products: {
            connect: products.map((product) => ({ id: product.id })),
          },
          createdAt: faker.date.past(),
        },
      });

      // await Promise.all(
      //   products.map(async (product) => {
      //     const commissionPercentage = faker.number.float({ min: 1, max: 10 });
      //     await prisma.commission.create({
      //       data: {
      //         percentage: commissionPercentage,
      //         productId: product.id,
      //         orderId: order.id,
      //       },
      //     });
      //   })
      // );
    })
  );

  console.log("Seed data generated successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
