import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Demo user
  const hashedPassword = await bcrypt.hash("Demo1234!", 12);
  const user = await prisma.user.upsert({
    where: { email: "demo@stockpilot.dev" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@stockpilot.dev",
      password: hashedPassword,
    },
  });

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { name: "Electronics" }, update: {}, create: { name: "Electronics" } }),
    prisma.category.upsert({ where: { name: "Clothing" }, update: {}, create: { name: "Clothing" } }),
    prisma.category.upsert({ where: { name: "Food & Beverages" }, update: {}, create: { name: "Food & Beverages" } }),
    prisma.category.upsert({ where: { name: "Office Supplies" }, update: {}, create: { name: "Office Supplies" } }),
    prisma.category.upsert({ where: { name: "Tools & Hardware" }, update: {}, create: { name: "Tools & Hardware" } }),
  ]);

  const [electronics, clothing, food, office, tools] = categories;

  // Products
  const products = [
    { name: "Wireless Bluetooth Headphones", sku: "ELEC-001", price: 79.99, quantity: 45, lowStockThreshold: 10, categoryId: electronics.id },
    { name: "USB-C Charging Cable 2m", sku: "ELEC-002", price: 12.99, quantity: 8, lowStockThreshold: 15, categoryId: electronics.id },
    { name: "Mechanical Keyboard TKL", sku: "ELEC-003", price: 129.99, quantity: 0, lowStockThreshold: 5, categoryId: electronics.id },
    { name: "Laptop Stand Aluminium", sku: "ELEC-004", price: 34.99, quantity: 23, lowStockThreshold: 8, categoryId: electronics.id },
    { name: "Men's Running Shoes", sku: "CLTH-001", price: 89.99, quantity: 3, lowStockThreshold: 10, categoryId: clothing.id },
    { name: "Cotton T-Shirt (Pack of 3)", sku: "CLTH-002", price: 24.99, quantity: 67, lowStockThreshold: 20, categoryId: clothing.id },
    { name: "Winter Jacket", sku: "CLTH-003", price: 149.99, quantity: 12, lowStockThreshold: 10, categoryId: clothing.id },
    { name: "Organic Green Tea (100 bags)", sku: "FOOD-001", price: 18.99, quantity: 5, lowStockThreshold: 10, categoryId: food.id },
    { name: "Protein Powder Vanilla 1kg", sku: "FOOD-002", price: 39.99, quantity: 31, lowStockThreshold: 8, categoryId: food.id },
    { name: "A4 Copy Paper (500 sheets)", sku: "OFFC-001", price: 6.99, quantity: 150, lowStockThreshold: 30, categoryId: office.id },
    { name: "Ballpoint Pens (Pack of 20)", sku: "OFFC-002", price: 4.49, quantity: 2, lowStockThreshold: 10, categoryId: office.id },
    { name: "Hammer 500g Claw", sku: "TOOL-001", price: 22.99, quantity: 18, lowStockThreshold: 5, categoryId: tools.id },
    { name: "Screwdriver Set 10-piece", sku: "TOOL-002", price: 19.99, quantity: 9, lowStockThreshold: 8, categoryId: tools.id },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: { ...product, createdById: user.id },
    });
  }

  // Stock movements
  const createdProducts = await prisma.product.findMany({ take: 5 });
  for (const product of createdProducts) {
    await prisma.stockMovement.create({
      data: {
        productId: product.id,
        type: "IN",
        quantity: 50,
        reason: "Initial stock received from supplier",
        createdById: user.id,
      },
    });
  }

  console.log("✅ Seed complete!");
  console.log("   📧 Demo email: demo@stockpilot.dev");
  console.log("   🔑 Demo password: Demo1234!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
