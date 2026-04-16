const express = require("express");
const PDFDocument = require("pdfkit-table");
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2");

const app = express();

const PORT = 4000;
const HOST = "0.0.0.0";

app.use(express.json());


const db = mysql.createConnection({
  host: "localhost",//172.27.191.4
  user: "siddu",
  password: "1234",
  database: "mvsr",
});




// CREATE TABLE users (
//   id INT AUTO_INCREMENT PRIMARY KEY,
//   username VARCHAR(50) NOT NULL UNIQUE,
//   password VARCHAR(100) NOT NULL
// );


db.connect((err) => {
  if (err) {
    console.error("MySQL Error:", err);
  } else {
    console.log("Connected to MySQL");

    const createScans = `
      CREATE TABLE IF NOT EXISTS scans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        barcode VARCHAR(100) NOT NULL,
        scan_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        username VARCHAR(50) NOT NULL
      )
    `;

    const createUsers = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
      )
    `;

    db.query(createScans, (err) => {
      if (err) console.error("Scans table error:", err);
      else console.log("Scans table set");
    });

    db.query(createUsers, (err) => {
      if (err) console.error("Users table error:", err);
      else console.log("Users table set");
    });
  }
});



app.post("/scan", (req, res) => {
  const { code, username } = req.body;

  const now = new Date();

  const sql = `
    INSERT INTO scans (barcode, scan_time, username)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [code, now, username], (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json({ success: true });
  });
});


// app.get("/data", (req, res) => {
//   const sql = "SELECT * FROM scans ORDER BY scan_time DESC";

//   db.query(sql, (err, results) => {
//     if (err) return res.status(500).send(err);

//     const formatted = {};

//     results.forEach((row) => {
//       if (!formatted[row.barcode]) {
//         formatted[row.barcode] = [];
//       }
//       formatted[row.barcode].push(row.scan_time);
//     });

//     res.json(formatted);
//   });
// });

app.get("/data", (req, res) => {
  const sql = "SELECT * FROM scans ORDER BY scan_time DESC";//ASC

  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(err);

    res.json(results); // 🔥 send raw rows
  });
});

app.get("/counts", (req, res) => {
  const sql = `
    SELECT barcode, COUNT(*) as count
    FROM scans
    GROUP BY barcode
    ORDER BY count DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(err);

    res.json(results);
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const sql = "SELECT * FROM users WHERE username = ? AND password = ?";

  db.query(sql, [username, password], (err, results) => {
    if (results.length > 0) {
      res.json({
        success: true,
        user: results[0], // contains username
      });
    } else {
      res.json({ success: false });
    }
  });
});

app.post("/register", (req, res) => {
  const { username, password } = req.body;

  const sql = `
    INSERT INTO users (username, password)
    VALUES (?, ?)
  `;

  db.query(sql, [username, password], (err, result) => {
    if (err) {
      console.error(err);

      if (err.code === "ER_DUP_ENTRY") {
        return res.json({ success: false, message: "User already exists" });
      }

      return res.status(500).json({ success: false });
    }

    res.json({ success: true });
  });
});


app.get("/generate-pdf", async (req, res) => {
  const sql = `
    SELECT barcode, COUNT(*) as count
    FROM scans
    GROUP BY barcode
  `;

  db.query(sql, async (err, results) => {
    if (err) return res.status(500).send(err);

    const doc = new PDFDocument({ margin: 30 });

    const filePath = path.join(__dirname, "report.pdf");
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    doc.fontSize(20).text("Students Data", { align: "center" });
    doc.moveDown();

    const tableData = results.map((row) => [
      row.barcode,
      row.count,
    ]);

    const table = {
      headers: ["Roll No", "Count"],
      rows: tableData,
    };

    await doc.table(table, {
      width: 500,
      columnsSize: [350, 150],
    });

    doc.end();

    stream.on("finish", () => {
      res.json({ success: true, file: "report.pdf" });
    });
  });
});

app.use("/files", express.static(__dirname));


const server = app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} already in use`);
    process.exit(1);
  }

  console.error("Server error:", error.message);
  process.exit(1);
});