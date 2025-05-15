const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			token: sessionStorage.getItem("token") || null,
			privateData: null
		},
		actions: {

			// Sign up a new user
			signup: async (username, email, password, name, last_name, date_of_birth) => {
				try {
					const resp = await fetch(process.env.BACKEND_URL + "/api/signup", {
						method: "POST",
						headers: {
							"Content-Type": "application/json"
						},
						body: JSON.stringify({ username, email, password, name, last_name, date_of_birth })
					});
					if (resp.ok) {
						const data = await resp.json();
						setStore({ token: data.token, privateData: data.user });
						sessionStorage.setItem("token", data.token);
						return { success: true, data };
					} else {
						const errorData = await resp.json();
						return { success: false, error: errorData.error };
					}
				} catch (error) {
					console.log("Error signing up", error);
					return { success: false, error: "An unexpected error occurred" };
				}
			},

			// Log in an existing user
			login: async (email, password) => {
				try {
					const resp = await fetch(process.env.BACKEND_URL + "/api/login", {
						method: "POST",
						headers: {
							"Content-Type": "application/json"
						},
						body: JSON.stringify({ email, password })
					});
					if (resp.ok) {
						const data = await resp.json();
						setStore({ token: data.token, privateData: data.user });
						sessionStorage.setItem("token", data.token);
						return { success: true, data };
					} else {
						const errorData = await resp.json();
						return { success: false, error: errorData.error };
					}
				} catch (error) {
					console.log("Error logging in", error);
					return { success: false, error: "An unexpected error occurred" };
				}
			},

			// Fetch private data
			getPrivateData: async () => {
				const store = getStore();
				try {
					const resp = await fetch(process.env.BACKEND_URL + "/api/private-data", {
						method: "GET",
						headers: {
							"Authorization": `Bearer ${store.token}`
						}
					});
					if (resp.ok) {
						const data = await resp.json();
						setStore({ privateData: data["private-data"] });
						return data;
					} else {
						console.error("Error fetching private data", resp.status);
					}
				} catch (error) {
					console.log("Error fetching private data", error);
				}
			},



			//log out fuction to set the token null
			logout: () => {
                setStore({ token: null });
				sessionStorage.removeItem('token');
            },


			//updates users data when logged in
			updateUser: async (username, email, password, name, last_name, date_of_birth) => {
				const store = getStore();
				try {
					// Construir el body solo con los campos no vacíos
					const body = {};
					if (username) body.username = username;
					if (email) body.email = email;
					if (password && password.trim() !== "") body.password = password;
					if (name) body.name = name;
					if (last_name) body.last_name = last_name;
					if (date_of_birth) body.date_of_birth = date_of_birth;

					const resp = await fetch(process.env.BACKEND_URL + "/api/user", {
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${store.token}`
						},
						body: JSON.stringify(body)
					});

					if (resp.ok) {
						const data = await resp.json();
						setStore({ privateData: data.user });
						return { success: true, data };
					} else {
						const errorData = await resp.json();
						return { success: false, error: errorData.error };
					}
				} catch (error) {
					console.log("Error updating user", error);
					return { success: false, error: "An unexpected error occurred" };
				}
			},

			//option to delete user when logged in
			deleteUser: async () => {
				const store = getStore();
				try {
					const resp = await fetch(process.env.BACKEND_URL + "/api/user", {
						method: "DELETE",
						headers: {
							"Authorization": `Bearer ${store.token}`
						}
					});
					if (resp.ok) {
						return true;
					} else {
						console.error("Error deleting user", resp.status);
					}
				} catch (error) {
					console.log("Error deleting user", error);
				}
				return false;
			}
		}
	};
};

export default getState;
