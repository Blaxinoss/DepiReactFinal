// @ts-nocheck
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const userRoutes = require("./routes/userRoutes");
const carRoutes = require("./routes/carRoutes");
const rentRoutes = require("./routes/rentRoutes");
const maintainRoutes = require("./routes/maintainRoutes");

dotenv.config(); // load the env data

const app = express();
app.use(cors());
app.use(express.json()); //parse JSON

app.use("/api/cars", carRoutes);
app.use("/api/rents", rentRoutes);
app.use("/api/maintain", maintainRoutes);
app.use("/api/user", userRoutes);

mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/carRents", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB is connected and ready"))
  .catch((err) => console.error("MongoDB connection failed:", err));

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});