
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import  Navbar  from '@/Components/NavBar'
import  Footer  from '@/Components/Footer'

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

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

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
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
        // Store token in localStorage
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        
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
      <div className="min-h-screen">
        <Navbar />
        <section className="min-h-screen flex pt-20 items-center justify-center bg-gradient-to-br from-green-600 via-blue-700 to-green-500 relative overflow-hidden mt-10 pb-10">
          <div className="relative z-10 w-full max-w-md mx-auto bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-white mb-4">Welcome to APICTS!</h2>
            <p className="text-blue-100 mb-6">
              Your account has been created successfully. You&apos;re now signed in!
            </p>
            <p className="text-blue-200 text-sm">
              Check your email for a welcome message. Redirecting to dashboard...
            </p>
            <div className="mt-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
<div className="min-h-screen">
    <Navbar />
 <section className="min-h-screen flex pt-20 items-center justify-center bg-white relative overflow-hidden mt-10 pb-10">
      

        <div className="relative z-10 w-full max-w-md mx-auto bg-red-600 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="flex flex-col items-center mb-8">
            
            <h2 className="text-3xl font-bold text-white mb-1">Create Your Account</h2>
            
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error Message */}
            {errors.general && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-lg">
                {errors.general}
              </div>
            )}

            {/* First Name */}
            <div>
              <label className="block text-white mb-1 font-medium" htmlFor="firstName">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
                value={formData.firstName}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg bg-white text-blue-900 font-semibold border transition ${
                  errors.firstName ? 'border-red-500 focus:ring-red-400' : 'border-blue-200 focus:ring-green-400'
                } focus:outline-none focus:ring-2`}
                placeholder="First Name"
              />
              {errors.firstName && (
                <p className="text-red-300 text-sm mt-1">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-white mb-1 font-medium" htmlFor="lastName">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                required
                value={formData.lastName}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg bg-white text-blue-900 font-semibold border transition ${
                  errors.lastName ? 'border-red-500 focus:ring-red-400' : 'border-blue-200 focus:ring-green-400'
                } focus:outline-none focus:ring-2`}
                placeholder="Last Name"
              />
              {errors.lastName && (
                <p className="text-red-300 text-sm mt-1">{errors.lastName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-white mb-1 font-medium" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg bg-white text-blue-900 font-semibold border transition ${
                  errors.email ? 'border-red-500 focus:ring-red-400' : 'border-blue-200 focus:ring-green-400'
                } focus:outline-none focus:ring-2`}
                placeholder="you@email.com"
              />
              {errors.email && (
                <p className="text-red-300 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone (Optional) */}
            <div>
              <label className="block text-white mb-1 font-medium" htmlFor="phone">
                Phone Number (Optional)
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-white text-blue-900 font-semibold border border-blue-200 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                placeholder="+234 123 456 7890"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-white mb-1 font-medium" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg bg-white text-blue-900 font-semibold border transition ${
                  errors.password ? 'border-red-500 focus:ring-red-400' : 'border-blue-200 focus:ring-green-400'
                } focus:outline-none focus:ring-2`}
                placeholder="Create a password"
              />
              {errors.password && (
                <p className="text-red-300 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-white mb-1 font-medium" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg bg-white text-blue-900 font-semibold border transition ${
                  errors.confirmPassword ? 'border-red-500 focus:ring-red-400' : 'border-blue-200 focus:ring-green-400'
                } focus:outline-none focus:ring-2`}
                placeholder="Re-enter your password"
              />
              {errors.confirmPassword && (
                <p className="text-red-300 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="terms" required className="mr-2 accent-green-500" />
              <label htmlFor="terms" className="text-blue-200 text-sm">
                I agree to the <Link href="/termsandconditions" className="text-green-300 hover:underline">Terms & Conditions</Link>
              </label>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full font-bold py-3 rounded-lg shadow-lg transition-all duration-300 text-lg ${
                isLoading 
                  ? 'bg-gray-500 cursor-not-allowed' 
                  : 'bg-blue-900 hover:bg-green-600'
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
          <div className="mt-8 text-center text-white">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-900 font-semibold hover:underline hover:text-green-500">
              Sign in
            </Link>
          </div>
        </div>
      </section>
    <Footer />
</div>



  );}