const express = require('express');
const path = require("path");
const app = express();
const { auth, requiresAuth } = require("express-openid-connect")

let NIMI = process.env.TEAM_NAME || "Unknown Team";
let PORT = process.env.PORT || 3000;

app.set('trust proxy', 1)

app.use(
    auth({
        authRequired: false,
        auth0Logout: true,
        secret: process.env.AUTH0_SECRET,
        baseURL: process.env.AUTH0_BASE_URL,
        clientID: process.env.AUTH0_CLIENT_ID,
        clientSecret: process.env.AUTH0_CLIENT_SECRET,
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
    if (req.oidc.isAuthenticated()) {
        res.sendFile(path.join(__dirname, "loggedin.html"))
    } else {
        res.sendFile(path.join(__dirname, "index.html"))
    }
})

app.get("/dashboard", requiresAuth(), (req, res) => {
    res.sendFile(path.join(__dirname, "loggedin.html"))
})

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Api Server töötab selle pordi peale${PORT}`);
})