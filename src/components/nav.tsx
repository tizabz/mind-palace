"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

const links = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="font-semibold tracking-tight">
          Mind Palace
        </Link>
        <ul className="flex items-center gap-1">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href}>
                <Button
                  size={"sm"}
                  className="transition-colors h-8 py-0.5 mx-1 cursor-pointer"
                  variant={pathname === l.href ? "default" : "ghost"}
                >
                  {l.label}
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
