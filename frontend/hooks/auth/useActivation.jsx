"use client"
import { useState } from "react";
import toast from "react-hot-toast";

const serverURL = process.env.NEXT_PUBLIC_SERVER;


const useActivation = () => {
	const [loading, setLoading] = useState(false);
	const activationToken = localStorage.getItem("activationToken");

	const activate = async ({ activation_code }) => {
		const success = handleInputErrors({ activation_code });
		if (!success) return;
		setLoading(true);
		try {
			const res = await fetch(`${serverURL}/api/v1/activate`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ activation_code, activation_token: activationToken }),
                credentials : "include"
			});

			const data = await res.json();
			if (data.success) {
				localStorage.removeItem("activationToken");
			}
            return data;
			// Return data after a 1-second delay
			// return new Promise((resolve) => {
			// 	setTimeout(() => {
			// 		resolve(data);
			// 	}, 1000);
			// });
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	return { loading, activate };
};
export default useActivation;

function handleInputErrors({ activation_code }) {
	if (!activation_code || activation_code.length < 4) {
		toast.error("Please fill in all fields");
		return false;
	}

	return true;
}