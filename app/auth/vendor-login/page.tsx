'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ThemeToggle } from "@/app/components/ui/ThemeToggle";
import Logo from '@/app/components/ui/Logo';

interface LoginState {
    email: string;
    password: string;
    loading: boolean;
    message: string;
}

export default function VendorLogin() {
    const router = useRouter();
    const supabase = createClient();
    const [state, setState] = useState<LoginState>({
        email: "",
        password: "",
        loading: false,
        message: ""
    });

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setState(prev => ({ ...prev, loading: true, message: "" }));

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: state.email,
                password: state.password
            });

            if (error) {
                setState(prev => ({ ...prev, message: error.message }));
                return;
            }

            if (data?.user) {
                // Get the user's profile
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', data.user.id)
                    .single();

                if (profileError) {
                    setState(prev => ({ ...prev, message: "Error fetching profile" }));
                    return;
                }

                // Check if user is a vendor
                if (profileData.role !== 'vendor') {
                    setState(prev => ({ ...prev, message: "This login is for vendors only. Please use the customer login if you're a customer." }));
                    await supabase.auth.signOut();
                    return;
                }

                setState(prev => ({ ...prev, message: "Login successful! Redirecting..." }));
                
                // Redirect to vendor dashboard
                setTimeout(() => {
                    router.push("/vendor/dashboard");
                }, 2000);
            }
        } catch (error) {
            setState(prev => ({ ...prev, message: 'An unexpected error occurred' }));
            console.error('Login error:', error);
        } finally {
            setState(prev => ({ ...prev, loading: false }));
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 text-black dark:text-white">
            {/* Header with logo and tagline */}
            <header className="w-full p-6 flex justify-between items-center">
                <Link href="/" className="flex items-center">
                    <Logo className="h-16 w-16" />
                </Link>
                <div className="flex items-center space-x-4">
                    <p className="hidden md:block text-gray-600 dark:text-gray-300 font-medium">
                        Join our network of trusted car wash vendors
                    </p>
                    <ThemeToggle />
                </div>
            </header>

            {/* Main content */}
            <div className="flex-1 flex items-center justify-center px-4">
                <div className="grid md:grid-cols-2 gap-8 max-w-6xl w-full">
                    {/* Left side - Value proposition */}
                    <div className="hidden md:flex flex-col justify-center">
                        <h2 className="text-4xl font-bold mb-6 text-gray-800 dark:text-white">
                            Welcome Back to<br />
                            <span className="text-blue-600 dark:text-blue-400">DubWash</span>
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                            Log in to access your vendor dashboard and manage your business.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 h-6 w-6 text-blue-500 dark:text-blue-400 mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300">Manage your bookings and schedule</p>
                            </div>
                            <div className="flex items-start">
                                <div className="flex-shrink-0 h-6 w-6 text-blue-500 dark:text-blue-400 mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300">Update your services and pricing</p>
                            </div>
                            <div className="flex items-start">
                                <div className="flex-shrink-0 h-6 w-6 text-blue-500 dark:text-blue-400 mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300">Track your earnings and performance</p>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Login form */}
                    <div className="w-full max-w-md mx-auto">
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                            <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800 dark:text-white">Vendor Login</h2>
                            {state.message && (
                                <p className={`text-center text-sm mb-4 p-3 rounded ${
                                    state.message.includes("successful") ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400" : "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                                }`}>
                                    {state.message}
                                </p>
                            )}

                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={state.email}
                                        onChange={(e) => setState(prev => ({ ...prev, email: e.target.value }))}
                                        required
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-black dark:text-white"
                                        placeholder="Enter your business email"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        value={state.password}
                                        onChange={(e) => setState(prev => ({ ...prev, password: e.target.value }))}
                                        required
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-black dark:text-white"
                                        placeholder="Enter your password"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={state.loading}
                                    className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {state.loading ? "Logging in..." : "Log In"}
                                </button>
                            </form>

                            <div className="mt-6 text-center space-y-2">
                                <p className="text-gray-600 dark:text-gray-300">
                                    Don&apos;t have an account?{' '}
                                    <Link href="/auth/vendor-signup" className="text-blue-600 dark:text-blue-400 hover:underline">
                                        Sign up as vendor
                                    </Link>
                                </p>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Looking to get your car washed?{' '}
                                    <Link href="/auth/customer-login" className="text-blue-600 dark:text-blue-400 hover:underline">
                                        Log in as customer
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 