"use client";
import React, { useEffect, useState } from "react";
import { authClient, getToken } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Trash2, UserPlus, ShieldCheck, Shield, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { confirmToast } from "@/lib/confirmToast";

export default function ManageUsersPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/admin/users`, {
        headers: { authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data || []);
      }
    } catch (err) {
      toast.error("Failed to load users list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isPending) {
      if (!session?.user || session.user.role !== "admin") {
        router.push("/dashboard");
      } else {
        fetchUsers();
      }
    }
  }, [session, isPending, router]);

  const updateRole = async (userId, currentRole, userName) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    const isPromoting = newRole === "admin";

    const confirmed = await confirmToast({
      title: isPromoting ? "Promote to Admin?" : "Revoke Admin Access?",
      description: isPromoting
        ? `${userName} will gain full admin privileges.`
        : `${userName} will be downgraded to a regular user.`,
      confirmLabel: isPromoting ? "Yes, Promote" : "Yes, Revoke",
      confirmStyle: isPromoting ? "bg-[#670D2F]" : "bg-orange-500",
      icon: isPromoting
        ? <ShieldCheck size={18} className="text-[#670D2F]" />
        : <Shield size={18} className="text-orange-500" />,
    });
    if (!confirmed) return;

    const toastId = toast.loading("Updating role...");
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/admin/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: newRole })
      });

      if (res.ok) {
        toast.success(`${userName} is now ${newRole}`, { id: toastId });
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
      } else {
        throw new Error();
      }
    } catch {
      toast.error("Failed to update role", { id: toastId });
    }
  };

  const deleteUser = async (userId, userName) => {
    const confirmed = await confirmToast({
      title: "Delete User Permanently?",
      description: `This will remove ${userName} and all their lessons. This cannot be undone.`,
      confirmLabel: "Yes, Delete",
      confirmStyle: "bg-red-600",
      icon: <AlertTriangle size={18} className="text-red-500" />,
    });
    if (!confirmed) return;

    const toastId = toast.loading("Deleting user...");
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/admin/users/${userId}`, {
        method: "DELETE",
        headers: { authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        toast.success(`${userName} has been removed`, { id: toastId });
        setUsers(prev => prev.filter(u => u._id !== userId));
      } else {
        throw new Error();
      }
    } catch {
      toast.error("Failed to delete user", { id: toastId });
    }
  };

  if (isPending || loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-[#670D2F] dark:border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold text-[#670D2F] dark:text-white">Manage Users</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Review accounts, roles, and activity.</p>
      </header>

      <div className="card-theme rounded-[2rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 text-xs uppercase font-bold">
              <tr className="border-b border-gray-100 dark:border-white/10">
                <th className="p-5">User</th>
                <th className="p-5">Email</th>
                <th className="p-5 text-center">Lessons</th>
                <th className="p-5 text-center">Plan</th>
                <th className="p-5 text-center">Role</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/10">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="p-5 flex items-center gap-3">
                    <img src={u.image || "/default-avatar.png"} className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-white/10" />
                    <span className="font-bold text-sm text-theme">{u.name}</span>
                  </td>
                  <td className="p-5 text-sm text-gray-600 dark:text-gray-300">{u.email}</td>
                  <td className="p-5 text-center text-sm font-bold text-theme">{u.lessonsCount || 0}</td>
                  <td className="p-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                      u.isPremium 
                        ? "bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200/50 dark:border-yellow-500/20" 
                        : "bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 border-transparent"
                    }`}>
                      {u.isPremium ? "PREMIUM ⭐" : "FREE"}
                    </span>
                  </td>
                  <td className="p-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                      u.role === "admin" 
                        ? "bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200/50 dark:border-red-500/20" 
                        : "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200/50 dark:border-blue-500/20"
                    }`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-5 text-right whitespace-nowrap">
                    <div className="flex justify-end items-center gap-2">
                      <button
                        onClick={() => updateRole(u._id, u.role, u.name)}
                        title={u.role === "admin" ? "Revoke admin" : "Make admin"}
                        className="p-2 text-gray-400 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
                      >
                        <UserPlus size={16} />
                      </button>
                      <button
                        onClick={() => deleteUser(u._id, u.name)}
                        disabled={session.user.id === u._id}
                        title="Delete user"
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 rounded-lg disabled:opacity-30 cursor-pointer transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}