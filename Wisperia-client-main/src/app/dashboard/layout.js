
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export default async function DashboardLayout({ children }) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  const user = session?.user;
  const role = user?.role || 'user';

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-theme text-theme transition-all duration-300">
      
      <DashboardSidebar user={user} role={role} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
      
    </div>
  );
}