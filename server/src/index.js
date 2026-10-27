
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "./db.js";
import { requireAdmin } from "./auth.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  })
);

app.use(express.json({ limit: "20kb" }));

// Check API and MySQL connectivity.
app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    console.error("Health check failed:", error.message);
    res.status(500).json({
      status: "error",
      database: "unavailable",
    });
  }
});

// Submit a contact enquiry.
app.post("/api/enquiries", async (req, res) => {
  const { name, email, service, message } = req.body || {};

  if (
    ![name, email, service, message].every(
      (value) => typeof value === "string" && value.trim()
    )
  ) {
    return res.status(400).json({
      message: "Please complete every field.",
    });
  }

  if (
    name.trim().length > 100 ||
    email.trim().length > 190 ||
    service.trim().length > 100 ||
    message.trim().length > 3000
  ) {
    return res.status(400).json({
      message: "One or more fields are too long.",
    });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email.trim())) {
    return res.status(400).json({
      message: "Enter a valid email address.",
    });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO enquiries (name, email, service, message)
       VALUES (?, ?, ?, ?)`,
      [name.trim(), email.trim().toLowerCase(), service.trim(), message.trim()]
    );

    res.status(201).json({
      message: "Thanks! Your enquiry has been sent.",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Create enquiry failed:", error.message);
    res.status(500).json({
      message: "Could not save your enquiry. Please try again later.",
    });
  }
});

// Admin login.
app.post("/api/admin/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    !password
  ) {
    return res.status(400).json({
      message: "Email and password are required.",
    });
  }

  try {
    const [rows] = await pool.query(
      `SELECT id, email, password_hash
       FROM admins
       WHERE email = ?
       LIMIT 1`,
      [email.trim().toLowerCase()]
    );

    const admin = rows[0];

    const valid = admin
      ? await bcrypt.compare(password, admin.password_hash)
      : false;

    if (!valid) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured.");
      return res.status(500).json({
        message: "Server authentication is not configured.",
      });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ token, email: admin.email });
  } catch (error) {
    console.error("Admin login failed:", error.message);
    res.status(500).json({
      message: "Unable to sign in right now.",
    });
  }
});

// List all enquiries (admin only).
app.get("/api/admin/enquiries", requireAdmin, async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, email, service, message, status, created_at
       FROM enquiries
       ORDER BY created_at DESC`
    );

    res.json(rows);
  } catch (error) {
    console.error("List enquiries failed:", error.message);
    res.status(500).json({
      message: "Could not load enquiries.",
    });
  }
});

// Update an enquiry's status (admin only).
app.patch("/api/admin/enquiries/:id/status", requireAdmin, async (req, res) => {
  const { status } = req.body || {};
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Invalid enquiry ID." });
  }

  if (!["New", "Contacted", "Closed"].includes(status)) {
    return res.status(400).json({
      message: "Choose a valid status.",
    });
  }

  try {
    const [result] = await pool.query(
      `UPDATE enquiries
       SET status = ?
       WHERE id = ?`,
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Enquiry not found or status unchanged.",
      });
    }

    res.json({ message: "Status updated." });
  } catch (error) {
    console.error("Update status failed:", error.message);
    res.status(500).json({
      message: "Could not update status.",
    });
  }
});

// Delete an enquiry (admin only).
app.delete("/api/admin/enquiries/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Invalid enquiry ID." });
  }

  try {
    const [result] = await pool.query(
      "DELETE FROM enquiries WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Enquiry not found.",
      });
    }

    res.json({ message: "Enquiry deleted." });
  } catch (error) {
    console.error("Delete enquiry failed:", error.message);
    res.status(500).json({
      message: "Could not delete enquiry.",
    });
  }
});

app.listen(port, () => {
  console.log(`DevLaunch API listening on port ${port}`);
});
