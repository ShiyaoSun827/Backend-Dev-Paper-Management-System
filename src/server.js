const express = require("express");
const routes = require("./routes");
const middleware = require("./middleware");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(middleware.requestLogger);

// Routes
app.use("/api", routes);

// Error handling
app.use(middleware.errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
