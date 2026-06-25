"use client";

import { authClient } from "@/lib/auth-client";
import { Button, Dropdown, Avatar, DropdownTrigger } from "@heroui/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";
import { BiLogOut } from "react-icons/bi";
import { CgProfile } from "react-icons/cg";
import { MdDashboard } from "react-icons/md";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const user = session?.user;
  console.log(user,"User");
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isPremium = user?.plan === "premium" || user?.isPremium;

  if (pathname.includes("dashboard")) {
    return null;
  }

  const handleSignOut = async () => {
    await authClient.signOut();
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-theme/20 bg-theme/80 backdrop-blur-lg shadow-lg transition-all duration-300">
      <header className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center gap-3">
            <Image
              height={32}
              width={32}
              src="/logo.webp"
              alt="logo"
              className="rounded-full border border-theme/20 shadow-sm"
            />
            <span className="font-extrabold text-xl text-theme tracking-wide">
              Wisperia
            </span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center gap-8 text-sm text-muted font-semibold">
          <li>
            <Link className="hover:text-theme transition duration-200" href="/">
              Home
            </Link>
          </li>
          <li>
            <Link
              className="hover:text-theme transition duration-200"
              href="/public-lessons"
            >
              Public Lessons
            </Link>
          </li>
          {user && (
            <>
              <li>
                <Link
                  className="hover:text-theme transition duration-200"
                  href="/dashboard/add-lesson"
                >
                  Add Lesson
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-theme transition duration-200"
                  href="/dashboard/my-lessons"
                >
                  My Lessons
                </Link>
              </li>

              {!isPremium ? (
                <li>
                  <Link
                    className="text-theme hover:bg-theme/25 transition duration-200 bg-theme/10 px-4 py-2 rounded-full border border-theme/20 font-bold"
                    href="/pricing"
                  >
                    Pricing
                  </Link>
                </li>
              ) : (
                <li className="text-yellow-500 dark:text-yellow-300 font-extrabold px-3 py-1 border border-yellow-500/30 dark:border-yellow-300/30 bg-yellow-500/10 rounded-full text-xs shadow-sm">
                  Premium ⭐
                </li>
              )}
            </>
          )}
        </ul>

        {/* Auth Buttons / User Avatar / Theme Switcher */}
        <div className="flex items-center gap-4">
          {/* Theme Switcher */}
          {mounted && (
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full glass-button hover:scale-105 active:scale-95 transition-all shadow-sm flex items-center justify-center cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-yellow-300 animate-[spin_10s_linear_infinite]" />
              ) : (
                <Moon className="w-5 h-5 text-[#670D2F]" />
              )}
            </button>
          )}

          {!user ? (
            <div className="hidden md:flex items-center gap-4">
              <Link
                className="text-muted hover:text-theme transition font-semibold"
                href="/signin"
              >
                Login
              </Link>
              <Link href="/signup">
                <Button className="glass-button bg-primary text-theme font-bold hover:scale-105 transition-all rounded-full shadow">
                  Sign Up
                </Button>
              </Link>
            </div>
          ) : (
            <Dropdown>
              <DropdownTrigger>
                <Avatar
                  src={
                    user?.image ||
                    "https://img.heroui.chat/image/avatar?w=400&h=400&u=3"
                  }
                  name={user?.name}
                  className="h-10 w-10 border border-theme/20 cursor-pointer"
                />
              </DropdownTrigger>
              <Dropdown.Popover className="bg-theme border border-theme/20 shadow-xl backdrop-blur-md rounded-2xl">
                <div className="px-4 py-3 border-b border-theme/15">
                  <p className="text-sm text-theme font-bold">{user?.name}</p>
                  <p className="text-xs text-muted">{user?.email}</p>
                </div>
                <Dropdown.Menu className="p-2">
                  <Dropdown.Item>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 text-muted hover:text-theme w-full"
                    >
                      <MdDashboard /> Dashboard
                    </Link>
                  </Dropdown.Item>
                  <Dropdown.Item>
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-2 text-muted hover:text-theme w-full"
                    >
                      <CgProfile /> Profile
                    </Link>
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={handleSignOut}
                    className="text-red-500 hover:text-red-400 mt-2 border-t border-theme/15 pt-2"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <BiLogOut /> Logout
                    </div>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
          )}

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-theme p-1 rounded-lg hover:bg-theme/10 transition"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  isMenuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-theme border-t border-theme/15 p-4 flex flex-col gap-4 text-muted font-semibold animate-fadeIn">
          <Link href="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link href="/public-lessons" onClick={() => setIsMenuOpen(false)}>Public Lessons</Link>
          {user && (
            <>
              <Link href="/dashboard/add-lesson" onClick={() => setIsMenuOpen(false)}>Add Lesson</Link>
              <Link href="/dashboard/my-lessons" onClick={() => setIsMenuOpen(false)}>My Lessons</Link>
              {!isPremium && <Link href="/pricing" onClick={() => setIsMenuOpen(false)}>Pricing</Link>}
            </>
          )}
          {!user && (
            <div className="flex flex-col gap-3 pt-2 border-t border-theme/10">
              <Link href="/signin" onClick={() => setIsMenuOpen(false)} className="text-center py-2 rounded-lg hover:bg-theme/10">Login</Link>
              <Link href="/signup" onClick={() => setIsMenuOpen(false)} className="text-center py-2 bg-primary text-theme rounded-lg font-bold">Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
