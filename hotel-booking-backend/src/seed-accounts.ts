import mongoose from "mongoose";
import "dotenv/config";
import User from "./models/user";

const testAccounts = [
  {
    email: "admin@hotel.com",
    password: "admin123",
    firstName: "Admin",
    lastName: "User",
    role: "admin",
  },
  {
    email: "owner@hotel.com",
    password: "owner123",
    firstName: "Hotel",
    lastName: "Owner",
    role: "hotel_owner",
  },
  {
    email: "customer@hotel.com",
    password: "customer123",
    firstName: "Customer",
    lastName: "User",
    role: "user",
  },
];

async function seedTestAccounts() {
  if (!process.env.MONGODB_CONNECTION_STRING) {
    console.error("❌ MONGODB_CONNECTION_STRING not set in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
    console.log("✅ Connected to MongoDB");

    for (const account of testAccounts) {
      const existing = await User.findOne({ email: account.email });
      if (existing) {
        console.log(`⏭️  Skipped ${account.email} (already exists)`);
        continue;
      }

      const user = new User(account);
      await user.save();
      console.log(`✅ Created ${account.role}: ${account.email} / ${account.password}`);
    }

    console.log("\n✅ Test accounts seed complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

seedTestAccounts();
