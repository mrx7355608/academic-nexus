import StudentModel from "./features/students/students.model.js";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import config from "./config/config";

export default function passportSetup() {
    passport.use(
        new GoogleStrategy(
            {
                clientID: config.googleClientId,
                clientSecret: config.googleClientSecret,
                callbackURL: `${config.serverUrl}/api/auth/google/callback`,
            },
            async function (
                _accessToken: string,
                _refreshToken: string,
                profile: any,
                done: any,
            ) {
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

    passport.serializeUser((user: any, done: any) => {
        done(null, user.id);
    });
    passport.deserializeUser(async (id: string, done: any) => {
        try {
            const user = await StudentModel.findById(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });
}
