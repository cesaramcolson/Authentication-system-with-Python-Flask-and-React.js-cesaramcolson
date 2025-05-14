import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Context } from "../store/appContext";


export const Navbar = () => {
	const { store, actions } = useContext(Context);

	const handleLogout = () => {
        actions.logout();
        window.location.href = "/";
    };


	return (
		<nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container">
                <div className="d-flex justify-content-between w-100">
                    <Link className="navbar-brand" to="/">Home</Link>
                    <div className="d-flex">
                        <ul className="navbar-nav">
                            {store.token ? (
                                <>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/private">Profile</Link>
                                    </li>
                                    <li className="nav-item">
                                        <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/login">Login</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/signup">Signup</Link>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    );
};

