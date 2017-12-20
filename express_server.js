//all my npm packages
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const shortId = require("shortid");
const morgan = require("morgan");
const bcrypt = require("bcrypt");
const cookieSession = require("cookie-session");
//my debugger
app.use(morgan("tiny"));

app.use(bodyParser.urlencoded({ extended: true }));
//cookieSession is my cookie encrypter
app.use(
  cookieSession({
    name: "session",
    keys: ["verysecretkey"]
  })
);
//Express Templates
app.set("view engine", "ejs");
//my pre-set URL database for each user
var urlDatabase = {
  b2xVn2: {
    longUrl: "http://www.lighthouselabs.ca",
    userId: "hunter",
    date: "fake",
    visits: 3
  },
  "9sm5xK": {
    longUrl: "http://www.google.com",
    userId: "titan",
    date: "also fake",
    visits: 100
  }
};
//my pre-set database where I push in new users and keep hashed passwords
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
//my funciton for checking duplicate emails
function is_duplicate_email(email) {
  console.log(email);
  var contains = false;
  for (var prop in users) {
    console.log("checking email for", prop);
    console.log(users[prop].email);
    contains = contains || users[prop].email === email;
    console.log(contains);
  }
  return contains;
}

function belongsTo(user_id, url) {
  return urlDatabase[url].userId === user_id;
}

function urlsForUser(user_id) {
  var answer = {};
  for (var shortURL in urlDatabase) {
    if (belongsTo(user_id, shortURL)) {
      answer[shortURL] = urlDatabase[shortURL];
    }
  }
  return answer;
}
//rendering my register page
app.get("/register", (req, res) => {
  res.render("register");
});
//posting to my register page and redirecting to the home page
app.post("/register", (req, res) => {
  var newId = shortId.generate();
  var email = req.body["email"];
  var password = bcrypt.hashSync(req.body["password"], 10);

  console.log(users);
  if (email === "" || password === "") {
    res.sendStatus(400);
    return;
  } else if (is_duplicate_email(email)) {
    res.sendStatus(400);
    return;
  }

  users[newId] = {
    id: newId,
    email: email,
    password: password
  };

  req.session.user_id = newId;

  res.redirect("/urls");
});
//rendering my login page
app.get("/login", (req, res) => {
  res.render("login");
});
//posting login and then redirecting back to home page
app.post("/login", (req, res) => {
  var email = req.body["email"];
  var password = req.body["password"];
  var user;
  console.log(users);
  for (var userId in users) {
    if (users[userId].email === email) {
      user = users[userId];
    }
  }
  if (!user) {
    res.sendStatus(403);
    return;
  }
  if (!bcrypt.compareSync(password, user.password)) {
    res.sendStatus(403);
    return;
  }

  req.session.user_id = user.id;

  res.redirect("/urls");
});
//posting form to logout page ans redirecting back to home page
app.post("/logout", (req, res) => {
  // const { username } = req.body;
  req.session.user_id = null;
  res.redirect("/urls");
});
//checking for user at root page, if user, going back to home page, if not, redirect to login
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/urls");
  }
});
//getting my Json database
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
//rendering home page
app.get("/urls", (req, res) => {
  // looping over userUrls in order to just display the users urls on the /urls page.
  var userUrls = urlsForUser(req.session.user_id);
  let templateVars = {
    urls: userUrls,
    user: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});
//rendering page for when you create new urls
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  }
  var templateVars = {
    user: users[req.session.user_id]
  };
  if (!users[req.session.user_id]) {
    res.redirect("/login");
    return;
  }
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  var newId = shortId.generate();
  var objectUrl = req.body.longURL;
  urlDatabase[newId] = {
    longUrl: objectUrl,
    userId: req.session.user_id,
    date: Date().toString(),
    visits: 0
  };
  res.redirect(`/urls/${newId}`);
});
//rendering page an redirecting to urls_show
app.get("/urls/:id", (req, res) => {
  var shortURL = req.params.id;
  //need to change
  var objectUrl = undefined;
  if (shortURL in urlDatabase) {
    objectUrl = urlDatabase[shortURL].longUrl;
    urlDatabase[shortURL].visits++;
  }

  var templateVars = {
    shortUrl: shortURL,
    longUrl: objectUrl,
    date: urlDatabase[shortURL] ? urlDatabase[shortURL].date : "",
    visits: urlDatabase[shortURL] ? urlDatabase[shortURL].visits : "",
    user: users[req.session.user_id],
    owned: objectUrl ? belongsTo(req.session.user_id, shortURL) : false
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/update", (req, res) => {
  var shortId = req.params.id;

  console.log(shortId);
  console.log(req.body.longUrl);
  console.log("cookies", req.session);
  let curUserID = req.session.user_id;
  if (!(urlDatabase[shortId]["userId"] === curUserID)) {
    res.send("<h1>wrong </h1>");
    return;
  }
  urlDatabase[shortId]["longUrl"] = req.body.longUrl;

  res.redirect(`/urls/${shortId}`);
});
//deleteing any new short urls if there is a user
app.post("/urls/:id/delete", (req, res) => {
  var shortId = req.params.id;
  let curUserID = req.session.user_id;
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
