"use client"
import { useAuthContext } from "@/context/authContext";
import useActivation from "@/hooks/auth/useActivation";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { VscWorkspaceTrusted } from "react-icons/vsc";

const Activation = ({ setDisplay }) => {
    const { loading, activate } = useActivation();

    const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
    const [verifyNumber, setVerifyNumber] = useState({ 0: "", 1: "", 2: "", 3: "", });

    const {authUser, setAuthUser} = useAuthContext();

    const verificationHandler = async () => {
        const verificationNumber = Object.values(verifyNumber).join("");
        if (verificationNumber.length !== 4) {
            return;
        }
        const data = await activate({activation_code:verificationNumber});
        console.log(data)
        if(data?.success === true){
            toast.success("Account creation successful");
            setAuthUser(true);
        }
        else if(data?.success === false) toast.error(data?.error);
    };

    const handleInputChange = (index, value) => {
        const newVerifyNumber = { ...verifyNumber, [index]: value };
        setVerifyNumber(newVerifyNumber);

        if (value === "" && index > 0) {
            inputRefs[index - 1].current?.focus();
        } else if (value.length === 1 && index < 3) {
            inputRefs[index + 1].current?.focus();
        }
    };

    return (
        <div className="w-[400px] rounded-[14px]  p-5 bg-white shadow-signup">
            <div className="text-[#20396e] text-center mb-8 text-[32px] font-[600]">Verify Your Account</div>
            <div className="flex items-center justify-center w-full mt-2">
                <div className="w-[80px] text-white h-[80px] rounded-full bg-gradient-to-r from-[#26d0ce] to-[#1a2980] flex items-center justify-center">
                    <VscWorkspaceTrusted size={40} />
                </div>
            </div>
            <br />
            <div className="flex items-center justify-around m-auto">
                {Object.keys(verifyNumber).map((key, index) => (
                    <input
                        type="number"
                        key={key}
                        ref={inputRefs[index]}
                        className={`w-[65px] h-[65px] bg-transparent border-[3px] rounded-[10px] flex items-center text-black justify-center text-[18px] font-Poppins outline-none text-center border-[#0000004a]"}`}
                        placeholder=""
                        maxLength={1}
                        value={verifyNumber[key]}
                        onChange={(e) => handleInputChange(index, e.target.value)}
                    />
                ))}
            </div>
            <br />
            <div className="flex justify-center w-full">
                <button 
                disabled={loading}
                onClick={()=>verificationHandler()}
                    className="text-white mx-2 hover:from-[#ab293f] hover:to-[#ab293f] bg-gradient-to-r from-[#26d0ce] to-[#1a2980] font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center"
                >
                    {loading ? <span className='loading loading-spinner'></span> : "Verify OTP"}
                    {/* Verify */}
                </button>
            </div>
            <h5 className="text-center pt-4 font-Poppins text-[14px] text-black">
                Go back to sign in?{" "}
                <span
                    onClick={() => setDisplay("Login")}
                    className="text-blue-600 font-bold hover:underline cursor-pointer"
                >
                    Sign In
                </span>
            </h5>
        </div>
    );
};

export default Activation;
