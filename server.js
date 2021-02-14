const express = require("express");
const connectDB = require("./config/db.js");

const app = express();

// Connect Database
connectDB();

const PORT = process.env.PORT || 5000;

app.use(express.json());

//Defining Routes
app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/admin", require("./routes/api/admin"));
app.use("/api/desk", require("./routes/api/desk"));

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
