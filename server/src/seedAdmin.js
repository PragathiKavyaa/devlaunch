
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { pool } from "./db.js";

dotenv.config();

const email = "admin@devlaunch.local";
const password = process.env.DEMO_ADMIN_PASSWORD;

try {
  if (!password) {
    throw new Error(
      "Please set DEMO_ADMIN_PASSWORD in your server/.env file."
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await pool.query(
    `INSERT INTO admins (email, password_hash)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE
     password_hash = VALUES(password_hash)`,
    [email, passwordHash]
  );

  console.log(`Admin account ready: ${email}`);
  console.log("The password is the one configured in server/.env.");
} catch (error) {
  console.error("Could not seed admin:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
