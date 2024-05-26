const express = require("express");
const path = require("path");
const app = express();

app.use(express.static(__dirname + "/"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "index.html");
});

app.listen(3000, () => {
  console.log("Listen on the port 3000...");
});
