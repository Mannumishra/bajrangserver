const express = require("express");
const { connectdb } = require("./Database/ConnectDb");
const cors = require("cors");
const router = require("./Routes/signupRoutes");
const dotenv = require("dotenv");
const slipRouter = require("./Routes/ReciptRouter");
const path = require("path");


dotenv.config(); // Load environment variables

const app = express();


// CORS configuration to allow requests from both your frontend domains
const corsOptions = {
    origin: ['https://bajrangvahinidal.com', 'https://www.bajrangvahinidal.com'], // Allow both domains
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // Allow cookies to be sent with the requests
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "Public" directory
// app.use(express.static("Public"));
app.use('/Public', express.static(path.join(__dirname, 'Public')));


// Use the routers
app.use("/api", router);
app.use("/api", slipRouter);

// Welcome route
app.get("/", async (req, res) => {
    res.send("Welcome to Bajrang Vahini Dal");
});

// Connect to the database before starting the server
connectdb().then(() => {
    app.listen(process.env.PORT || 5000, () => {
        console.log(`Server is running on port ${process.env.PORT || 5000}`);
    });
}).catch(err => {
    console.error("Failed to connect to the database:", err);
});
