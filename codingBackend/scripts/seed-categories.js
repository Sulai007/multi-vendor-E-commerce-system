const { randomUUID } = require("crypto");
const { Sequelize } = require("sequelize");
const configs = require("../config/config");

const categories = [
  "Electronics",
  "Fashion",
  "Home & Kitchen",
  "Beauty & Personal Care",
  "Health & Wellness",
  "Sports & Outdoors",
  "Books & Stationery",
  "Toys & Games",
  "Food & Groceries",
  "Automotive",
];

const config = configs[process.env.NODE_ENV || "development"];
const sequelize = new Sequelize(config);

async function seedCategories() {
  try {
    await sequelize.authenticate();

    await sequelize.transaction(async (transaction) => {
      for (const category of categories) {
        await sequelize.query(
          'INSERT INTO "categories" ("id", "category", "created_at", "updated_at") VALUES (:id, :category, NOW(), NOW()) ON CONFLICT ("category") DO NOTHING',
          { replacements: { id: randomUUID(), category }, transaction }
        );
      }
    });

    console.log(`Seeded ${categories.length} product categories.`);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  seedCategories().catch((error) => {
    console.error("Failed to seed product categories:", error);
    process.exitCode = 1;
  });
}

module.exports = { categories, seedCategories };
