const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const shortId = require("shortid");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

app.use(morgan("tiny"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

var urlDatabase = {
  b2xVn2: {
    longUrl: "http://www.lighthouselabs.ca",
    userId: "hunter"
  },
  "9sm5xK": {
    longUrl: "http://www.google.com",
    userId: "titan"
  }
};

var users = {
  titan: {
    id: "titan",
    email: "a@a",
    password: "a"
  },
  hunter: {
    id: "hunter",
    email: "b@b",
    password: "b"
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

  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  // const { username } = req.body;
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
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
  if (!users[req.cookies["user_id"]]) {
    res.redirect("/urls");
    return;
  }
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(shortId.generate());
  console.log(req.body.longURL);
  var newId = shortId.generate();
  var objectUrl = req.body.longURL;
  // debug statement to see POST parameters
  urlDatabase[newId].longUrl = objectUrl;
  console.log(urlDatabase);
  res.redirect(`/urls/${newId}`);
});

app.get("/urls/:id", (req, res) => {
  var shortURL = req.params.id;
  //need to change
  var objectUrl = urlDatabase[shortURL].longUrl;
  var templateVars = {
    shortUrl: shortURL,
    longUrl: objectUrl,
    user: users[req.cookies["user_id"]]
  };
  console.log("Logged in page");
  console.log(templateVars);
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/update", (req, res) => {
  var shortId = req.params.id;

  console.log(shortId);
  console.log(req.body.longUrl);
  console.log("cookies", req.cookies);
  let curUserID = req.cookies.user_id;
  if (!(urlDatabase[shortId]["userId"] === curUserID)) {
    res.send("<h1>wrong </h1>");
    return;
  }
  urlDatabase[shortId]["longUrl"] = req.body.longUrl;

  res.redirect(`/urls/${shortId}`);
});

app.post("/urls/:id/delete", (req, res) => {
  var shortId = req.params.id;
  let curUserID = req.cookies.user_id;
  if (!(urlDatabase[shortId]["userId"] === curUserID)) {
    // res.sendStatus(403);
    res.send("<h1>You can not delete what isn't yours </h1>");
    return;
  }
  delete urlDatabase[shortId];
  res.redirect("/urls");
});

// point of project.
app.get("/u/:shortId", (req, res) => {
  let urlObject = urlDatabase[req.params.shortId];
  if (urlObject === undefined) {
    res.sendStatus(404);
    return;
  }
  res.redirect(urlObject["longUrl"]);
});

// opens local port
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
