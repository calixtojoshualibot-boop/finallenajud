import express from "express";
import mysql from "mysql2/promise";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: "50mb" }));

const nowId = () => `${Date.now()}${Math.floor(Math.random() * 1000)}`;
const usingMySQL = Boolean(process.env.MYSQL_HOST && process.env.MYSQL_USER && process.env.MYSQL_DATABASE);
const jsonDbPath = process.env.JSON_DB_PATH || path.join(__dirname, "database.json");

const defaultData = {
  users: [
    {
      id: "admin1",
      name: "Admin",
      email: "admin@caps.ph",
      password: "admin123",
      role: "admin",
      phone: "",
      address: "",
    },
  ],
  caps: [
    {
      id: "1",
      name: "Bulls Dynasty Snapback",
      team: "Chicago Bulls",
      year: 1996,
      condition: "near-mint",
      price: 18000,
      description: "Original 1996 championship-era Bulls snapback in excellent collector condition.",
      image: "bulls",
      featured: true,
    },
    {
      id: "2",
      name: "Lakers Showtime Fitted",
      team: "Los Angeles Lakers",
      year: 1988,
      condition: "excellent",
      price: 25000,
      description: "Purple and gold fitted cap inspired by the Showtime Lakers era.",
      image: "lakers",
      featured: true,
    },
    {
      id: "3",
      name: "Celtics Garden Classic",
      team: "Boston Celtics",
      year: 1992,
      condition: "good",
      price: 14500,
      description: "Vintage green Celtics cap with clean embroidery and classic fit.",
      image: "celtics",
      featured: true,
    },
  ],
  orders: [],
  contact: {
    shopName: "Caps Vault Manila",
    ownerName: "Juan Dela Cruz",
    phone: "+63 917 123 4567",
    email: "seller@capsvault.ph",
    address: "Makati City, Metro Manila",
    facebook: "facebook.com/capsvaultmanila",
    instagram: "@capsvaultmanila",
    messengerUsername: "capsvaultmanila",
    bio: "Collector of authentic vintage NBA caps in the Philippines.",
  },
};

let pool = null;

function sendError(res, err, fallbackMessage = "Server error") {
  console.error(err);
  res.status(500).json({ error: err?.message || fallbackMessage });
}

function normalizeCap(cap) {
  return {
    ...cap,
    year: Number(cap.year),
    price: Number(cap.price),
    featured: Boolean(cap.featured),
  };
}

function normalizeOrder(order) {
  let items = order.items;
  if (typeof items === "string") {
    try {
      items = JSON.parse(items);
    } catch {
      items = [];
    }
  }
  return {
    ...order,
    items: Array.isArray(items) ? items : [],
    total: Number(order.total || 0),
  };
}

function ensureJsonDb() {
  if (!fs.existsSync(jsonDbPath)) {
    fs.writeFileSync(jsonDbPath, JSON.stringify(defaultData, null, 2));
  }
}

function readJsonDb() {
  ensureJsonDb();
  return JSON.parse(fs.readFileSync(jsonDbPath, "utf8"));
}

function writeJsonDb(data) {
  fs.writeFileSync(jsonDbPath, JSON.stringify(data, null, 2));
}

async function initMySQL() {
  pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE,
    port: Number(process.env.MYSQL_PORT) || 3306,
    ssl: process.env.MYSQL_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      email VARCHAR(190) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin','user') NOT NULL DEFAULT 'user',
      phone VARCHAR(60) DEFAULT '',
      address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS caps (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      team VARCHAR(150) NOT NULL,
      year INT NOT NULL,
      \`condition\` VARCHAR(50) NOT NULL DEFAULT 'good',
      price DECIMAL(12,2) NOT NULL DEFAULT 0,
      description TEXT NOT NULL,
      image LONGTEXT NOT NULL,
      featured TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(64) PRIMARY KEY,
      userId VARCHAR(64) NOT NULL,
      userName VARCHAR(150) NOT NULL,
      items LONGTEXT NOT NULL,
      total DECIMAL(12,2) NOT NULL DEFAULT 0,
      status ENUM('pending','repacking','processing','shipped','completed','cancelled') NOT NULL DEFAULT 'pending',
      paymentMethod ENUM('cash','gcash') NOT NULL DEFAULT 'cash',
      deliveryType ENUM('pickup','cod') NOT NULL DEFAULT 'pickup',
      address TEXT NOT NULL,
      phone VARCHAR(60) NOT NULL,
      notes TEXT,
      date DATETIME NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS contact (
      id INT NOT NULL PRIMARY KEY,
      shopName VARCHAR(150) NOT NULL,
      ownerName VARCHAR(150) NOT NULL,
      phone VARCHAR(60) NOT NULL,
      email VARCHAR(190) NOT NULL,
      address TEXT NOT NULL,
      facebook VARCHAR(255) DEFAULT '',
      instagram VARCHAR(255) DEFAULT '',
      messengerUsername VARCHAR(255) DEFAULT '',
      bio TEXT
    )
  `);

  const [[userCount]] = await pool.query("SELECT COUNT(*) AS count FROM users");
  if (Number(userCount.count) === 0) {
    for (const user of defaultData.users) {
      await pool.query(
        "INSERT INTO users (id, name, email, password, role, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [user.id, user.name, user.email, user.password, user.role, user.phone, user.address]
      );
    }
  }

  const [[capCount]] = await pool.query("SELECT COUNT(*) AS count FROM caps");
  if (Number(capCount.count) === 0) {
    for (const cap of defaultData.caps) {
      await pool.query(
        "INSERT INTO caps (id, name, team, year, `condition`, price, description, image, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [cap.id, cap.name, cap.team, cap.year, cap.condition, cap.price, cap.description, cap.image, cap.featured ? 1 : 0]
      );
    }
  }

  const [[contactCount]] = await pool.query("SELECT COUNT(*) AS count FROM contact");
  if (Number(contactCount.count) === 0) {
    const c = defaultData.contact;
    await pool.query(
      "INSERT INTO contact (id, shopName, ownerName, phone, email, address, facebook, instagram, messengerUsername, bio) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [c.shopName, c.ownerName, c.phone, c.email, c.address, c.facebook, c.instagram, c.messengerUsername, c.bio]
    );
  }
}

