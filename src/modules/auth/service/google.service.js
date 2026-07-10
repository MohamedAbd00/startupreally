import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import Usermodel from "./../../../DB/models/usermodel.js";
//teacher
passport.use(
  new GoogleStrategy(
    {
      clientID:process.env.clientID,// process.env.GOOGLE_CLIENT_ID || "sasasasas" ,
      clientSecret: process.env.clientSecret,
      callbackURL: process.env.callbackURL,
    },
    async (_, __, profile, done) => {
      try {
        let user = await Usermodel.findOne({  email: profile.emails[0].value });

        if (!user) {
          user = await Usermodel.create({
  username: profile.displayName,
  email: profile.emails[0].value,
  profileImage: profile.photos[0].value,
  isConfirmed: true,
});
        }

        done(null, user);
      } catch (err) {
        done(err, false);
      }
    }
  )
);

export default passport