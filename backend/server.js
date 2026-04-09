const express = require("express");
const PDFDocument = require("pdfkit-table");
const fs = require("fs");
const path = require("path");
const app = express();

//const PORT = 8000;
const PORT = 4000;
const HOST = "0.0.0.0";
const FILE = path.join(__dirname, "data.json");

const USERS_FILE = path.join(__dirname, "users.json");

app.use(express.json());

if (!fs.existsSync(FILE)) {
  fs.writeFileSync(FILE, JSON.stringify({}));
}


app.get("/generate-pdf", async (req, res) => {
  let data = {};

  try {
    data = JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {
    data = {};
  }

  const doc = new PDFDocument({ margin: 30 });

  const filePath = path.join(__dirname, "report.pdf");
  const stream = fs.createWriteStream(filePath);

  doc.pipe(stream);

  doc.fontSize(20).text("students data", { align: "center" });
  doc.moveDown();

  const tableData = [];

  Object.keys(data).forEach((barcode) => {
    const count = Array.isArray(data[barcode])
      ? data[barcode].length
      : 0;

    tableData.push([barcode, count]);
  });

  const table = {
    headers: ["roll no", "Count"],
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

app.use("/files", express.static(__dirname));

app.post("/scan", (req, res) => {
  const { code } = req.body;

  console.log("Received:", code);

  let data = {};
  try {
    data = JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {
    data = {};
  }

  const now = new Date().toISOString();

  if (!data[code]) {
    data[code] = [];
  }

  data[code].push(now);

  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));

  console.log("Saved in new format");

  res.json({ success: true });
});


app.get("/data", (req, res) => {
  let data = {};
  try {
    data = JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {
    data = {};
  }

  res.json(data);
});


app.post("/login", (req, res) => {
  const { username, password } = req.body;

  let usersData = { users: [] };

  try {
    usersData = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
  } catch {
    usersData = { users: [] };
  }

  const user = usersData.users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    return res.json({ success: true });
  } else {
    return res.json({ success: false, message: "Invalid credentials" });
  }
});

const server = app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Stop the existing backend process first.`);
    process.exit(1);
  }

  console.error("Server failed to start:", error.message);
  process.exit(1);
});