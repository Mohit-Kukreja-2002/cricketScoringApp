"use client"
import { useState } from "react";
import toast from "react-hot-toast";

const serverURL = process.env.NEXT_PUBLIC_SERVER;


const useGetMatch = () => {
	const [loading, setLoading] = useState(false);

	const getMatch = async () => {
		setLoading(true);
		try {
			const res = await fetch(`${serverURL}/api/v1/admin/getMatch`, {
				method: "GET",
				headers: { "Content-Type": "application/json" },
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

	return { loading, getMatch };
};
export default useGetMatch;