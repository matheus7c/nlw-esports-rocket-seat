import express from "express";

const app = express();

app.get("/ads", (req, res) => {
  return res.json({'test': '1'});
});

app.listen(3333);
