const express = require('express');
const path = require("path");
const app = express();

let NIMI = process.env.TEAM_NAME || "Unknown Team";
let PORT = process.env.PORT || 3000;

app.get("/api/info", (req, res) => {
    res.status(200).json({
        missioon: "Iseseisev deploimine edukas",
        meeskond: NIMI,
        aeg: new Date().toISOString()
    });
});

app.get("/", (req, res) => {
    console.log(req.body)
    res.sendFile(path.join(__dirname, "index.html"))
})

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Api Server töötab selle pordi peale${PORT}`);
})