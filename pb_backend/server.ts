// server.ts
import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
import { networkInterfaces } from 'os';
const app = express();
const port = process.env.API_PORT || 8080;


function getPrivateIP(): string | undefined {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
}
const ip = getPrivateIP() || 'localhost';
dotenv.config();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'pocketledger'
});

db.connect(err => {
  if (err) throw err;
  console.log('DB ok');
});

const checkFields = (res: any, ...fields: any[]) => {
  if (fields.some((f) => !f)) return res.status(400).json({ error: 'Missing fields' });
};

app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  checkFields(res, name, email, password);

  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.promise().query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hash]
    );
    res.json({ id: (result as any).insertId, email });
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already registered' });
    res.status(500).json({ error: 'Server error' });
  }
});

// app.post('/api/userinfo', async (requestAnimationFrame, res) => {
//   const 
// })


app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

  try {
    const [rows]: any[] = await db.promise().query(
      'SELECT id, name, email, password FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const bcrypt = await import('bcrypt');
    const isValid = await bcrypt.compare(password, rows[0].password);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    const user = { id: rows[0].id, name: rows[0].name, email: rows[0].email };
    const token = jwt.sign(
      { sub: String(user.id), name: user.name, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});



app.listen(port, () => console.log(`Listening on ${ip}:${port}`));