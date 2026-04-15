// server.js
const express = require("express");
const app = express();

app.use(express.static("public"));

// ポート（Render用）
const PORT = process.env.PORT || 3000;

// 起動（これ超重要）
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
