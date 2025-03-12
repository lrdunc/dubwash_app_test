"use client";

import { useState } from "react";
import { createClient } from '@/lib/supabase/client';
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { ThemeToggle } from "@/app/components/ui/ThemeToggle";
import Logo from '@/app/components/ui/Logo';

interface CustomerSignupFormData {
    email: string;
    password: string;
    fullName: string;
    phoneNumber: string;
    washAddress: string;
}

export default function CustomerSignup() {
    const router = useRouter();
    const supabase = createClient();
    const [formData, setFormData] = useState<CustomerSignupFormData>({
        email: '',
        password: '',
        fullName: '',
        phoneNumber: '',
        washAddress: '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            // Sign up with Supabase Auth
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
            });

            if (error) throw error;

            if (data.user) {
                // Create customer profile
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert([
                        {
                            id: data.user.id,
                            role: 'customer',
                            full_name: formData.fullName,
                            phone_number: formData.phoneNumber,
                            address: formData.washAddress,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        },
                    ]);

                if (profileError) throw profileError;

                setMessage("Sign-up successful! Check your email to verify your account.");
                
                // Redirect to customer dashboard after a delay
                setTimeout(() => {
                    router.push("/customer-dashboard");
                }, 2000);
            }
        } catch (error) {
            console.error('Signup error:', error);
            setMessage(error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
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
                            <span className="text-blue-600 dark:text-blue-400">Made Easy</span>
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
                            <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800 dark:text-white">Create Customer Account</h2>
                            {message && (
                                <p className={`text-center text-sm mb-4 p-3 rounded ${message.includes("successful") ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400" : "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"}`}>
                                    {message}
                                </p>
                            )}

                            <form onSubmit={handleSignup} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-black dark:text-white"
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-black dark:text-white"
                                        placeholder="Enter your email"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                        minLength={6}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-black dark:text-white"
                                        placeholder="Create a password (min. 6 characters)"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-black dark:text-white"
                                        placeholder="Enter your phone number"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Wash Address
                                    </label>
                                    <textarea
                                        name="washAddress"
                                        value={formData.washAddress}
                                        onChange={handleInputChange}
                                        required
                                        rows={3}
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-black dark:text-white"
                                        placeholder="Enter the address where you'd like your car to be washed"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Creating Account..." : "Create Account"}
                                </button>
                            </form>

                            <div className="mt-6 text-center space-y-2">
                                <p className="text-gray-600 dark:text-gray-300">
                                    Already have an account? <Link href="/auth/login" className="text-blue-600 dark:text-blue-400 hover:underline">Log in</Link>
                                </p>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Are you a vendor? <Link href="/auth/vendor-signup" className="text-blue-600 dark:text-blue-400 hover:underline">Sign up as vendor</Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 