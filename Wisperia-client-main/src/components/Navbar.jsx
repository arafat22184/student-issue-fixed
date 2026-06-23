"use client";

import { authClient } from "@/lib/auth-client";
import { Button, Dropdown, Avatar, DropdownTrigger } from "@heroui/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { BiLogOut } from "react-icons/bi";
import { CgProfile } from "react-icons/cg";
import { MdDashboard } from "react-icons/md";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const pathname = usePathname();

  const isPremium = user?.plan === "premium" || user?.isPremium;

  if (pathname.includes("dashboard")) {
    return null;
  }

  const handleSignOut = async () => {
    await authClient.signOut();
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#670D2F] backdrop-blur-md shadow-md">
      <header className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center gap-3">
            <Image
              height={32}
              width={32}
              src="/logo.webp"
              alt="logo"
              className="rounded-full"
            />
            <span className="font-bold text-xl text-white tracking-wide">
              Wisperia
            </span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center gap-8 text-sm text-pink-100 font-medium">
          <li>
            <Link className="hover:text-white transition" href="/">
              Home
            </Link>
          </li>
          <li>
            <Link
              className="hover:text-white transition"
              href="/public-lessons"
            >
              Public Lessons
            </Link>
          </li>
          {user && (
            <>
              <li>
                <Link
                  className="hover:text-white transition"
                  href="/dashboard/add-lesson"
                >
                  Add Lesson
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white transition"
                  href="/dashboard/my-lessons"
                >
                  My Lessons
                </Link>
              </li>
              
              {!isPremium ? (
                <li>
                  <Link
                    className="text-white hover:text-white transition bg-white/20 px-4 py-2 rounded-lg"
                    href="/pricing"
                  >
                    Pricing
                  </Link>
                </li>
              ) : (
                <li className="text-yellow-300 font-bold px-3 py-1 border border-yellow-300 rounded-full text-xs">
                  Premium ⭐
                </li>
              )}
            </>
          )}
        </ul>

        {/* Auth Buttons / User Avatar */}
        <div className="flex items-center gap-4">
          {!user ? (
            <div className="hidden md:flex items-center gap-4">
              <Link
                className="text-pink-100 hover:text-white transition"
                href="/signin"
              >
                Login
              </Link>
              <Link href="/signup">
                <Button className="bg-white text-[#670D2F] font-bold hover:bg-gray-100 transition">
                  Sign Up
                </Button>
              </Link>
            </div>
          ) : (
            <Dropdown>
              <DropdownTrigger>
                <Avatar
                  className="transition-transform ring-2 ring-white/30"
                  src={user?.image || ""}
                  size="md"
                />
              </DropdownTrigger>
              <Dropdown.Popover className="bg-[#670D2F] border border-white/20">
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="text-sm text-white font-bold">{user?.name}</p>
                  <p className="text-xs text-pink-200">{user?.email}</p>
                </div>
                <Dropdown.Menu className="p-2">
                  <Dropdown.Item>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 text-pink-100 hover:text-white"
                    >
                      <MdDashboard /> Dashboard
                    </Link>
                  </Dropdown.Item>
                  <Dropdown.Item>
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-2 text-pink-100 hover:text-white"
                    >
                      <CgProfile /> Profile
                    </Link>
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={handleSignOut}
                    className="text-red-300 hover:text-red-100 mt-2 border-t border-white/10 pt-2"
                  >
                    <div className="flex items-center gap-2">
                      <BiLogOut /> Logout
                    </div>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
          )}

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-white"
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
        <div className="md:hidden bg-[#5a0b27] border-t border-white/10 p-4 flex flex-col gap-4 text-pink-100">
          <Link href="/">Home</Link>
          <Link href="/public-lessons">Public Lessons</Link>
          {user && (
            <>
              <Link href="/dashboard/add-lesson">Add Lesson</Link>
              <Link href="/dashboard/my-lessons">My Lessons</Link>
              {!isPremium && <Link href="/pricing">Pricing</Link>}
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