async function initDataStore() {
  if (usingMySQL) {
    await initMySQL();
    console.log("Database mode: MySQL");
  } else {
    ensureJsonDb();
    console.log(`Database mode: JSON fallback (${jsonDbPath})`);
  }
}

// --- HEALTH API ---
app.get("/api/health", async (_req, res) => {
  try {
    if (usingMySQL) {
      await pool.query("SELECT 1");
    }
    res.json({ ok: true, database: usingMySQL ? "mysql" : "json" });
  } catch (err) {
    sendError(res, err, "Database health check failed");
  }
});

// --- AUTH API ---
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password are required." });

  try {
    if (usingMySQL) {
      const [rows] = await pool.query(
        "SELECT id, email, role, name, phone, address FROM users WHERE email = ? AND password = ? LIMIT 1",
        [email, password]
      );
      return rows.length > 0 ? res.json(rows[0]) : res.status(401).json({ error: "Invalid credentials" });
    }

    const db = readJsonDb();
    const user = db.users.find((u) => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const { password: _removed, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    sendError(res, err);
  }
});

app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "Name, email, and password are required." });

  const id = nowId();
  try {
    if (usingMySQL) {
      await pool.query(
        "INSERT INTO users (id, name, email, password, role, phone, address) VALUES (?, ?, ?, ?, 'user', '', '')",
        [id, name, email, password]
      );
      return res.status(201).json({ id, name, email, role: "user", phone: "", address: "" });
    }

    const db = readJsonDb();
    if (db.users.some((u) => u.email === email)) return res.status(409).json({ error: "Email already exists." });
    const user = { id, name, email, password, role: "user", phone: "", address: "" };
    db.users.push(user);
    writeJsonDb(db);
    const { password: _removed, ...safeUser } = user;
    res.status(201).json(safeUser);
  } catch (err) {
    if (err?.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "Email already exists." });
    sendError(res, err);
  }
});

// --- CAPS API ---
app.get("/api/caps", async (_req, res) => {
  try {
    if (usingMySQL) {
      const [rows] = await pool.query("SELECT id, name, team, year, `condition`, price, description, image, featured FROM caps ORDER BY created_at DESC, id DESC");
      return res.json(rows.map(normalizeCap));
    }

    const db = readJsonDb();
    res.json(db.caps.map(normalizeCap));
  } catch (err) {
    sendError(res, err);
  }
});

app.post("/api/caps", async (req, res) => {
  const { name, team, year, condition, price, description, image, featured } = req.body;
  const id = nowId();
  try {
    if (usingMySQL) {
      await pool.query(
        "INSERT INTO caps (id, name, team, year, `condition`, price, description, image, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [id, name, team, Number(year), condition, Number(price), description, image, featured ? 1 : 0]
      );
      return res.status(201).json(normalizeCap({ id, name, team, year, condition, price, description, image, featured }));
    }

    const db = readJsonDb();
    const cap = normalizeCap({ id, name, team, year, condition, price, description, image, featured });
    db.caps.push(cap);
    writeJsonDb(db);
    res.status(201).json(cap);
  } catch (err) {
    sendError(res, err);
  }
});

