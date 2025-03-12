"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/components/AuthProvider";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { NavbarProps, NavItem } from '@/types/components';

export function Navbar({ items = [] }: NavbarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              DubWash
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/vendor-search"
              className={`transition-colors hover:text-foreground/80 ${
                pathname === '/vendor-search' ? 'text-foreground' : 'text-foreground/60'
              }`}
            >
              Find Services
            </Link>
            {items.map((item: NavItem) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors hover:text-foreground/80 ${
                  pathname === item.href ? 'text-foreground' : 'text-foreground/60'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center">
            {user ? (
              <>
                <Link
                  href="/customer-dashboard"
                  className="mr-6 text-sm font-medium text-foreground/60 transition-colors hover:text-foreground/80"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-sm font-medium text-foreground/60 transition-colors hover:text-foreground/80"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="text-sm font-medium text-foreground/60 transition-colors hover:text-foreground/80"
              >
                Sign In
              </Link>
            )}
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
