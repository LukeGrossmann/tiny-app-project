const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const shortId = require("shortid");
const cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

var urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

var users = {
  titan: {
    id: "titan",
    email: "a@a",
    password: "a  "
  },
  hunter: {
    id: "hunter",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  warlock: {
    id: "warlock",
    email: "user3@example.com",
    password: "dishwasher-funk"
  },
  dreg: {
    id: "dreg",
    email: "user4@example.com",
    password: "dishwasher-funk"
  }
};

function is_duplicate_email(email) {
  for (var prop in users) {
    return users[prop].email === email;
  }
}

app.get("/u/:shortId", (req, res) => {
  let longURL = urlDatabase[req.params.shortId];
  if (longURL === undefined) {
    res.sendStatus(404);
    return;
  }
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  var newId = shortId.generate();
  var email = req.body["email"];
  var password = req.body["password"];
  users[newId] = {
    id: newId,
    email: email,
    password: password
  };
  console.log(users);
  if (email === "" || password === "") {
    res.sendStatus(400);
    return;
  } else if (is_duplicate_email(email)) {
    res.sendStatus(400);
    return;
  }

  res.cookie("user_id", newId);

  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  res.render("login");
});
app.post("/login", (req, res) => {
  // const username = req.body.username;
  // res.cookie("user_id", users[username]);

  var email = req.body["email"];
  var password = req.body["password"];
  var user;
  for (var userId in users) {
    if (users[userId].email === email) {
      user = users[userId];
    }
  }
  if (!user) {
    res.sendStatus(403);
    return;
  }
  if (user.password !== password) {
    res.sendStatus(403);
    return;
  }

  res.cookie("user_id", user.id);

  res.redirect("/");
});

app.post("/logout", (req, res) => {
  // const { username } = req.body;
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/urls/:id/update", (req, res) => {
  var shortId = req.params.id;

  console.log(shortId);
  console.log(req.body.longUrl);
  //update db
  urlDatabase[shortId] = req.body.longUrl;

  res.redirect(`/urls/${shortId}`);
});

app.post("/urls/:id/delete", (req, res) => {
  var shortURL = req.params.id;
  // var longURL = urlDatabase[shortURL];
  // var combined = `${shortURL + longURL}`;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  console.log("Base page");
  console.log(templateVars);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  var templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  var shortURL = req.params.id;
  var longURL = urlDatabase[shortURL];
  var templateVars = {
    shortUrl: shortURL,
    longUrl: longURL,
    user: users[req.cookies["user_id"]]
  };
  console.log("Logged in page");
  console.log(templateVars);
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
  res.redirect(`/urls/${newId}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// this was the function I was going to use instead of downloading shortID module!!!!!

// function generateRandomString(string) {
//   let possible = "1234567890";
//   for (var i = 0; i < 26; i++) {
//     possible += String.fromCharCode(65 + i) + String.fromCharCode(97 + i);
//   }

//   console.log(possible);
// }

// generateRandomString();
