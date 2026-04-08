const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

//const PORT = 8000;
const PORT = 4000;
const HOST = "0.0.0.0";
const FILE = path.join(__dirname, "data.json");

app.use(express.json());

if (!fs.existsSync(FILE)) {
  fs.writeFileSync(FILE, JSON.stringify({}));
}

const normalizeData = (raw) => {
  const normalized = {};

  Object.entries(raw || {}).forEach(([date, value]) => {
    if (Array.isArray(value?.scanned)) {
      normalized[date] = { scanned: value.scanned };
      return;
    }

    if (value && typeof value === "object" && value.scanned) {
      normalized[date] = {
        scanned: [
          {
            scanned: value.scanned,
            time: value.time || "",
          },
        ],
      };
      return;
    }

    normalized[date] = { scanned: [] };
  });

  return normalized;
};

app.post("/scan", (req, res) => {
  const { code } = req.body;

  console.log("Received:", code);

  let data = {};
  try {
    data = normalizeData(JSON.parse(fs.readFileSync(FILE, "utf8")));
  } catch {
    data = {};
  }

  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const time = now.toTimeString().split(" ")[0];

  if (!data[date]) {
    data[date] = { scanned: [] };
  }

  if (!Array.isArray(data[date].scanned)) {
    data[date].scanned = [];
  }


  data[date].scanned.push({
    scanned: code,
    time: time,
  });

  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));

  console.log("Saved in new format");

  res.json({ success: true });
});


app.get("/data", (req, res) => {
  let data = {};
  try {
    data = normalizeData(JSON.parse(fs.readFileSync(FILE, "utf8")));
  } catch {
    data = {};
  }
  res.json(data);
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