const express = require('express');
const path = require("path");
const app = express();
const { auth, requiresAuth } = require("express-openid-connect")
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

let NIMI = process.env.TEAM_NAME || "Unknown Team";
let PORT = process.env.PORT || 3000;

app.set('trust proxy', true)

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
//hey
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

app.post("/create-checkout-session", async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "eur",
                        product_data: {
                            name: "Premium access"
                        },
                        unit_amount: 500
                    },
                    quantity: 1
                }
            ],
            mode: "payment",
            success_url: `${process.env.AUTH0_BASE_URL}/success`,
            cancel_url: `${process.env.AUTH0_BASE_URL}/`
        });

        res.json({ url: session.url });
    } catch (e) {
        console.error(e)
        res.status(500).json({
            message: "Something wend wrong"
        })
    }
});

app.get("/success", (req, res) => {
    res.send("Payment successful");
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Api Server töötab selle pordi peale${PORT}`);
})