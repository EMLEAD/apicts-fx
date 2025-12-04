"use client";

import Link from "next/link";
import Image from "next/image";
import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, CheckCircle } from "lucide-react";
import { signInWithGoogle } from '@/lib/firebase/auth';
import Navbar from '@/Components/NavBar';
import Footer from '@/Components/Footer';

function SignupPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialReferralCode = searchParams?.get('ref') || searchParams?.get('referral') || '';
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: initialReferralCode
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!initialReferralCode) return;
    setFormData(prev => ({
      ...prev,
      referralCode: initialReferralCode
    }));
  }, [initialReferralCode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      const result = await signInWithGoogle();
      
      if (result.success) {
        // Send Firebase data to our API
        const response = await fetch('/api/auth/firebase', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firebaseToken: result.token,
            userData: result.user
          }),
        });

        const apiResult = await response.json();

        if (apiResult.success) {
          // Store token in localStorage and cookies
          localStorage.setItem('token', apiResult.data.token);
          localStorage.setItem('user', JSON.stringify(apiResult.data.user));
          
          // Set cookie for server-side authentication
          document.cookie = `token=${apiResult.data.token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;
          
          setSuccess(true);
          
          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          setErrors({ general: apiResult.message });
        }
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      console.error('Google Sign-In error:', error);
      setErrors({ general: 'Google Sign-In failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        // Store token in localStorage and cookies
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        
        // Set cookie for server-side authentication
        document.cookie = `token=${result.data.token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;
        
        setSuccess(true);
        
        // Redirect to dashboard or home page after 2 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setErrors({ general: result.message });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <Navbar />
        <section className="min-h-screen flex pt-20 items-center justify-center relative overflow-hidden">
          <div className="relative z-10 w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to APICTS!</h2>
            <p className="text-gray-600 mb-6">
              Your account has been created successfully. You&apos;re now signed in!
            </p>
            <p className="text-gray-500 text-sm">
              Check your email for a welcome message. Redirecting to dashboard...
            </p>
            <div className="mt-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <Navbar />
      
      <section className="min-h-screen flex items-center justify-center pt-20 pb-10">
        <div className="w-full max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            {/* Left Side - Image */}
            <div className="hidden lg:block">
              <div className="relative h-[600px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/portrait-cheerful-happy-african-man.jpg"
                  alt="Join APICTS"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8 text-white">
                  <h3 className="text-3xl font-bold mb-4">Join Thousands of Happy Traders</h3>
                  <p className="text-lg opacity-90">
                    Start your financial journey with APICTS-FX. Quick registration with just username, email, and password.
                  </p>
                  <div className="flex items-center gap-4 mt-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={20} className="text-green-400" />
                      <span className="text-sm">Bank-level Security</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle size={20} className="text-green-400" />
                      <span className="text-sm">24/7 Support</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Your Account</h2>
                  <p className="text-gray-600">Join APICTS-FX with just a few details</p>
                </div>

                {/* Google Sign In */}
                <button 
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {isLoading ? 'Signing in...' : 'Continue with Google'}
                </button>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Or continue with email</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* General Error Message */}
                  {errors.general && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      {errors.general}
                    </div>
                  )}

                  {/* Username */}
                  <div>
                    <label className="block text-black mb-2 font-medium" htmlFor="username">
                      Username
                    </label>
                    <div className="relative">
                      <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" />
                      <input
                        id="username"
                        name="username"
                        type="text"
                        autoComplete="username"
                        required
                        value={formData.username}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border transition ${
                          errors.username ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-red-500'
                        } focus:outline-none focus:ring-2`}
                        placeholder="Choose a username"
                      />
                    </div>
                    {errors.username && (
                      <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-black mb-2 font-medium" htmlFor="email">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border transition ${
                          errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-red-500'
                        } focus:outline-none focus:ring-2`}
                        placeholder="you@email.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>


                  {/* Password */}
                  <div>
                    <label className="block text-black mb-2 font-medium" htmlFor="password">
                      Password
                    </label>
                    <div className="relative">
                      <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-12 py-3 rounded-lg border transition ${
                          errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-red-500'
                        } focus:outline-none focus:ring-2`}
                        placeholder="Create a password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-black mb-2 font-medium" htmlFor="confirmPassword">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-12 py-3 rounded-lg border transition ${
                          errors.confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-red-500'
                        } focus:outline-none focus:ring-2`}
                        placeholder="Re-enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Referral Code */}
                  <div>
                    <label className="block text-black mb-2 font-medium" htmlFor="referralCode">
                      Referral Code <span className="text-xs text-gray-400">(optional)</span>
                    </label>
                    <input
                      id="referralCode"
                      name="referralCode"
                      type="text"
                      value={formData.referralCode || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 uppercase"
                      placeholder="e.g. ABC123"
                    />
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      id="terms" 
                      required 
                      className="mt-1 accent-red-600" 
                    />
                    <label htmlFor="terms" className="text-gray-600 text-sm">
                      I agree to the <Link href="/termsandconditions" className="text-red-600 hover:underline font-medium">Terms & Conditions</Link> and <Link href="/privacy" className="text-red-600 hover:underline font-medium">Privacy Policy</Link>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full font-bold py-3 rounded-lg shadow-lg transition-all duration-300 text-lg ${
                      isLoading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-red-600 hover:bg-green-600 hover:shadow-xl hover:-translate-y-0.5'
                    } text-white`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Creating Account...
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </form>

                <div className="mt-8 text-center text-gray-600">
                  Already have an account?{" "}
                  <Link href="/login" className="text-red-600 font-semibold hover:underline">
                    Sign in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        </section>
      
      <Footer />
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">Loading...</div>}>
      <SignupPageContent />
    </Suspense>
  );
}
