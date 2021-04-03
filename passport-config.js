const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByEmail, getUserById) {
  console.log('entered passport');
  const authenticateUser = async (email, password, done) => {
    console.log('trying to authenticate');
    const user = (await getUserByEmail(email))[0];
    console.log(user);
    if (user == null) {
      return done(null, false, console.log('No user with that email'))
    }

    try {
      if ((password === user.password)) {
        return done(null, user)
      } else {
        return done(null, false, { message: 'Password incorrect' })
      }
    } catch (e) {
      return done(e)
    }
  }

  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
  passport.serializeUser((user, done) => done(null, user.id))
  passport.deserializeUser((id, done) => {
    return done(null, getUserById(id))
  })
}

module.exports = initialize