"use client"
import { useState } from "react";
import toast from "react-hot-toast";

const serverURL = process.env.NEXT_PUBLIC_SERVER;


const useUpdateScore = () => {
	const [loading, setLoading] = useState(false);

	const updateScore = async (updateData) => {
		setLoading(true);
		try {
			const res = await fetch(`${serverURL}/api/v1/admin/updateScore`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(updateData),
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

	return { loading, updateScore };
};
export default useUpdateScore;