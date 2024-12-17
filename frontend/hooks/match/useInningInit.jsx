"use client"
import { useState } from "react";
import toast from "react-hot-toast";

const serverURL = process.env.NEXT_PUBLIC_SERVER;


const useInningsInit = () => {
	const [loading, setLoading] = useState(false);

	const inningsInit = async (inningsData) => {
		setLoading(true);
		try {
			const res = await fetch(`${serverURL}/api/v1/admin/inningsInit`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(inningsData),
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

	return { loading, inningsInit };
};
export default useInningsInit;