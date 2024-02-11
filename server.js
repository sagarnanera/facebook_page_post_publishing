require("dotenv").config();
require("./src/db/db");
const app = require("./src/app");

const PORT = process.env.PORT || 8080;

// app.context.db = db;
app.listen(PORT, (err) => {
  if (err) {
    console.log("Error occurred while starting the server..." + err);
    return;
  }

  console.log(`Server started on PORT --> ${PORT}`);
  console.log("Node environment --> " + process.env.NODE_ENV);
});
