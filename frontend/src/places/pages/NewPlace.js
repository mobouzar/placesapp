import React, { useContext } from "react";

import Input from "../../shared/FormElements/Input";
import Button from "../../shared/FormElements/Button";
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import ImageUpload from '../../shared/FormElements/ImageUpload';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/Auth-context';
import {
    VALIDATOR_REQUIRE,
    VALIDATOR_MINLENGTH,
} from "../../shared/outil/Validators";
import { useForm } from '../../shared/hooks/Form-hook';
import "./PlaceForm.css";


const NewPlace = ( props ) => {
    const auth = useContext(AuthContext);
    const {error, isLoading, sendRequest, clearError} = useHttpClient();
    const [formState, InputHandler] = useForm({
        title: {
            value: '',
            isValid: false,
        },
        description: {
            value: '',
            isValid: false,
        },
        address: {
            value: '',
            isValid: false
        },
        image: {
            value: null,
            isValid: false,
        }
    }, false);
	
	const placeSubmitHandler = async ( event ) => {
        event.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', formState.inputs.title.value);
            formData.append('description', formState.inputs.description.value);
            formData.append('address', formData.inputs.address.value);
            formData.append('creator', auth.userId);
            formData.append('image', formState.inputs.image.value);
            await sendRequest(
                "http://localhost:5000/api/places",
                "POST",
                {},
                formData
            );
            history.push('/');
        } catch (err) {}
	};

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError} />
            <form className="place-form" onSubmit={placeSubmitHandler}>
                {isLoading && <LoadingSpinner asOverlay />}
                <ImageUpload
                    id="image"
                    onInput={InputHandler}
                    center
                    errorText="Please provide an image."
                />
                <Input
                    id="title"
                    element="input"
                    type="text"
                    label="Title"
                    validators={[VALIDATOR_REQUIRE()]}
                    onInput={InputHandler}
                    errorText="Please enter a valid title."
                />
                <Input
                    id="description"
                    element="textarea"
                    label="Description"
                    validators={[VALIDATOR_MINLENGTH(5)]}
                    onInput={InputHandler}
                    errorText="Please enter a valid description (at least 5 characters)."
                />
                <Input
                    id="address"
                    element="input"
                    label="Address"
                    validators={[VALIDATOR_REQUIRE()]}
                    onInput={InputHandler}
                    errorText="Please enter a valid address."
                />
                <Button type="submit" disabled={!formState.isValid}>
                    ADD PLACE
                </Button>
            </form>
        </React.Fragment>
    );
};

export default NewPlace;
