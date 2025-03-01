'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user: userData }, error } = await supabase.auth.getUser();
      setUser(userData);
      setLoading(false);
    };

    checkUser();
  }, [supabase]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      router.refresh();
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link href="/">
                <div className="flex items-center cursor-pointer">
                  <span className="text-blue-600 dark:text-blue-400 text-2xl font-bold">DubWash</span>
                </div>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {!loading && !user ? (
                <>
                  <Link href="/auth/login">
                    <button className="px-4 py-2 text-blue-600 dark:text-blue-400 font-medium hover:text-blue-800 dark:hover:text-blue-300">
                      Log in
                    </button>
                  </Link>
                  <Link href="/auth/signup">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition shadow-md">
                      Sign up
                    </button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/vehicles">
                    <button className="px-4 py-2 text-blue-600 dark:text-blue-400 font-medium hover:text-blue-800 dark:hover:text-blue-300">
                      My Vehicles
                    </button>
                  </Link>
                  <Link href="/settings">
                    <button className="px-4 py-2 text-gray-600 dark:text-gray-400 font-medium hover:text-gray-800 dark:hover:text-gray-300">
                      Settings
                    </button>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="px-4 py-2 text-red-600 dark:text-red-400 font-medium hover:text-red-800 dark:hover:text-red-300"
                  >
                    Log out
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-900">
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              The #1 site for car wash services
            </h1>
            <p className="text-xl md:text-2xl mb-10">
              Book professional car wash services for your vehicles with just a few clicks
            </p>
            
            {!loading && !user ? (
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/auth/signup">
                  <button className="px-8 py-4 bg-white text-blue-700 rounded-md hover:bg-gray-100 transition shadow-lg text-lg font-medium">
                    Get Started
                  </button>
                </Link>
                <Link href="/auth/login">
                  <button className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-md hover:bg-white/10 transition text-lg font-medium">
                    Log In
                  </button>
                </Link>
              </div>
            ) : (
              <Link href="/vehicles">
                <button className="px-8 py-4 bg-white text-blue-700 rounded-md hover:bg-gray-100 transition shadow-lg text-lg font-medium">
                  Manage My Vehicles
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar (Decorative) */}
      <div className="container mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 flex flex-col md:flex-row items-center">
          <div className="flex-grow mb-4 md:mb-0 md:mr-4">
            <div className="relative">
              <input
                type="text"
                className="w-full p-4 pl-12 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Enter your location to find car wash services near you"
                disabled
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          <button className="w-full md:w-auto px-6 py-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition shadow-md font-medium">
            Find Services
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-white">
          Why Choose DubWash?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Save Time</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Book car wash services anytime, anywhere. No more waiting in lines or making phone calls.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
            <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Quality Service</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Connect with professional car wash providers who deliver exceptional service every time.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center">
            <div className="bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="h-8 w-8 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Affordable Pricing</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Competitive rates with special discounts and promotions for regular customers.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-100 dark:bg-gray-800 py-16">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-900 rounded-xl shadow-xl overflow-hidden">
            <div className="md:flex">
              <div className="p-8 md:p-12 md:w-2/3">
                <h2 className="text-3xl font-bold text-white mb-4">Ready to get your car washed?</h2>
                <p className="text-blue-100 mb-8 text-lg">
                  Sign up today and get 15% off your first car wash service. Limited time offer!
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/auth/signup">
                    <button className="px-6 py-3 bg-white text-blue-700 rounded-md hover:bg-gray-100 transition shadow-md font-medium">
                      Sign Up Now
                    </button>
                  </Link>
                  <Link href="/services">
                    <button className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-md hover:bg-white/10 transition font-medium">
                      View Services
                    </button>
                  </Link>
                </div>
              </div>
              <div className="md:w-1/3 relative">
                <div className="absolute inset-0 bg-blue-900 opacity-20"></div>
                <div className="h-full flex items-center justify-center p-8">
                  <div className="bg-white/90 dark:bg-gray-800/90 p-6 rounded-lg shadow-lg z-10 text-center">
                    <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2">Special Offer</h3>
                    <p className="text-3xl font-bold text-gray-800 dark:text-white mb-1">15% OFF</p>
                    <p className="text-gray-600 dark:text-gray-400">Your First Wash</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <div className="md:flex md:justify-between">
            <div className="mb-6 md:mb-0">
              <Link href="/">
                <div className="flex items-center cursor-pointer">
                  <span className="text-blue-600 dark:text-blue-400 text-xl font-bold">DubWash</span>
                </div>
              </Link>
              <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md">
                The premier platform for booking car wash services. Keep your vehicles clean with just a few clicks.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase dark:text-gray-400 mb-4">Company</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">About Us</a></li>
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Careers</a></li>
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Contact</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase dark:text-gray-400 mb-4">Services</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Basic Wash</a></li>
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Premium Wash</a></li>
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Interior Cleaning</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase dark:text-gray-400 mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Privacy Policy</a></li>
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Terms of Service</a></li>
                </ul>
              </div>
            </div>
          </div>
          <hr className="my-6 border-gray-200 dark:border-gray-700" />
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} DubWash. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}