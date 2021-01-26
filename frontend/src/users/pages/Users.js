import React, { useEffect, useState, useCallback } from "react";

import UsersList from "../components/UsersList";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import { useHttpClient } from '../../shared/hooks/http-hook';

const Users = () => {
    const [loadedUsers, setLoadedUsers] = useState();
    const { error, isLoading, sendRequest, clearError } = useHttpClient();

    useEffect( useCallback(() => {
        const fetchUsers = async () => {
            try {
                const responseData = await sendRequest("http://localhost:5000/api/users");

                setLoadedUsers(responseData.users);
            } catch (err) {}
        };
        fetchUsers();
    }, []), [sendRequest]);

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError} />
            {isLoading && (
                <div className="center">
                    <LoadingSpinner asOverlay />
                </div>
            )}
            {!isLoading && loadedUsers && <UsersList items={loadedUsers} />}
        </React.Fragment>
    );
};

export default Users;
