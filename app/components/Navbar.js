"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/components/AuthProvider";
import { ThemeToggle } from "@/app/components/ThemeToggle";

export default function Navbar() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/auth/login");
      router.refresh();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (loading) return null;
  if (!user) return null;

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700 p-4 flex justify-between items-center">
      <h1 className="text-lg font-bold dark:text-white">Dubwash Dashboard</h1>
      <div className="flex items-center space-x-4">
        <Link href="/dashboard">
          <span className="text-black dark:text-white hover:underline cursor-pointer">Home</span>
        </Link>
        <Link href="/profile">
          <span className="text-black dark:text-white hover:underline cursor-pointer">Profile</span>
        </Link>
        <Link href="/settings">
          <span className="text-black dark:text-white hover:underline cursor-pointer">Settings</span>
        </Link>
        <ThemeToggle />
        <button
          onClick={handleLogout}
          className="border border-black dark:border-white text-black dark:text-white px-4 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
