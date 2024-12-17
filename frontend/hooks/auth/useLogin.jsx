"use client";
import { useState } from "react";
import toast from "react-hot-toast";

const serverURL = process.env.NEXT_PUBLIC_SERVER;

const useLogin = () => {
    const [loading, setLoading] = useState(false);

	const login = async ({ email, password }) => {
		const success = handleInputErrors({ email, password });
		if (!success) return;
		setLoading(true);
		try {
			const res = await fetch(`${serverURL}/api/v1/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
				credentials: "include"
			});

			const data = await res.json();
            return data;
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	return { loading, login };
};
export default useLogin;

function handleInputErrors({ email,password }) {
	if (!email || !password) {
		toast.error("Please fill in all fields");
		return false;
	}

	return true;
}