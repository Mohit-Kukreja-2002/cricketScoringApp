"use client"
import useSignup from '@/hooks/auth/useSignup';
import { useState } from 'react'
import toast from 'react-hot-toast';

const SignUp = ({setDisplay}) => {
    const [signUpInputs, setSignUpInputs] = useState({
        email: "",
        password: "",
        confirmPassword: "",
    });

    const {loading, signup} = useSignup();

    async function handleSignUpSubmit(e){
        e.preventDefault();
        const data = await signup(signUpInputs);
        console.log(data)
        if (data?.success) {
            toast.success(data.message);
            setDisplay("Activation");
        }
        else if(data?.success === false) toast.error(data.error);
    };

    return (
        <form onSubmit={handleSignUpSubmit} className="w-[400px] rounded-[14px]  p-5 bg-white shadow-signup">
            <div className="text-[#20396e] text-center mb-8 text-[32px] font-[600]">REGISTER TODAY</div>
            <div className="relative z-0 w-full mx-2 mb-5 group">
                <input
                    value={signUpInputs.email}
                    onChange={(e) => { setSignUpInputs({ ...signUpInputs, email: e.target.value }) }}
                    type="email" name="floating_email" id="floating_email" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                <label htmlFor="floating_email" className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Email address</label>
            </div>
            <div className="relative z-0 w-full mx-2 mb-5 group">
                <input
                    value={signUpInputs.password}
                    onChange={(e) => { setSignUpInputs({ ...signUpInputs, password: e.target.value }) }}
                    type="password" name="floating_password" id="floating_password" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none  focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                <label htmlFor="floating_password" className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Password</label>
            </div>
            <div className="relative z-0 w-full mx-2 mb-8 group">
                <input
                    value={signUpInputs.confirmPassword}
                    onChange={(e) => { setSignUpInputs({ ...signUpInputs, confirmPassword: e.target.value }) }}
                    type="password" name="repeat_password" id="floating_repeat_password" className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                <label htmlFor="floating_repeat_password" className="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Confirm password</label>
            </div>

            <button 
            disabled={loading} 
            type="submit" className="text-white mx-2 hover:from-[#ab293f] hover:to-[#ab293f] bg-gradient-to-r from-[#26d0ce] to-[#1a2980] font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center">
                {loading ? "Processing..." : "Proceed"}
            </button>

            <div className="mt-4 text-center text-sm text-black">
                Already have an account?{" "}
                <span
                    onClick={() => setDisplay("Login")}
                    className="text-blue-600 font-bold hover:underline cursor-pointer"
                >
                    Login.
                </span>
            </div>
        </form>

    )
}

export default SignUp