const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  const token = req.headers.authorization
  if(!token) {
    next({ status: 400, message: 'token required' })
    // res.send('token required')
    // next()
  } 
    jwt.verify(token, 'shh', (err, decoded) => {
      if(err) {
        next({ status: 400, message: 'token invalid' })
        // res.send('token invalid')
        // next()
      } else {
        req.decoded = decoded
        next()
      }
    })
  /*
    IMPLEMENT

    1- On valid token in the Authorization header, call next.

    2- On missing token in the Authorization header,
      the response body should include a string exactly as follows: "token required".

    3- On invalid or expired token in the Authorization header,
      the response body should include a string exactly as follows: "token invalid".
  */
};
