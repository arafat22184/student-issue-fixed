"use server";
import { authClient } from "../auth-client";

const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";

const getAuthHeader = async (optionalToken) => {
  if (optionalToken) {
    return { Authorization: `Bearer ${optionalToken}` };
  }
  const { data: sessionData } = await authClient.token(); 
  const token = sessionData?.token;
  
  if (!token) throw new Error("Unauthorized: No access token found.");
  return { Authorization: `Bearer ${token}` };
};

export const addLessons = async (lesson, jwtToken) => {
  try {
    const authHeader = await getAuthHeader(jwtToken);

    const res = await fetch(`${BACKEND_URL}/user/add-lesson`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeader,
      },
      body: JSON.stringify(lesson),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || data?.message || "Failed to add lesson");
    }

    return data;
  } catch (error) {
    console.error("Add Lesson Action Error:", error.message);
    throw error;
  }
};