'use client';
import { Bars, Heart, House, Person } from "@gravity-ui/icons";
import { Drawer } from "@heroui/react";
import { BookIcon, PlusCircleIcon, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import React, { useState, useEffect } from "react";
import Image from "next/image";

export default function DashboardSidebar({ user, role }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

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
    <div className="flex md:flex-col border-b md:border-b-0 md:border-r border-theme/15 bg-theme/50 backdrop-blur-md md:w-64 p-4 md:p-6 justify-between md:justify-start transition-all duration-300">
      {/* Mobile Drawer */}
      <div className="md:hidden flex items-center justify-between w-full">
        <Link href="/" className="font-extrabold text-theme tracking-tight text-lg flex items-center">
          <Image
            height={80}
            width={80}
            src="/favicon.png"
            alt="logo"
            className="overflow-hidden"
          /> Wisperia</Link>
        <div className="flex items-center gap-3">
          {mounted && (
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full glass-button hover:scale-105 active:scale-95 transition-all shadow-sm flex items-center justify-center cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-yellow-300" />
              ) : (
                <Moon className="w-4 h-4 text-[#670D2F]" />
              )}
            </button>
          )}
          <Drawer>
            <button className="flex items-center gap-2 bg-theme/10 text-theme font-bold text-xs px-4 py-2 rounded-xl border border-theme/15 cursor-pointer">
              <Bars className="w-4 h-4" /> Menu
            </button>
            <Drawer.Content placement="left" className="bg-theme border border-theme/20 max-w-xs text-theme">
              <Drawer.Dialog className="p-6">
                <nav className="flex flex-col gap-2">
                  {navItems.map((item) => (
                    <Link key={item.label} href={item.link} className="flex items-center gap-3 p-3 hover:bg-theme/10 rounded-xl text-theme font-semibold">
                      <item.icon className="size-5" /> {item.label}
                    </Link>
                  ))}
                </nav>
              </Drawer.Dialog>
            </Drawer.Content>
          </Drawer>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-full">
        <div className="mb-10 px-3">
          <Link href="/" className="font-extrabold text-theme text-2xl flex items-center gap-2"><Image
            height={100}
            width={100}
            src="/favicon.png"
            alt="logo"
            className="overflow-hidden"
          /> Wisperia</Link>
        </div>
        <nav className="flex flex-col gap-1.5 font-semibold">
          {navItems.map((item) => (
            <Link key={item.label} href={item.link} className="flex items-center gap-3.5 px-4 py-3 rounded-xl hover:bg-theme/10 text-muted hover:text-theme transition duration-200">
              <item.icon className="size-5" /> {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="hidden md:block mt-auto border-t border-theme/15 pt-6 px-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Image width={40}
              height={40}
              src={
                user?.image ||
                "https://img.heroui.chat/image/avatar?w=400&h=400&u=3"
              }
              alt={user?.name}
              className="h-9 w-9 border border-theme/20 cursor-pointer rounded-full" />
            <div>
              <p className="text-xs font-bold text-theme">{user?.name || "Seeker"}</p>
              <p className="text-[10px] text-muted">{user?.email}</p>
            </div>
          </div>

          {/* Theme switcher for Desktop sidebar */}
          {mounted && (
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full glass-button hover:scale-105 active:scale-95 transition-all shadow-sm flex items-center justify-center cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-yellow-300" />
              ) : (
                <Moon className="w-4 h-4 text-[#670D2F]" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}