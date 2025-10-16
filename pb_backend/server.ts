// server.ts
import express, { Request, Response, NextFunction } from "express";
import mysql from "mysql2";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { networkInterfaces } from "os";

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const app = express();
const port = process.env.API_PORT || 8080;

function getPrivateIP(): string | undefined {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === "IPv4" && !net.internal) return net.address;
    }
  }
}

const ip = getPrivateIP() || "localhost";
dotenv.config();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "mark",
  password: process.env.DB_PASSWORD || "newsecurepassword",
  database: process.env.DB_NAME || "pocketledger",
});

db.connect((err) => {
  if (err) throw err;
  console.log("DB ok");
});

const checkFields = (res: any, ...fields: any[]) => {
  if (fields.some((f) => !f))
    return res.status(400).json({ error: "Missing fields" });
};

// Middleware to authenticate JWT tokens
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    req.user = user;
    next();
  });
};

// Register endpoint
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;
  checkFields(res, name, email, password);

  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await db
      .promise()
      .query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [
        name,
        email,
        hash,
      ]);
    res.json({ id: (result as any).insertId, email });
  } catch (err: any) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ error: "Email already registered" });
    res.status(500).json({ error: "Server error" });
  }
});

// Login endpoint
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Missing fields" });

  try {
    const [rows]: any[] = await db
      .promise()
      .query(
        "SELECT id, name, email, password FROM users WHERE email = ? LIMIT 1",
        [email]
      );
    if (rows.length === 0)
      return res.status(401).json({ error: "Invalid credentials" });

    const bcrypt = await import("bcrypt");
    const isValid = await bcrypt.compare(password, rows[0].password);
    if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

    const user = { id: rows[0].id, name: rows[0].name, email: rows[0].email };
    const token = jwt.sign(
      { sub: String(user.id), name: user.name, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get tags
app.get("/api/tags/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await db.promise().query(
      `SELECT *
      FROM tags 
      WHERE (user_id = ? OR user_id IS NULL) 
        AND archived_at IS NULL
      ORDER BY 
        is_default DESC,
        user_id IS NULL DESC,
        name ASC`,
      [userId]
    );

    res.json({ tags: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST create new user tag
app.post("/api/tags", async (req, res) => {
  const { userId, name, slug, color, icon } = req.body;
  checkFields(res, userId, name, slug);

  try {
    const [result] = await db.promise().query(
      `INSERT INTO tags (user_id, name, slug, color, icon) 
       VALUES (?, ?, ?, ?, ?)`,
      [userId, name, slug, color || null, icon || null]
    );

    res.json({
      id: (result as any).insertId,
      userId,
      name,
      slug,
      color,
      icon,
    });
  } catch (err: any) {
    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ error: "Tag slug already exists for this user" });
    }
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE tag
app.put("/api/tags/:tagId", async (req, res) => {
  const { tagId } = req.params;
  const { name, slug, color, icon } = req.body;

  try {
    // Check if tag exists and is user-created
    const [rows]: any[] = await db
      .promise()
      .query(`SELECT user_id FROM tags WHERE id = ? LIMIT 1`, [tagId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Tag not found" });
    }

    if (rows[0].user_id === null) {
      return res.status(403).json({ error: "Cannot edit global tags" });
    }

    // Update the tag
    await db
      .promise()
      .query(
        `UPDATE tags SET name = ?, slug = ?, color = ?, icon = ? WHERE id = ?`,
        [name, slug, color || null, icon || null, tagId]
      );

    // Return updated tag
    const [updated]: any[] = await db
      .promise()
      .query(`SELECT * FROM tags WHERE id = ? LIMIT 1`, [tagId]);

    res.json(updated[0]);
  } catch (err: any) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Tag slug already exists" });
    }
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE tag
app.delete("/api/tags/:tagId", async (req, res) => {
  const { tagId } = req.params;

  try {
    // First check if tag exists and is user-created (not global)
    const [rows]: any[] = await db
      .promise()
      .query(`SELECT user_id FROM tags WHERE id = ? LIMIT 1`, [tagId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Tag not found" });
    }

    if (rows[0].user_id === null) {
      return res.status(403).json({ error: "Cannot delete global tags" });
    }

    // Delete the tag (CASCADE will remove from transaction_tags)
    await db.promise().query(`DELETE FROM tags WHERE id = ?`, [tagId]);

    res.json({ message: "Tag deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create transaction
app.post("/api/transactions", authenticateToken, async (req, res) => {
  const { amount, description, merchant, type, tag_id } = req.body;
  const userId = req.user.sub;
  console.log(amount);
  checkFields(res, amount, description, type);
  if (isNaN(parseFloat(amount))) {
    return res.status(400).json({ error: "Amount must be a valid number" });
  }
  console.log(amount, " second");
  if (!["income", "expense"].includes(type)) {
    return res
      .status(400)
      .json({ error: `Type must be either "income" or "expense"` });
  }

  try {
    console.log(amount, " final");
    // Store amount as decimal (e.g., 2.42, 2.00)
    // Replace comma with dot for proper decimal parsing
    const normalizedAmount = amount.toString().replace(",", ".");
    const amountDecimal = parseFloat(normalizedAmount);
    const direction = type === "income" ? "income" : "expense"; // Map to your ENUM values
    console.log("Normalized amount:", normalizedAmount);
    console.log("Amount as decimal:", amountDecimal);
    const [result] = await db.promise().query(
      `INSERT INTO transactions (user_id, amount_minor, currency, direction, occurred_at, description, merchant, created_at, updated_at)
       VALUES(?, ?, ?, ?, NOW(), ?, ?, NOW(), NOW())`,
      [
        userId,
        amountDecimal,
        "USD", // Default currency - you might want to make this configurable
        direction,
        description,
        merchant || null,
      ]
    );

    // Get the created transaction
    const [transaction] = await db
      .promise()
      .query(`SELECT * FROM transactions WHERE id = ?`, [
        (result as any).insertId,
      ]);

    res.status(201).json({
      message: "Transaction created successfully",
      transaction: {
        ...transaction[0],
        amount: transaction[0].amount_minor, // Already in decimal format
        type: transaction[0].direction,
      },
    });
  } catch (err: any) {
    console.error("Transaction creation error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get user transactions
app.get("/api/transactions", authenticateToken, async (req, res) => {
  const userId = req.user.sub;
  const { page = 1, limit = 50, type, tag_id } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  try {
    let query = `
      SELECT t.*, 
             GROUP_CONCAT(tg.name) as tag_names,
             GROUP_CONCAT(tg.color) as tag_colors,
             GROUP_CONCAT(tg.icon) as tag_icons
      FROM transactions t
      LEFT JOIN transaction_tags tt ON t.id = tt.transaction_id
      LEFT JOIN tags tg ON tt.tag_id = tg.id
      WHERE t.user_id = ?
    `;
    const params = [userId];

    if (type) {
      query += ` AND t.direction = ?`;
      params.push(type);
    }

    if (tag_id) {
      query += ` AND t.id IN (SELECT transaction_id FROM transaction_tags WHERE tag_id = ?)`;
      params.push(tag_id);
    }

    query += ` GROUP BY t.id ORDER BY t.occurred_at DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), offset);

    const [rows] = await db.promise().query(query, params);

    // Get total count for pagination
    let countQuery = `SELECT COUNT(DISTINCT t.id) as total FROM transactions t`;
    const countParams = [userId];

    if (type) {
      countQuery += ` WHERE t.user_id = ? AND t.direction = ?`;
      countParams.push(type);
    } else {
      countQuery += ` WHERE t.user_id = ?`;
    }

    if (tag_id) {
      countQuery += ` AND t.id IN (SELECT transaction_id FROM transaction_tags WHERE tag_id = ?)`;
      countParams.push(tag_id);
    }

    const [countResult] = await db.promise().query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      transactions: rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get transaction analytics
app.get("/api/analytics", authenticateToken, async (req, res) => {
  const userId = req.user.sub;
  const { period = "month" } = req.query; // day, week, month, year

  try {
    let dateFilter = "";
    switch (period) {
      case "day":
        dateFilter = "DATE(occurred_at) = CURDATE()";
        break;
      case "week":
        dateFilter = "occurred_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)";
        break;
      case "month":
        dateFilter =
          "YEAR(occurred_at) = YEAR(NOW()) AND MONTH(occurred_at) = MONTH(NOW())";
        break;
      case "year":
        dateFilter = "YEAR(occurred_at) = YEAR(NOW())";
        break;
      default:
        dateFilter =
          "YEAR(occurred_at) = YEAR(NOW()) AND MONTH(occurred_at) = MONTH(NOW())";
    }

    // Get income and expense totals
    const [totals] = await db.promise().query(
      `
      SELECT 
        direction,
        SUM(amount_minor) as total,
        COUNT(*) as count
      FROM transactions 
      WHERE user_id = ? AND ${dateFilter}
      GROUP BY direction
    `,
      [userId]
    );

    // Get spending by category
    const [categories] = await db.promise().query(
      `
      SELECT 
        tg.name as category_name,
        tg.color as category_color,
        tg.icon as category_icon,
        SUM(t.amount_minor) as total,
        COUNT(*) as count
      FROM transactions t
      JOIN transaction_tags tt ON t.id = tt.transaction_id
      JOIN tags tg ON tt.tag_id = tg.id
      WHERE t.user_id = ? AND t.direction = 'expense' AND ${dateFilter}
      GROUP BY tg.id, tg.name, tg.color, tg.icon
      ORDER BY total DESC
      LIMIT 10
    `,
      [userId]
    );

    // Get recent transactions
    const [recent] = await db.promise().query(
      `
      SELECT t.*, 
             GROUP_CONCAT(tg.name) as tag_names,
             GROUP_CONCAT(tg.color) as tag_colors,
             GROUP_CONCAT(tg.icon) as tag_icons
      FROM transactions t
      LEFT JOIN transaction_tags tt ON t.id = tt.transaction_id
      LEFT JOIN tags tg ON tt.tag_id = tg.id
      WHERE t.user_id = ?
      GROUP BY t.id
      ORDER BY t.occurred_at DESC
      LIMIT 5
    `,
      [userId]
    );

    const income =
      (totals as any[]).find((t) => t.direction === "income")?.total || 0;
    const expense =
      (totals as any[]).find((t) => t.direction === "expense")?.total || 0;
    const net = income - expense;

    res.json({
      totals: {
        income: parseFloat(income),
        expense: parseFloat(expense),
        net: parseFloat(net.toString()),
      },
      categories: (categories as any[]).map((cat) => ({
        ...cat,
        total: parseFloat(cat.total),
      })),
      recent: recent,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update transaction
app.put("/api/transactions/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { amount, description, merchant, type, tag_id } = req.body;
  const userId = req.user.sub;

  try {
    // Verify transaction belongs to user
    const [existing] = await db
      .promise()
      .query("SELECT id FROM transactions WHERE id = ? AND user_id = ?", [
        id,
        userId,
      ]);

    if ((existing as any[]).length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    const normalizedAmount = amount.toString().replace(",", ".");
    const amountDecimal = parseFloat(normalizedAmount);
    const direction = type === "income" ? "income" : "expense";

    await db.promise().query(
      `UPDATE transactions 
       SET amount_minor = ?, direction = ?, description = ?, merchant = ?, updated_at = NOW()
       WHERE id = ? AND user_id = ?`,
      [amountDecimal, direction, description, merchant || null, id, userId]
    );

    // Update tags if provided
    if (tag_id) {
      await db
        .promise()
        .query("DELETE FROM transaction_tags WHERE transaction_id = ?", [id]);
      await db
        .promise()
        .query(
          "INSERT INTO transaction_tags (transaction_id, tag_id) VALUES (?, ?)",
          [id, tag_id]
        );
    }

    res.json({ message: "Transaction updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete transaction
app.delete("/api/transactions/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.sub;

  try {
    const [result] = await db
      .promise()
      .query("DELETE FROM transactions WHERE id = ? AND user_id = ?", [
        id,
        userId,
      ]);

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json({ message: "Transaction deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Budget endpoints
app.get("/api/budgets", authenticateToken, async (req, res) => {
  const userId = req.user.sub;
  const { userId: queryUserId } = req.query;

  try {
    const [budgets] = await db.promise().query(
      `
      SELECT b.*, 
             GROUP_CONCAT(
               CONCAT(
                 bc.id, ':', bc.tag_id, ':', bc.amount, ':', bc.spent, ':', 
                 COALESCE(t.name, ''), ':', COALESCE(t.color, ''), ':', COALESCE(t.icon, '')
               ) SEPARATOR '|'
             ) as categories_data
      FROM budgets b
      LEFT JOIN budget_categories bc ON b.id = bc.budget_id
      LEFT JOIN tags t ON bc.tag_id = t.id
      WHERE b.user_id = ? AND b.is_active = 1
      GROUP BY b.id
      ORDER BY b.created_at DESC
    `,
      [userId]
    );

    const formattedBudgets = (budgets as any[]).map((budget: any) => {
      const categories = budget.categories_data
        ? budget.categories_data.split("|").map((cat: string) => {
            const [id, tag_id, amount, spent, name, color, icon] =
              cat.split(":");
            return {
              id: parseInt(id),
              tag_id: parseInt(tag_id),
              amount: parseFloat(amount),
              spent: parseFloat(spent),
              tag_name: name,
              tag_color: color,
              tag_icon: icon,
            };
          })
        : [];

      return {
        ...budget,
        amount: parseFloat(budget.amount),
        spent: parseFloat(budget.spent),
        categories,
      };
    });

    res.json({ budgets: formattedBudgets });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/budgets", authenticateToken, async (req, res) => {
  const { userId, name, amount, period, startDate, endDate } = req.body;
  checkFields(res, userId, name, amount, period, startDate, endDate);

  try {
    const [result] = await db.promise().query(
      `INSERT INTO budgets (user_id, name, amount, period, start_date, end_date) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, name, amount, period, startDate, endDate]
    );

    res.json({
      id: (result as any).insertId,
      userId,
      name,
      amount: parseFloat(amount),
      period,
      startDate,
      endDate,
      spent: 0,
      is_active: true,
      categories: [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Profile endpoints
app.put("/api/profile", authenticateToken, async (req, res) => {
  const { name, email } = req.body;
  const userId = req.user.sub;

  try {
    await db
      .promise()
      .query(
        `UPDATE users SET name = ?, email = ?, updated_at = NOW() WHERE id = ?`,
        [name, email, userId]
      );

    res.json({ message: "Profile updated successfully" });
  } catch (err: any) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Email already exists" });
    }
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/change-password", authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.sub;

  try {
    // Verify current password
    const [rows]: any[] = await db
      .promise()
      .query("SELECT password FROM users WHERE id = ?", [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const bcrypt = await import("bcrypt");
    const isValid = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isValid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Hash new password
    const hash = await bcrypt.hash(newPassword, 10);

    // Update password
    await db
      .promise()
      .query("UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?", [
        hash,
        userId,
      ]);

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(port, () => console.log(`Listening on ${ip}:${port}`));
