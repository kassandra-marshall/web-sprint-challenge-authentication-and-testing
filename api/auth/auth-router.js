const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../users/users-model')

router.post('/register', async (req, res, next) => {
  const { username, password } = req.body
  const checkIfExists = await User.findUsername(username)

  if(checkIfExists) {
    res.status(400).json('username taken')
  } else if (username === undefined || password === undefined) {
    res.status(400).json('username and password required')
  } else {
    const hash = bcrypt.hashSync(password, 8)
    User.add({ username, password: hash})
    .then(saved => {
      res.status(201).json(saved)
    })
    .catch(next)
  }
  // res.end('implement register, please!');
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.
    DO NOT EXCEED 2^8 ROUNDS OF HASHING!

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  if(password === undefined){
    res.status(400).json('username and password required')
  } else {
    if (username && password) {
      const user = await User.findUsername(username)
      if(!user){
        res.status(400).json('invalid credentials')
      } else {
        if (bcrypt.compareSync(password, user.password)){
          const token = buildToken(user)
          res.status(200).json({ message: `welcome, ${user.username}`, token: token })
        } else {
          res.status(400).json('invalid credentials')
        }
      }
    } else if(req.body.username === undefined) {
      res.status(400).json('username and password required')
  }
  }
  // res.end('implement login, please!');
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */
});

function buildToken(user) {
  const payload = {
    subject: user.user_id,
    username: user.username
  }
  const options = {
    expiresIn: '1d'
  }
  return jwt.sign(payload, 'shh', options)
}

module.exports = router;
