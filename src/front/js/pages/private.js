import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";

export const Private = () => {
    const { store, actions } = useContext(Context);
    const [editing, setEditing] = useState(false);
    const [username, setUsername] = useState(store.privateData.username);
    const [email, setEmail] = useState(store.privateData.email);
    const [password, setPassword] = useState("");
    const [name, setName] = useState(store.privateData.name || "");
    const [lastName, setLastName] = useState(store.privateData.last_name || "");
    const [dateOfBirth, setDateOfBirth] = useState(store.privateData.date_of_birth || "");
    const navigate = useNavigate();

        const handleUpdate = async () => {
        const response = await actions.updateUser(
            username,
            email,
            password,
            name,
            lastName,
            dateOfBirth
        );
        if (response.success) {
            setEditing(false);
            alert("Profile updated successfully!");
            navigate("/");
        } else {
            alert("Update failed: " + response.error);
        }
    };

    const handleDelete = async () => {
        const response = await actions.deleteUser();
        if (response) {
            alert("User deleted successfully!");
            actions.logout();
            navigate("/");
        } else {
            alert("Delete failed!");
        }
    };

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            navigate("/login");
        } else {
            actions.getPrivateData().catch((error) => {
                console.error("Failed to get private data", error);
                navigate("/login");
            });
        }
    }, []);

        return (
        <div className="container mt-5">
            {store.privateData ? (
                <div>
                    <div className="card">
                        <div className="card-body">
                            {editing ? (
                                <>
                                    <input
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="Username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                    <input
                                        type="email"
                                        className="form-control mb-2"
                                        placeholder="Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        className="form-control mb-2"
                                        placeholder="Last Name"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                    />
                                    <input
                                        type="date"
                                        className="form-control mb-2"
                                        placeholder="Date of Birth"
                                        value={dateOfBirth}
                                        onChange={(e) => setDateOfBirth(e.target.value)}
                                    />
                                    <input
                                        type="password"
                                        className="form-control mb-2"
                                        placeholder="New Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button className="btn btn-primary" onClick={handleUpdate}>
                                        Save Changes
                                    </button>
                                    <button
                                        className="btn btn-secondary ms-2"
                                        onClick={() => setEditing(false)}
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <>
                                    <h2 className="card-title">Private Data</h2>
                                    <p className="card-text">username: {store.privateData.username}</p>
                                    <p className="card-text">email: {store.privateData.email}</p>
                                    <p className="card-text">Name: {store.privateData.name}</p>
                                    <p className="card-text">Last Name: {store.privateData.last_name}</p>
                                    <p className="card-text">Date of Birth: {store.privateData.date_of_birth}</p>
                                    <p className="card-text">id: {store.privateData.id}</p>
                                    <button
                                        className="btn btn-warning"
                                        onClick={() => setEditing(true)}
                                    >
                                        Edit
                                    </button>
                                    <button className="btn btn-danger ms-2" onClick={handleDelete}>
                                        Delete Account
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};
