import AddLesson from "@/components/dashboard/AddLesson";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";


export default async function AddLessonPage() {
    
    const session = await auth.api.getSession({
        headers: await headers()
    });
    
    const tokenResponse = await auth.api.getToken({
        headers: await headers()
    });

    const jwtToken = tokenResponse?.token;
    const user = session?.user;
    
    const isPremiumUser = user?.plan === "premium" || user?.isPremium;

    return (
        <main>
            <AddLesson jwtToken={jwtToken} isPremiumUser={isPremiumUser} />
        </main>
    );
}