import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
    VALIDATOR_REQUIRE,
    VALIDATOR_MINLENGTH,
} from "../../shared/outil/Validators";
import Input from "../../shared/FormElements/Input";
import Button from "../../shared/FormElements/Button";
import { useForm } from "../../shared/hooks/Form-hook";
import { useHttpClient } from '../../shared/hooks/http-hook';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import "./PlaceForm.css";

const UpdatePlace = (props) => {
    const { error, isLoading, sendRequest, clearError } = useHttpClient();
    const [loadedPlace, setLoadedPlace] = useState();

    const placeId = useParams().placeId;

    const [formState, inputHandler, setFormData] = useForm(
        {
            title: {
                value: "",
                isValid: false,
            },
            description: {
                value: "",
                isValid: false,
            },
            address: {
                value: "",
                isValid: false,
            },
        },
        false
    );

    useEffect(() => {
        const fetchPlace = async () => {
            try {
                const responseData = await sendRequest(`http://localhost:5000/api/places/${placeId}`);
                setLoadedPlace(responseData.place);
                setFormData(
                    {
                        title: {
                            value: responseData.place.title,
                            isValid: true,
                        },
                        description: {
                            value: responseData.place.description,
                            isValid: true,
                        },
                        address: {
                            value: responseData.place.address,
                            isValid: true,
                        },
                    },
                    true
                );
            } catch (err) {};
        };
        fetchPlace();
    }, [sendRequest, placeId, setFormData]);

    if (!loadedPlace) {
        return (
            <div className="center">
                <ErrorModal error={error} onClear={clearError} />
            </div>
        );
    }

    const placeUpdateSubmitHandler = async (event) => {
        event.preventDefault();
        try {
            const responseData = await sendRequest(
                `http://localhost:5000/api/places/${placeId}`,
                "PATCH",
                {
                    "Content-Type": "application/json",
                },
                JSON.stringify({
                    title: formState.inputs.title.value,
                    description: formState.inputs.description.value,
                    address: formState.inputs.address.value,
                })
            );
            console.log(responseData.place);
        } catch (err) {};
    };

    if (isLoading) {
        return (
            <div className="center">
                <LoadingSpinner asOverlay />
            </div>
        );
    }

    return (
        <React.Fragment>
            {isLoading && <LoadingSpinner asOverlay />}
            {error && <ErrorModal error={error} onClear={clearError} />}
            {!isLoading && loadedPlace && !error && (
                <form
                    className="place-form"
                    onSubmit={placeUpdateSubmitHandler}
                >
                    <Input
                        id="title"
                        element="input"
                        type="text"
                        label="Title"
                        validators={[VALIDATOR_REQUIRE()]}
                        errorText="Please enter a valid title."
                        onInput={inputHandler}
                        initialValue={loadedPlace.title}
                        initialValid={true}
                    />
                    <Input
                        id="description"
                        element="textarea"
                        label="Description"
                        validators={[VALIDATOR_MINLENGTH(5)]}
                        errorText="Please enter a valid description."
                        onInput={inputHandler}
                        initialValue={loadedPlace.description}
                        initialValid={true}
                    />
                    <Input
                        id="address"
                        element="input"
                        type="text"
                        label="Address"
                        validators={[VALIDATOR_REQUIRE()]}
                        errorText="Please enter a valid address."
                        onInput={inputHandler}
                        initialValue={loadedPlace.address}
                        initialValid={true}
                    />
                    <Button type="submit" disabled={!formState.isValid}>
                        UPDATE PLACE
                    </Button>
                </form>
            )}
        </React.Fragment>
    );
};

export default UpdatePlace;
