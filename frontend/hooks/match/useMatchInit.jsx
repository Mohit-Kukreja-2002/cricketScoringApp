"use client"
import { useState } from "react";
import toast from "react-hot-toast";

const serverURL = process.env.NEXT_PUBLIC_SERVER;


const useMatchInit = () => {
	const [loading, setLoading] = useState(false);

	const matchInit = async (matchDetails) => {
		setLoading(true);
		try {
			const res = await fetch(`${serverURL}/api/v1/admin/matchInit`, {
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

	return { loading, matchInit };
};
export default useMatchInit;