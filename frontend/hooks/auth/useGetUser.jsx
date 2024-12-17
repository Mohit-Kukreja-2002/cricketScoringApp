const serverURL = process.env.NEXT_PUBLIC_SERVER;

const useGetUser = () => {
	const getUser = async () => {
		try {
			const res = await fetch(`${serverURL}/api/v1/me`, {
				method: "GET",
				headers: { "Content-Type": "application/json" },
				credentials: "include"
			});

			const data = await res.json();
			return data;

		} catch (error) {
			console.log(error);
		}
	};

	return { getUser };
};
export default useGetUser;