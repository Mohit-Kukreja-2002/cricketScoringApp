"use client"
import { useState } from "react";
import toast from "react-hot-toast";

const serverURL = process.env.NEXT_PUBLIC_SERVER;


const useAddNewBatsman = () => {
	const [loading, setLoading] = useState(false);

	const addNewBatsman = async (batsmanData) => {
		setLoading(true);
		try {
			const res = await fetch(`${serverURL}/api/v1/admin/addNewBatsman`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(batsmanData),
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

	return { loading, addNewBatsman };
};
export default useAddNewBatsman;