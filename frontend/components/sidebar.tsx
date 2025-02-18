"use client";

import {
  Home,
  Thermometer,
  Sun,
  Droplet,
  Leaf,
  AlertTriangle,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const navItems = [
  { icon: Home, label: "Dashboard", href: "/" },
  { icon: Thermometer, label: "Temperature", href: "/temperature" },
  { icon: Sun, label: "Lighting", href: "/lighting" },
  { icon: Droplet, label: "Irrigation", href: "/irrigation" },
  { icon: Leaf, label: "Crops", href: "/crops" },
  { icon: AlertTriangle, label: "Errors", href: "/errors" },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-20 bg-[#4a6741] text-white p-2 rounded-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu />
      </button>
      <aside
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:static top-0 left-0 z-10 w-64 h-full bg-[#4a6741] text-white p-4 transition-transform duration-300 ease-in-out`}
      >
        <nav className="md:mt-8 mt-16">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center p-2 rounded hover:bg-[#3a5331] transition-colors"
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
