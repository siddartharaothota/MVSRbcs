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
  host: "192.168.111.2",
  user: "siddartharao",
  password: "1234",
  database: "mvsr",
});

// CREATE USER 'appuser'@'%' IDENTIFIED BY '1234';
// GRANT ALL PRIVILEGES ON *.* TO 'appuser'@'%';
// FLUSH PRIVILEGES;


db.connect((err) => {
  if (err) {
    console.error("MySQL Error:", err);
  } else {
    console.log("Connected to MySQL");
  }
});

// db.connect((err) => {
//   if (err) throw err;

//   console.log("Connected");

//   db.query("CREATE DATABASE IF NOT EXISTS mvsr", () => {
//     db.changeUser({ database: "mvsr" });

//     db.query(`
//       CREATE TABLE IF NOT EXISTS scans (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         barcode VARCHAR(100),
//         scan_time DATETIME
//       )
//     `);
//   });
// });



app.post("/scan", (req, res) => {
  const { code } = req.body;

  const now = new Date();

  const sql = "INSERT INTO scans (barcode, scan_time) VALUES (?, ?)";

  db.query(sql, [code, now], (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json({ success: true });
  });
});


app.get("/data", (req, res) => {
  const sql = "SELECT * FROM scans ORDER BY scan_time DESC";

  db.query(sql, (err, results) => {
    if (err) return res.status(500).send(err);

    const formatted = {};

    results.forEach((row) => {
      if (!formatted[row.barcode]) {
        formatted[row.barcode] = [];
      }
      formatted[row.barcode].push(row.scan_time);
    });

    res.json(formatted);
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