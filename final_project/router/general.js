const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username)=>{
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}

public_users.post("/register", (req,res) => {
  console.log('request', req.body)
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!doesExist(username)) { 
      users.push({"username":username,"password":password});
      return res.status(201).json({message: "User successfully registred. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});    
    }
  }

  return res.status(404).json({message: "Unable to register user."});
});

const getBooks = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(books);
  }, 1000)
})
// Get the book list available in the shop
public_users.get('/',async function (req, res) {
  return getBooks.then((booksResult) => {
    return res.status(200).json(booksResult);
  });
});

const getBookByISBN = (isbn) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(books[isbn]);
    }, 1000)
  })
}
// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  console.log('isbn', isbn)

  if (!Number.isInteger(Number(isbn))) {
    return res.status(400).json({message: "ISBN should be integer number"});
  }

  const book = await getBookByISBN(isbn);

  if (!book) {
    return res.status(404).json({message: "Book not found"});
  }

  return res.status(200).json(book);
 });
  
const getBooksByAuthor = (author) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(Object.values(books).filter((book) => book.author === author));
    }, 1000)
  })
}
// Get book details based on author
public_users.get('/author/:author',async function (req, res) {
  const author = req.params.author;

  if (!author) {
    return res.status(400).json({message: "Author is missing"});
  }

  const booksByAuthor = await getBooksByAuthor(author);

  return res.status(200).json({
    booksbyauthor: booksByAuthor
  });
});

const getBooksByTitle = (title) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(Object.values(books).filter((book) => book.title === title));
    }, 1000)
  })
}

// Get all books based on title
public_users.get('/title/:title',async function (req, res) {
  const title = req.params.title;

  if (!title) {
    return res.status(400).json({message: "Title is missing"});
  }

  const booksByTitle = await getBooksByTitle(title);

  return res.status(200).json({
    booksbytitle: booksByTitle
  });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  console.log('isbn', isbn)

  if (!Number.isInteger(Number(isbn))) {
    return res.status(400).json({message: "ISBN should be integer number"});
  }

  const book = books[isbn];

  if (!book) {
    return res.status(404).json({message: "Book not found"});
  }

  return res.status(200).json(book.reviews);
});

module.exports.general = public_users;
