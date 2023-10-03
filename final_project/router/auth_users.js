const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
  { username: 'test', password: 'test' }
];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
  let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  if(validusers.length > 0){
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.query.username;
  const password = req.query.password;

  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }

  if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken,username
  }
  return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});

const isReviewValid = (review) => {
  switch(review) {
    case 'good': return true;
    case 'bad': return true;
    default: return false;
  }
}

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.data;
  const review = req.query.review;

  console.log('isbn', isbn)
  console.log('username', username)
  console.log('review', review)

  if (!username) {
    return res.status(403).json({message: "User not authenticated"})
  }

  if (!isbn || !isReviewValid(review)) {
    return res.status(400).json({message: "Invalid input"})
  }

  const book = books[isbn];
  book.reviews[username] = review;

  console.log('book', book)


  return res.status(200).json({message: `The review for book with ISBN ${isbn} has been added/updated.`});
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.data;

  console.log('isbn', isbn)
  console.log('username', username)

  if (!username) {
    return res.status(403).json({message: "User not authenticated"})
  }

  if (!isbn) {
    return res.status(400).json({message: "Invalid input"})
  }

  const book = books[isbn];
  delete book.reviews[username]

  return res.status(200).json({message: `Reviews for the ISBN ${isbn} posted by the user ${username} deleted.`});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
