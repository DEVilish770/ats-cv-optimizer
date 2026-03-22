"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Upload, Briefcase, Clock } from "lucide-react";

const navItems = [
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/history", label: "History", icon: Clock },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.06] bg-black/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                isActive
                  ? "text-[#c9a55c]"
                  : "text-[#4a4a5e] hover:text-[#7a7a92]"
              }`}
            >
              <item.icon
                className={`h-5 w-5 transition-all ${isActive ? "text-[#c9a55c]" : ""}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
