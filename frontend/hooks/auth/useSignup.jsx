"use client";
import { useState } from "react";
import toast from "react-hot-toast";

const serverURL = process.env.NEXT_PUBLIC_SERVER;

const useSignup = () => {
	const [loading, setLoading] = useState(false);

	const signup = async ({ email, password, confirmPassword}) => {
		const success = handleInputErrors({ email, password, confirmPassword });
		if (!success) return;
		setLoading(true);
		try {
			const res = await fetch(`${serverURL}/api/v1/signup`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password}),
                credentials: "include",
			});

			const data = await res.json();
            if(data?.success === true){
                console.log("here", data)
				localStorage.setItem("activationToken",data.activationToken)
			}

			return data;
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	return { loading, signup };
};
export default useSignup;

function handleInputErrors({ email,password, confirmPassword }) {
	if (!email || !password) {
		toast.error("Please fill in all fields");
		return false;
	}

	if (password !== confirmPassword) {
		toast.error("Passwords do not match");
		return false;
	}

	if (password.length < 8) {
		toast.error("Password must be at least 8 characters");
		return false;
	}

	return true;
}