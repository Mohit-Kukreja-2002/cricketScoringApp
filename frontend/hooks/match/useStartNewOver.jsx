"use client"
import { useState } from "react";
import toast from "react-hot-toast";

const serverURL = process.env.NEXT_PUBLIC_SERVER;


const useStartNewOver = () => {
	const [loading, setLoading] = useState(false);

	const startNewOver = async (details) => {
		setLoading(true);
		try {
			const res = await fetch(`${serverURL}/api/v1/admin/startNewOver`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(details),
                credentials : "include"
			});

			const data = await res.json();
            return data;

		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	return { loading, startNewOver };
};
export default useStartNewOver;