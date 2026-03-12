const express = require('express');
const path = require("path");
const app = express();

const NIMI = process.env.TEAM_NAME || "Unknown Team";
const PORT = process.env.PORT || 3000;
const DATABASE = process.env.DATABASE


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"))
})

app.get("/login", (req, res) => {
    res.sendFile(__dirname, "loggedin.html")
})

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Api Server töötab selle pordi peale${PORT}`);
})