"use client";
import AdminPanel from "@/components/AdminPanel";
import Activation from "@/components/auth/Activation";
import Login from "@/components/auth/Login";
import SignUp from "@/components/auth/SignUp";
import ViewerPanel from "@/components/ViewerPanel";
import { useAuthContext } from "@/context/authContext";
import useGetUser from "@/hooks/auth/useGetUser";
import { useEffect, useState } from "react";

export default function Home() {
  const [display, setDisplay] = useState("Login");
  const { getUser } = useGetUser();

  const [role, setRole] = useState("");

  const { authUser, setAuthUser } = useAuthContext();
  useEffect(() => {
    async function getStatus() {
      const data = await getUser();
      if (data?.success === true) {
        setRole(data.role);
        setAuthUser(true);
      } else {
        setAuthUser(false);
        setRole("");
      }
    }
    getStatus();
  }, [authUser, getUser, setAuthUser])

  return (
    <>
      {
        role === "admin" && <div className="h-full w-full">
          <AdminPanel />
        </div>
      }
      {
        role === "viewer" &&
        <div className="flex justify-center items-center h-screen">
          <ViewerPanel />
        </div>
      }
      {
        !authUser && <div className="bg-home-bg bg-no-repeat h-screen w-screen bg-cover flex justify-center items-center">
          {
            display === "Login" && <Login setDisplay={setDisplay} />
          }
          {
            display === "Signup" && <SignUp setDisplay={setDisplay} />
          }
          {
            display === "Activation" && <Activation setDisplay={setDisplay} />
          }

        </div>
      }
    </>
  );
}
