const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const shortId = require("shortid");

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

var urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
app.get("/u/:shortId", (req, res) => {
  let longURL = urlDatabase[req.params.shortId];
  if (longURL === undefined) {
    res.sendStatus(404);
    return;
  }
  res.redirect(longURL);
});
app.post("/urls/:id/delete", (req, res) => {
  var shortURL = req.params.id;
  // var longURL = urlDatabase[shortURL];
  // var combined = `${shortURL + longURL}`;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  var shortURL = req.params.id;
  var longURL = urlDatabase[shortURL];
  var templateVars = { shortUrl: shortURL, longUrl: longURL };
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  res.end("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
  console.log(shortId.generate());
  console.log(req.body.longURL);
  var newId = shortId.generate();
  var longUrl = req.body.longURL;
  // debug statement to see POST parameters
  urlDatabase[newId] = longUrl;
  console.log(urlDatabase);
  res.redirect(`/urls/${newId}`); // Respond with 'Ok' (we will replace this)
});

// function generateRandomString(string) {
//   let possible = "1234567890";
//   for (var i = 0; i < 26; i++) {
//     possible += String.fromCharCode(65 + i) + String.fromCharCode(97 + i);
//   }

//   console.log(possible);
// }

// generateRandomString();

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
