"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Upload, Briefcase, Clock, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

const navItems = [
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/history", label: "History", icon: Clock },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/90 backdrop-blur-xl">
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
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon
                className="h-5 w-5 transition-all"
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={toggle}
          className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1 text-xs font-medium text-muted-foreground transition-all hover:text-foreground"
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5" strokeWidth={1.8} />
          ) : (
            <Sun className="h-5 w-5" strokeWidth={1.8} />
          )}
          <span>Theme</span>
        </button>
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
