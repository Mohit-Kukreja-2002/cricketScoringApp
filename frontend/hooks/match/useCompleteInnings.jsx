"use client"
import { useState } from "react";
import toast from "react-hot-toast";

const serverURL = process.env.NEXT_PUBLIC_SERVER;


const useCompleteInnings = () => {
	const [loading, setLoading] = useState(false);

	const completeInning = async (matchDetails) => {
		setLoading(true);
		try {
			const res = await fetch(`${serverURL}/api/v1/admin/completeInning`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(matchDetails),
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

	return { loading, completeInning };
};
export default useCompleteInnings;