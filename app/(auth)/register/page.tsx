'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Truck, Clock, Shield, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Brand (45%) */}

      <div className="hidden lg:flex lg:w-[45%] bg-linear-to-br from-blue-600 via-teal-500 to-green-500 text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Organic Background Illustration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-white blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 rounded-full bg-white blur-3xl"></div>
        </div>

        {/* Product Collage Illustration */}
        <div className="relative z-10 flex-grow flex items-center justify-center">
          <div className="relative w-full max-w-md aspect-square">
            {/* Abstract organic shapes representing products */}
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-white/20 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-0 w-40 h-40 bg-white/15 rounded-full blur-xl animate-pulse delay-300"></div>
            <div className="absolute top-1/2 left-0 w-28 h-28 bg-white/25 rounded-full blur-lg animate-pulse delay-700"></div>

            {/* Central illustration placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <ShoppingBag className="w-48 h-48 text-white/30" strokeWidth={1} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 space-y-6">
          <h1 className="font-display text-4xl font-bold leading-tight">
            Fresh groceries delivered to your door
          </h1>

          <ul className="space-y-4">
            <li className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <span className="text-lg">Free delivery on orders over $50</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-lg">Delivery within 25 minutes</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-lg">100% fresh produce guarantee</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Right Panel - White (55%) */}
      <div className="w-full lg:w-[55%] bg-white flex flex-col">
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-24 py-12">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h2 className="font-display text-3xl font-bold text-gray-900 mb-2">Create account</h2>
            <p className="text-gray-500">Start shopping with E-Wingshop today</p>
          </div>

          {/* Form */}
          <form className="space-y-4 max-w-sm mx-auto w-full">
            {/* Name Field - Floating Label */}
            <div className="relative">
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="peer h-12 w-full border-gray-200 bg-white px-4 pt-6 pb-2 text-base focus:border-brand focus:ring-brand/20 rounded-full"
                placeholder=" "
                required
              />
              <label
                htmlFor="name"
                className="absolute left-4 top-3.5 text-gray-500 text-base transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-brand peer-focus:bg-white peer-focus:px-1 pointer-events-none peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3.5 peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:text-xs"
              >
                Full name
              </label>
            </div>

            {/* Email Field - Floating Label */}
            <div className="relative">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="peer h-12 w-full border-gray-200 bg-white px-4 pt-6 pb-2 text-base focus:border-brand focus:ring-brand/20 rounded-full"
                placeholder=" "
                required
              />
              <label
                htmlFor="email"
                className="absolute left-4 top-3.5 text-gray-500 text-base transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-brand peer-focus:bg-white peer-focus:px-1 pointer-events-none peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3.5 peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:text-xs"
              >
                Email address
              </label>
            </div>

            {/* Phone Field - Floating Label */}
            <div className="relative">
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="peer h-12 w-full border-gray-200 bg-white px-4 pt-6 pb-2 text-base focus:border-brand focus:ring-brand/20 rounded-full"
                placeholder=" "
                required
              />
              <label
                htmlFor="phone"
                className="absolute left-4 top-3.5 text-gray-500 text-base transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-brand peer-focus:bg-white peer-focus:px-1 pointer-events-none peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3.5 peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:text-xs"
              >
                Phone number
              </label>
            </div>

            {/* Password Field - Floating Label */}
            <div className="relative">
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="peer h-12 w-full border-gray-200 bg-white px-4 pt-6 pb-2 text-base focus:border-brand focus:ring-brand/20 rounded-full"
                placeholder=" "
                required
              />
              <label
                htmlFor="password"
                className="absolute left-4 top-3.5 text-gray-500 text-base transition-all peer-focus:-top-2 peer-focus:text-xs peer-focus:text-brand peer-focus:bg-white peer-focus:px-1 pointer-events-none peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3.5 peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:text-xs"
              >
                Password
              </label>
            </div>

            {/* Terms & Conditions Checkbox */}
            <div className="flex items-start gap-3 pt-2">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-brand focus:ring-brand/20 cursor-pointer"
                  required
                />
              </div>
              <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                I agree to the{' '}
                <a href="/terms" className="text-brand hover:text-brand-dark font-medium underline">
                  Terms & Conditions
                </a>{' '}
                and{' '}
                <a
                  href="/privacy"
                  className="text-brand hover:text-brand-dark font-medium underline"
                >
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Sign Up Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-brand hover:bg-brand-dark text-white font-medium rounded-full transition-all shadow-green hover:shadow-green mt-2"
            >
              Create Account
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8 max-w-sm mx-auto">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500">or continue with</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto w-full">
            <Button
              type="button"
              variant="outline"
              className="h-12 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-full"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-full"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Apple
            </Button>
          </div>

          {/* Login Link */}
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Already have an account?{' '}
              <a
                href="/login"
                className="text-brand hover:text-brand-dark font-medium inline-flex items-center gap-1 transition-colors"
              >
                Sign in
                <ArrowRight className="w-4 h-4" />
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="py-6 text-center text-sm text-gray-500">
          <p>© 2026 E-Wingshop. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
