'use client';
import { Bars, Heart, House, Person } from "@gravity-ui/icons";
import { Drawer } from "@heroui/react";
import { BookIcon, PlusCircleIcon } from "lucide-react";
import Link from "next/link";

export default function DashboardSidebar({ user, role }) {
  const dashboardItems = {
    user: [
      { icon: House, label: "Home", link: '/dashboard' },
      { icon: PlusCircleIcon, label: "Add Lesson", link: '/dashboard/add-lesson' },
      { icon: BookIcon, label: "My Lessons", link: '/dashboard/my-lessons' },
      { icon: Heart, label: "My Favorites", link: '/dashboard/my-favorites' },
      { icon: Person, label: "Profile", link: '/dashboard/profile' },
    ],
    admin: [
      { icon: House, label: "Home", link: '/dashboard/admin' },
      { icon: PlusCircleIcon, label: "Manage Users", link: '/dashboard/admin/manage-users' },
      { icon: BookIcon, label: "Manage Lessons", link: '/dashboard/admin/manage-lessons' },
      { icon: Heart, label: "Reported Lessons", link: '/dashboard/admin/reported-lessons' },
      { icon: Person, label: "Admin Profile", link: '/dashboard/admin/profile' },
    ]
  };

  const navItems = dashboardItems[role] || dashboardItems.user;

  return (
    <div className="flex md:flex-col border-b md:border-b-0 md:border-r border-gray-100 bg-white md:w-64 p-4 md:p-6 justify-between md:justify-start">
      {/* Mobile Drawer */}
      <div className="md:hidden flex items-center justify-between w-full">
        <Link href="/" className="font-extrabold text-[#670D2F] tracking-tight text-lg">🌿 Wisperia</Link>
        <Drawer>
          <button className="flex items-center gap-2 bg-[#670D2F]/5 text-[#670D2F] font-bold text-xs px-4 py-2 rounded-xl border border-[#670D2F]/10 cursor-pointer">
            <Bars className="w-4 h-4" /> Menu
          </button>
          <Drawer.Content placement="left" className="bg-white max-w-xs">
            <Drawer.Dialog className="p-6">
               <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link key={item.label} href={item.link} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl">
                    <item.icon className="size-5" /> {item.label}
                  </Link>
                ))}
              </nav>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-full">
        <div className="mb-10 px-3">
          <Link href="/" className="font-extrabold text-[#670D2F] text-2xl">🌿 Wisperia</Link>
        </div>
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => (
            <Link key={item.label} href={item.link} className="flex items-center gap-3.5 px-4 py-3 rounded-xl hover:bg-[#670D2F]/5 text-gray-600">
              <item.icon className="size-5" /> {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="hidden md:block mt-auto border-t pt-6 px-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center font-bold">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div>
            <p className="text-xs font-bold">{user?.name || "Seeker"}</p>
            <p className="text-[10px] text-gray-400">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}