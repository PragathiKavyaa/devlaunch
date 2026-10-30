
import { Router } from "express";
import { pool } from "./db.js";
import { requireAdmin } from "./auth.js";

const router = Router();

const defaultContent = {
  services: [
    {
      title: "Web development",
      description: "Fast, accessible websites that turn visitors into customers.",
    },
    {
      title: "Product design",
      description: "Clear user journeys and polished interfaces built around people.",
    },
    {
      title: "E-commerce",
      description: "Shopping experiences designed to make every step feel simple.",
    },
    {
      title: "Business tools",
      description: "Dashboards and workflows that help teams make smarter decisions.",
    },
  ],
  packages: [
    {
      name: "Starter",
      price: "₹4,999",
      description: "A professional starting point for your online presence.",
      features: [
        "Up to 3 pages",
        "Responsive design",
        "Contact enquiry form",
        "Basic SEO",
        "Deployment assistance",
      ],
      popular: false,
    },
    {
      name: "Business",
      price: "₹9,999",
      description: "More features for a growing business.",
      features: [
        "Up to 6 pages",
        "UI animations",
        "Database enquiries",
        "Admin management",
        "Deployment",
      ],
      popular: true,
    },
    {
      name: "Full Stack",
      price: "₹19,999+",
      description: "A full-stack solution tailored to your business.",
      features: [
        "React",
        "Node.js and Express",
        "MySQL database",
        "Authentication",
        "Admin dashboard",
        "Deployment support",
      ],
      popular: false,
    },
  ],
  hero: {},
  about: {},
  process: [],
  contact: {},
};

const editableKeys = new Set(Object.keys(defaultContent));

export async function initializeManagementTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_content (
      content_key VARCHAR(60) NOT NULL PRIMARY KEY,
      content_json JSON NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS customer_feedback (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      customer_name VARCHAR(100) NOT NULL,
      rating TINYINT UNSIGNED NOT NULL,
      review TEXT NOT NULL,
      status ENUM('Pending', 'Approved', 'Hidden') NOT NULL DEFAULT 'Pending',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_feedback_status_created (status, created_at)
    )
  `);

  // Insert defaults only when a content key does not already exist.
  // Existing administrator edits are never overwritten.
  for (const [key, value] of Object.entries(defaultContent)) {
    await pool.query(
      `INSERT IGNORE INTO site_content (content_key, content_json)
       VALUES (?, ?)`,
      [key, JSON.stringify(value)]
    );
  }
}

// Public: get the website's editable content.
router.get("/content", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT content_key, content_json FROM site_content"
    );

    const content = {};
    for (const row of rows) {
      content[row.content_key] =
        typeof row.content_json === "string"
          ? JSON.parse(row.content_json)
          : row.content_json;
    }

    res.json(content);
  } catch (error) {
    console.error("Load site content failed:", error.message);
    res.status(500).json({ message: "Could not load website content." });
  }
});

// Admin: save a complete content section.
router.put("/admin/content/:key", requireAdmin, async (req, res) => {
  const { key } = req.params;
  const value = req.body?.content;

  if (!editableKeys.has(key)) {
    return res.status(400).json({ message: "Unknown content section." });
  }

  if (
    value === undefined ||
    value === null ||
    typeof value !== "object"
  ) {
    return res.status(400).json({
      message: "Content must be a JSON object or array.",
    });
  }

  let serialized;
  try {
    serialized = JSON.stringify(value);
    if (!serialized || serialized.length > 50000) {
      return res.status(400).json({
        message: "Content is empty or exceeds the 50 KB limit.",
      });
    }
  } catch {
    return res.status(400).json({ message: "Invalid content format." });
  }

  try {
    await pool.query(
      `INSERT INTO site_content (content_key, content_json)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE content_json = VALUES(content_json)`,
      [key, serialized]
    );

    res.json({ message: "Website content saved.", key });
  } catch (error) {
    console.error("Save site content failed:", error.message);
    res.status(500).json({ message: "Could not save website content." });
  }
});

// Public: show approved customer feedback only.
router.get("/feedback", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, customer_name, rating, review, created_at
       FROM customer_feedback
       WHERE status = 'Approved'
       ORDER BY created_at DESC
       LIMIT 50`
    );

    res.json(rows);
  } catch (error) {
    console.error("Load feedback failed:", error.message);
    res.status(500).json({ message: "Could not load customer feedback." });
  }
});

