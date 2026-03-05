const express = require('express');
const path = require("path");
const app = express();
const { auth } = require("express-openid-connect")

let NIMI = process.env.TEAM_NAME || "Unknown Team";
let PORT = process.env.PORT || 3000;

app.use(
    auth({
        authRequired: false,
        auth0Logout: true,
        secret: process.env.AUTH0_SECRET,
        baseURL: process.env.AUTH0_BASE_URL,
        clientID: process.env.AUTH0_CLIENT_ID,
        issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL
    })
)

app.get("/api/info", (req, res) => {
    res.status(200).json({
        missioon: "Iseseisev deploimine edukas",
        meeskond: NIMI,
        aeg: new Date().toISOString()
    });
});

app.get("/", (req, res) => {
    console.log(req.body)
    req.oidc.isAuthenticated()
        ? res.sendFile(path.join(__dirname, "index.html"))
        : res.send(`Somebody is already logged in`)
})

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Api Server töötab selle pordi peale${PORT}`);
})