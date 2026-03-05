const epxress = require('express');
const app = epxress();

let NIMI = process.env.TEAM_NAME || "Unknown Team";
let PORT = process.env.PORT || 3000;

app.get("/api/info", (req, res) => {
    res.status(200).json({
        missioon: "Iseseisev deploimine edukas",
        meeskond: NIMI,
        aeg: new Date().toISOString()
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Api Server töötab selle pordi peale${PORT}`);
})