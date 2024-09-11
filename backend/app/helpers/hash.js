const bcrypt = require('bcrypt');
const saltRounds = 10;

async function hashPassword (password) {
  
    const hashedPassword = await new Promise((resolve, reject) => {
      bcrypt.hash(password, saltRounds, function(err, hash) {
        if (err) reject (err)
        resolve(hash)
      });
    })
  
    return hashedPassword;
}

module.exports = { 'hashPassword' : hashPassword }