app.put("/api/caps/:id", async (req, res) => {
  const { name, team, year, condition, price, description, image, featured } = req.body;
  try {
    if (usingMySQL) {
      const [result] = await pool.query(
        "UPDATE caps SET name=?, team=?, year=?, `condition`=?, price=?, description=?, image=?, featured=? WHERE id=?",
        [name, team, Number(year), condition, Number(price), description, image, featured ? 1 : 0, req.params.id]
      );
      if (result.affectedRows === 0) return res.status(404).json({ error: "Cap not found." });
      return res.json({ success: true });
    }

    const db = readJsonDb();
    const index = db.caps.findIndex((cap) => cap.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Cap not found." });
    db.caps[index] = normalizeCap({ ...db.caps[index], name, team, year, condition, price, description, image, featured });
    writeJsonDb(db);
    res.json(db.caps[index]);
  } catch (err) {
    sendError(res, err);
  }
});

app.delete("/api/caps/:id", async (req, res) => {
  try {
    if (usingMySQL) {
      await pool.query("DELETE FROM caps WHERE id = ?", [req.params.id]);
      return res.status(204).send();
    }

    const db = readJsonDb();
    db.caps = db.caps.filter((cap) => cap.id !== req.params.id);
    writeJsonDb(db);
    res.status(204).send();
  } catch (err) {
    sendError(res, err);
  }
});

// --- ORDERS API ---
app.get("/api/orders", async (_req, res) => {
  try {
    if (usingMySQL) {
      const [rows] = await pool.query("SELECT * FROM orders ORDER BY date DESC");
      return res.json(rows.map(normalizeOrder));
    }

    const db = readJsonDb();
    res.json(db.orders.map(normalizeOrder).sort((a, b) => String(b.date).localeCompare(String(a.date))));
  } catch (err) {
    sendError(res, err);
  }
});

app.post("/api/orders", async (req, res) => {
  const { userId, userName, items, total, status, paymentMethod, deliveryType, address, phone, notes } = req.body;
  const id = nowId();
  const date = new Date().toISOString().slice(0, 19).replace("T", " ");
  const order = normalizeOrder({ id, userId, userName, items, total, status: status || "pending", paymentMethod, deliveryType, address, phone, notes, date });

  try {
    if (usingMySQL) {
      await pool.query(
        "INSERT INTO orders (id, userId, userName, items, total, status, paymentMethod, deliveryType, address, phone, notes, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [id, userId, userName, JSON.stringify(order.items), Number(total), order.status, paymentMethod, deliveryType, address, phone, notes || "", date]
      );
      return res.status(201).json(order);
    }

    const db = readJsonDb();
    db.orders.push(order);
    writeJsonDb(db);
    res.status(201).json(order);
  } catch (err) {
    sendError(res, err);
  }
});

app.put("/api/orders/:id", async (req, res) => {
  const { status } = req.body;
  try {
    if (usingMySQL) {
      const [result] = await pool.query("UPDATE orders SET status = ? WHERE id = ?", [status, req.params.id]);
      if (result.affectedRows === 0) return res.status(404).json({ error: "Order not found." });
      return res.json({ success: true });
    }

    const db = readJsonDb();
    const order = db.orders.find((item) => item.id === req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found." });
    order.status = status;
    writeJsonDb(db);
    res.json(order);
  } catch (err) {
    sendError(res, err);
  }
});

// --- CONTACT API ---
app.get("/api/contact", async (_req, res) => {
  try {
    if (usingMySQL) {
      const [rows] = await pool.query("SELECT shopName, ownerName, phone, email, address, facebook, instagram, messengerUsername, bio FROM contact WHERE id = 1 LIMIT 1");
      return res.json(rows[0] || defaultData.contact);
    }

    const db = readJsonDb();
    res.json(db.contact || defaultData.contact);
  } catch (err) {
    sendError(res, err);
  }
});

app.post("/api/contact", async (req, res) => {
  const { shopName, ownerName, phone, email, address, facebook, instagram, messengerUsername, bio } = req.body;
  const contact = { shopName, ownerName, phone, email, address, facebook, instagram, messengerUsername, bio };
  try {
    if (usingMySQL) {
      await pool.query(
        `INSERT INTO contact (id, shopName, ownerName, phone, email, address, facebook, instagram, messengerUsername, bio)
         VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE shopName=VALUES(shopName), ownerName=VALUES(ownerName), phone=VALUES(phone), email=VALUES(email), address=VALUES(address), facebook=VALUES(facebook), instagram=VALUES(instagram), messengerUsername=VALUES(messengerUsername), bio=VALUES(bio)`,
        [shopName, ownerName, phone, email, address, facebook, instagram, messengerUsername, bio]
      );
      return res.json(contact);
    }

    const db = readJsonDb();
    db.contact = contact;
    writeJsonDb(db);
    res.json(contact);
  } catch (err) {
    sendError(res, err);
  }
});

// --- USERS API ---
app.get("/api/users", async (_req, res) => {
  try {
    if (usingMySQL) {
      const [rows] = await pool.query("SELECT id, name, email, role, phone, address FROM users ORDER BY created_at DESC, name ASC");
      return res.json(rows);
    }

    const db = readJsonDb();
    res.json(db.users.map(({ password: _removed, ...user }) => user));
  } catch (err) {
    sendError(res, err);
  }
});

// Serve static frontend build.
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));

app.get("*", (_req, res) => {
  const indexPath = path.join(distPath, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send("Frontend build not found. Run: npm run build");
  }
});

const PORT = process.env.PORT || 3000;

initDataStore()
  .then(() => {
    app.listen(PORT, () => console.log(`NBA Vault Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Unable to start server because the database could not be initialized:", err.message);
    process.exit(1);
  });
