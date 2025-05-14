const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			message: null,
			token: sessionStorage.getItem("token") || null,
			privateData: null
		},
		actions: {
			// Use getActions to call a function within a fuction
			exampleFunction: () => {
				getActions().changeColor(0, "green");
			},

			getMessage: async () => {
				try{
					// fetching data from the backend
					const resp = await fetch(process.env.BACKEND_URL + "/api/hello")
					const data = await resp.json()
					setStore({ message: data.message })
					// don't forget to return something, that is how the async resolves
					return data;
				}catch(error){
					console.log("Error loading message from backend", error)
				}
			},


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
					const resp = await fetch(process.env.BACKEND_URL + "/api/user", {
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${store.token}`
						},
						body: JSON.stringify({ username, email, password, name, last_name, date_of_birth })
					});
			
					if (resp.ok) {
						const data = await resp.json();
						console.log("private-data", store.privateData)
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
