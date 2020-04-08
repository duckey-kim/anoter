const express = require("express");
const app = express()
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send("Hi");
});

app.listen(port, () => {
  console.log(`server is running at http://localhost:${port}/`);
});