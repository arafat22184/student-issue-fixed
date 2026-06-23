"use server";

const baseUrl = process.env.SERVER_URL;

export const subscriptions = async (data) => {
  if (!data || !data.userId || !data.sessionId) {
    throw new Error("Invalid subscription data provided.");
  }

  try {
    const res = await fetch(`${baseUrl}/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Subscription API Error:", errorText);
      throw new Error(`Failed to update subscription: ${res.statusText}`);
    }

    const resData = await res.json();
    return resData;
  } catch (error) {
    console.error("Server Action Error (subscriptions):", error);
    return { success: false, message: error.message };
  }
};