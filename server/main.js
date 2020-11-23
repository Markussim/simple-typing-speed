const express = require("express");
const wordsListPath = require("word-list");
const wordPath = require("word-list");
const app = express();
const port = 3000;

app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));
app.get("/words", (req, res) => res.sendFile(wordsListPath));
app.listen(port, () => console.log(`Example app listening on port port!`));
