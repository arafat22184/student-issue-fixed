"use client";
import { authClient } from "@/lib/auth-client";
import { Button, Form, Input, Label, TextField } from "@heroui/react";
import React, { useState } from "react";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const SignInPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/", 
      });

      if (error) {
        toast.error(error.message || "Invalid credentials!");
      } else {
        toast.success("Welcome back to Wisperia!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch (error) {
      toast.error("Google login failed!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#fcf8f9]">
      <div className="w-full max-w-lg bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(103,13,47,0.1)] border border-gray-100">
        
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-extrabold text-[#670D2F]">Welcome Back</h2>
          <p className="text-gray-500 mt-2">Log in to continue your wisdom journey</p>
        </div>

        <Form onSubmit={onSubmit} className="space-y-5">
          <TextField isRequired name="email" type="email" label="Email Address" labelPlacement="outside">
            <Input placeholder="john@example.com" className="mt-2" />
          </TextField>

          <TextField isRequired name="password" type="password" label="Password" labelPlacement="outside">
            <Input placeholder="********" className="mt-2" />
          </TextField>

          <Button 
            type="submit" 
            isLoading={loading}
            className="w-full bg-[#670D2F] text-white font-bold py-6 rounded-xl hover:bg-[#5a0b27] transition"
          >
            Sign In
          </Button>
        </Form>

        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-gray-400 text-sm">OR</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <Button 
          onClick={handleGoogleLogin}
          className="w-full bg-white border border-gray-200 text-gray-700 font-medium py-6 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2"
        >
          <FcGoogle className="w-5 h-5" /> Continue with Google
        </Button>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[#670D2F] font-bold underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignInPage;