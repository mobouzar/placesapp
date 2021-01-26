const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const getCoordsForAddress = require("../util/location");
const HttpError = require("../models/http-error");
const Place = require("../models/place");
const User = require("../models/user");

// var DUMMY_PLACES = [  
//     {
//         id: "p1",
//         title: "Empire State Building",
//         description: "One of the most famous sky scrapers in the world!",
//         imageUrl:
//             "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg",
//         address: "20 W 34th St, New York, NY 10001",
//         location: {
//             lat: 40.7484405,
//             lng: -73.9878584,
//         },
//         creator: "u1",
//     },
// ];

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError(
            "Something went wrong, could not find a place!",
            500
        );
        return next(error);
    }

    if ( !place ) {
        const error = new HttpError(
            "Could not find a place for the provided id.",
            404
        );
        return next(error);
    }
    
    res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;
    
    let userWithPlaces;
    try {
        userWithPlaces = await User.findById(userId).populate('places');
    } catch (err) {
        const error = new HttpError(
            "Fetching places failed, please try again later!",
            500
        );
        return next(error);
    }

    if ( !userWithPlaces || userWithPlaces.places.length === 0 ) {
        return next(
            new HttpError(
                "Could not find a place for the provided user id.",
                404
            )
        );
    }

    res.json({ places: userWithPlaces.places.map(place => place.toObject({ getters: true })) });
};

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if ( !errors.isEmpty() ) {
        const error = new HttpError(
            "Invalid inputs passed, Please check your data.",
            422
        );
        return next(error);
    }

    
    const { title, description, address, creator } = req.body;

    let coordinates;
    try {
        coordinates = await getCoordsForAddress(address);
    } catch (error) {
        return next(error);
    }

    const createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates,
        image: req.file.path,
        creator,
    });

    let user;
    try {
        user = await User.findById(creator);
    } catch(err) {
        return next(
            new HttpError("Creating place field, please try again!", 500)
        );
    }

    if (!user) {
        return next(new HttpError("Could not find user for provided id.", 404));
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPlace.save({ session: sess });
        user.places.push(createdPlace);
        await user.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError(
            "Creating place field, please try again!",
            500
        );
        return next(error);
    }

    res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
    const errors = validationResult(req);
    if ( !errors.isEmpty() ) {
        const error = new HttpError(
            "Invalid inputs passed, Please check your data.",
            422
        );
        return next(error);
    }

    const placeId = req.params.pid;
    const { title, description, address } = req.body;
    
    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError(
            "Something went wrong, could not update place!",
            500
        );
        return next(error);
    }

    try {
        place.title = title;
        place.description = description;
        place.address = address;
        
        await place.save();

    } catch (err) {
        const error = new HttpError(
            "Something went wrong, could not update place!",
            500
        );
        return next(error);
    }

    res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId).populate('creator');
    } catch (err) {
        const error = new HttpError(
            "Could not find a place with this id.",
            404
        );
        return next(error);
    }

    if (!place) {
        return next(new HttpError("Could not find place for this id.", 404));
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await place.remove({ session: sess });
        place.creator.places.pull(place);
        await place.creator.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError(
            "Something went wrong, could not delete place 2.",
            500
        );
        return next(error);
    }

    res.status(200).json({ message: "Deleted place." });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
