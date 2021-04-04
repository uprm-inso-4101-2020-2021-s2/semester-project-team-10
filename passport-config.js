const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByEmail, getUserById) {
  const authenticateUser = async (email, password, done) => {
    console.log('Authenticating...');
    const user = (await getUserByEmail(email))[0];
    if (user == null) {
      return done(null, false, console.log('No user with that email'))
    }

    try {
      if ((password === user.password)) {
        console.log('Password correct')
        return done(null, user)
      } else {
        return done(null, false, { message: 'Password incorrect' })
      }
    } catch (e) {
      return done(e)
    }
  }

  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
  passport.serializeUser((user, done) => done(null, user.userId))
  passport.deserializeUser(async (userId, done) => {
    return done(null, (await getUserById(userId))[0])
  })
}

module.exports = initialize