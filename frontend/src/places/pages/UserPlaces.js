import React, { useState, useEffect, useCallback } from "react";
import { useParams } from 'react-router-dom';

import { useHttpClient } from '../../shared/hooks/http-hook';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import PlaceList from "../components/PlaceList";

const UserPlaces = () => {
    const [loadedPlaces, setLoadedPlaces] = useState();
    const { error, isLoading, sendRequest, clearError } = useHttpClient();

    const uid = useParams().uid;

    useEffect( useCallback(() => {
        console.log("hello");
        const fetchPlaces = async () => {
            try {
                const responseData = await sendRequest(
                    `http://localhost:5000/api/places/user/${uid}`
                );
                setLoadedPlaces(responseData.places); 
                console.log("fetched");
            } catch (err) {}
        };
        fetchPlaces();
    }, []), [sendRequest, uid])

    const deletePlaceHandler = (deletePlaceId) => {
        setLoadedPlaces((prevPlace) =>
            prevPlace.fillter((place) => place.id !== deletePlaceId)
        );
    };

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError} />
            {isLoading && <LoadingSpinner asOverlay />}
            {!isLoading && loadedPlaces && (
                <PlaceList
                    items={loadedPlaces}
                    onDeletePlace={deletePlaceHandler}
                />
            )}
        </React.Fragment>
    );
};

export default UserPlaces;
