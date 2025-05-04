require("dotenv").config();

const db = require("./config/db");

//models
const User = require("./models/user.model");
const Role = require("./models/role.model");

//routes
const authRoutes = require("./routes/auth.routes");

const express = require("express");

const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
        // optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    })
);

app.use(express.json());
app.use(cookieParser());

db.serialize(() => {
    // User.createUserDetailsTable();
    Role.createTable();
});

//routes
app.use("/api/auth", authRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});