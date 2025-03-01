"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { ThemeToggle } from "@/app/components/ThemeToggle";

export default function Signup() {
    const router = useRouter();
    const supabase = createClientComponentClient();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [role, setRole] = useState("customer");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            // Sign up the user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: role
                    }
                }
            });

            if (authError) {
                setMessage(authError.message);
                return;
            }

            if (authData?.user) {
                // Create profile
                const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert({
                        user_id: authData.user.id,
                        full_name: fullName,
                        role: role,
                        updated_at: new Date().toISOString(),
                        created_at: new Date().toISOString()
                    });

                if (profileError) {
                    console.error('Error creating profile:', profileError);
                    setMessage('Account created but profile setup failed. Please contact support.');
                    return;
                }

                // If user is a vendor, create vendor profile
                if (role === 'vendor') {
                    const { error: vendorError } = await supabase
                        .from('vendor_profiles')
                        .insert({
                            user_id: authData.user.id,
                            business_name: `${fullName}'s Car Wash Service`, // Default business name
                            business_description: "",
                            is_mobile: true
                        });

                    if (vendorError) {
                        console.error('Error creating vendor profile:', vendorError);
                        setMessage('Account created but vendor profile setup failed. Please contact support.');
                        return;
                    }
                }

                setMessage("Sign-up successful! Check your email to verify your account.");
                
                // Redirect based on role
                setTimeout(() => {
                    if (role === 'vendor') {
                        router.push("/vendor/dashboard");
                    } else {
                        router.push("/dashboard");
                    }
                }, 2000);
            }
        } catch (error) {
            console.error('Signup error:', error);
            setMessage('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 text-black dark:text-white">
            {/* Header with logo and tagline */}
            <header className="w-full p-6 flex justify-between items-center">
                <Link href="/" className="flex items-center">
                    <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        DubWash
                    </h1>
                </Link>
                <div className="flex items-center space-x-4">
                    <p className="hidden md:block text-gray-600 dark:text-gray-300 font-medium">
                        Find the best mobile car wash services near you
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
                            Car Washing,<br />
                            <span className="text-blue-600 dark:text-blue-400">Reimagined</span>
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                            Join DubWash today and experience the convenience of mobile car washing services that come to you.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 h-6 w-6 text-blue-500 dark:text-blue-400 mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300">Book services from trusted vendors</p>
                            </div>
                            <div className="flex items-start">
                                <div className="flex-shrink-0 h-6 w-6 text-blue-500 dark:text-blue-400 mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300">Save time with services that come to you</p>
                            </div>
                            <div className="flex items-start">
                                <div className="flex-shrink-0 h-6 w-6 text-blue-500 dark:text-blue-400 mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300">Manage all your vehicles in one place</p>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Sign up form */}
                    <div className="w-full max-w-md mx-auto">
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                            <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800 dark:text-white">Create Your Account</h2>
                            {message && (
                                <p className={`text-center text-sm mb-4 p-3 rounded ${message.includes("successful") ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400" : "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"}`}>
                                    {message}
                                </p>
                            )}

                            <form onSubmit={handleSignup} className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-black dark:text-white"
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-black dark:text-white"
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-black dark:text-white"
                                />
                                
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">I am a:</label>
                                    <div className="flex space-x-4">
                                        <label className="flex items-center text-gray-700 dark:text-gray-300">
                                            <input
                                                type="radio"
                                                name="role"
                                                value="customer"
                                                checked={role === "customer"}
                                                onChange={() => setRole("customer")}
                                                className="mr-2 text-blue-600 focus:ring-blue-500"
                                            />
                                            Customer
                                        </label>
                                        <label className="flex items-center text-gray-700 dark:text-gray-300">
                                            <input
                                                type="radio"
                                                name="role"
                                                value="vendor"
                                                checked={role === "vendor"}
                                                onChange={() => setRole("vendor")}
                                                className="mr-2 text-blue-600 focus:ring-blue-500"
                                            />
                                            Vendor
                                        </label>
                                    </div>
                                </div>
                                
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Signing up..." : "Sign Up"}
                                </button>
                            </form>

                            <p className="text-center mt-6 text-gray-600 dark:text-gray-300">
                                Already have an account? <Link href="/auth/login" className="text-blue-600 dark:text-blue-400 hover:underline">Log in</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}