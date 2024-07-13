import StudentModel from "./features/students/students.model.js";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import ApiError from "./utils/ApiError.js";

export default function passportSetup() {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: "/api/auth/google/callback",
            },
            async function (_accessToken, _refreshToken, profile, done) {
                // Check if user has previously logged in with google
                const student = await StudentModel.findOne({
                    googleId: profile.id,
                });
                if (student) {
                    return done(null, student);
                }

                // Validate domain of email to allow only university students
                if (!profile.emails[0].value.endsWith("@iqra.edu.pk")) {
                    return done(
                        new ApiError(
                            "Please login with your university email",
                            403,
                        ),
                    );
                }

                // Create and save new user in database
                const newUserData = {
                    googleId: profile.id,
                    fullname: profile.name.givenName,
                    email: profile.emails[0].value,
                    profilePicture: profile.photos[0].value,
                    bio: "",
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
