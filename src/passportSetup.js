import StudentModel from "./features/students/students.model.js";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";

export default function passportSetup() {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: `${process.env.SERVER_URL}/api/auth/google/callback/`,
            },
            async function (_accessToken, _refreshToken, profile, done) {
                // Validate domain of email to allow only university students
                if (!profile.emails[0].value.endsWith("@iqra.edu.pk")) {
                    return done(null, false, {
                        message:
                            "Invalid email domain. Please use your IU email to login",
                    });
                }

                // Check if user has previously logged in with google
                const student = await StudentModel.findOne({
                    googleId: profile.id,
                });
                if (student) {
                    return done(null, student);
                }

                // Create and save new user in database
                const newUserData = {
                    googleId: profile.id,
                    fullname: profile.name.givenName,
                    email: profile.emails[0].value,
                    profilePicture: profile.photos[0].value,
                    degree: "",
                };
                const newStudent = await StudentModel.create(newUserData);
                return done(null, newStudent);
            },
        ),
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await StudentModel.findById(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });
}