// Public: submit feedback for admin review.
router.post("/feedback", async (req, res) => {
  const { name, rating, review } = req.body || {};
  const customerName = typeof name === "string" ? name.trim() : "";
  const feedbackText = typeof review === "string" ? review.trim() : "";
  const score = Number(rating);

  if (!customerName || customerName.length > 100) {
    return res.status(400).json({
      message: "Enter your name (up to 100 characters).",
    });
  }

  if (!Number.isInteger(score) || score < 1 || score > 5) {
    return res.status(400).json({
      message: "Choose a rating from 1 to 5.",
    });
  }

  if (!feedbackText || feedbackText.length > 2000) {
    return res.status(400).json({
      message: "Enter a review (up to 2,000 characters).",
    });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO customer_feedback (customer_name, rating, review)
       VALUES (?, ?, ?)`,
      [customerName, score, feedbackText]
    );

    res.status(201).json({
      message: "Thank you! Your feedback has been submitted for review.",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Submit feedback failed:", error.message);
    res.status(500).json({ message: "Could not submit feedback." });
  }
});

// Admin: list all feedback, including pending and hidden reviews.
router.get("/admin/feedback", requireAdmin, async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, customer_name, rating, review, status, created_at
       FROM customer_feedback
       ORDER BY created_at DESC`
    );

    res.json(rows);
  } catch (error) {
    console.error("Admin feedback list failed:", error.message);
    res.status(500).json({ message: "Could not load feedback." });
  }
});

// Admin: approve or hide a review.
router.patch("/admin/feedback/:id/status", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body || {};

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Invalid feedback ID." });
  }

  if (!["Pending", "Approved", "Hidden"].includes(status)) {
    return res.status(400).json({ message: "Choose a valid feedback status." });
  }

  try {
    const [result] = await pool.query(
      "UPDATE customer_feedback SET status = ? WHERE id = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Feedback not found." });
    }

    res.json({ message: "Feedback status updated." });
  } catch (error) {
    console.error("Update feedback status failed:", error.message);
    res.status(500).json({ message: "Could not update feedback status." });
  }
});

// Admin: delete feedback.
router.delete("/admin/feedback/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Invalid feedback ID." });
  }

  try {
    const [result] = await pool.query(
      "DELETE FROM customer_feedback WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Feedback not found." });
    }

    res.json({ message: "Feedback deleted." });
  } catch (error) {
    console.error("Delete feedback failed:", error.message);
    res.status(500).json({ message: "Could not delete feedback." });
  }
});

// Admin: dashboard counts.
router.get("/admin/summary", requireAdmin, async (_req, res) => {
  try {
    const [[enquiries]] = await pool.query(
      "SELECT COUNT(*) AS total FROM enquiries"
    );
    const [[feedback]] = await pool.query(
      `SELECT
         COUNT(*) AS total,
         COALESCE(SUM(status = 'Pending'), 0) AS pending,
         COALESCE(SUM(status = 'Approved'), 0) AS approved
       FROM customer_feedback`
    );

    res.json({
      enquiries: Number(enquiries.total),
      feedback: Number(feedback.total),
      pendingFeedback: Number(feedback.pending),
      approvedFeedback: Number(feedback.approved),
    });
  } catch (error) {
    console.error("Load admin summary failed:", error.message);
    res.status(500).json({ message: "Could not load dashboard summary." });
  }
});

export default router;
