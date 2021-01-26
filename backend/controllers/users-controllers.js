const { validationResult } = require("express-validator");
const HttpError = require('../models/http-error');
const User = require('../models/user');

const getUsers = async (req, res, next) => {

    let users;
    try {
        users = await User.find({}, '-password');
    } catch (err) {
        return next(
            new HttpError("Fetching user failed, please try later.", 500)
        );
    }

    res.status(200).json({
        users: users.map((user) => user.toObject({ getters: true })),
    });
};

const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if ( !errors.isEmpty() ) {
        const error = new HttpError(
            "Invalid inputs passed, Please check your data.",
            422
        );
        return next(error);
    }

    const { name, email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        return next(new HttpError("Signing up failed, please try again.", 500));
    }

    if ( existingUser ) {
        return next(
            new HttpError("Could not signing up, email already exists.", 422)
        );
    }

    const createdUser = new User({
        name,
        email,
        password,
        image: req.file.path,
        places: [],
    });

    try {
        await createdUser.save();
    } catch (err) {
        const error = new HttpError(
            "Signing up failed, please try later.",
            422
        );
        return next(error);
    }

    res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
    const errors = validationResult(req);
    if ( !errors.isEmpty() ) {
        return next(
            new HttpError("Invalid inputs passed, Please check your data.", 422)
        );
    }

    const { email, password } = req.body;

    let identifiedUser;
    try {
        identifiedUser = await User.findOne({ email: email });
    } catch (err) {
        return next(
            new HttpError("Logging in failed, please try later.", 500)
        );
    }

    if ( !identifiedUser || identifiedUser.password !== password ) {
        return next(
            new HttpError(
                "Could not identify user, credentials seem to be wrong!.",
                404
            )
        );
    }

    res.status(201).json({
        message: "logged in!",
        user: identifiedUser.toObject({ getters: true }),
    });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
