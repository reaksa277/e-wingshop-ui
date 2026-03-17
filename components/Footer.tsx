import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-[#1a1a1a] pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Info */}
          <div>
            <h3 className="font-nunito-sans text-xl font-bold text-white">
              E-Wingshop
            </h3>
            <p className="mt-3 text-sm text-gray-400">
              Your trusted online grocery store. Fresh products, fast delivery,
              and great prices.
            </p>
            <div className="mt-4 flex gap-3">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-gray-400 transition-colors hover:bg-[#1a6b2f] hover:text-white"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-gray-400 transition-colors hover:bg-[#1a6b2f] hover:text-white"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-gray-400 transition-colors hover:bg-[#1a6b2f] hover:text-white"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-nunito-sans text-sm font-semibold text-white">
              Quick Links
            </h4>
            <ul className="mt-4 space-y-2">
              <li>
                <a
                  href="/"
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/categories"
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                >
                  Categories
                </a>
              </li>
              <li>
                <a
                  href="/deals"
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                >
                  Deals
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-nunito-sans text-sm font-semibold text-white">
              Customer Service
            </h4>
            <ul className="mt-4 space-y-2">
              <li>
                <a
                  href="/help"
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="/track-order"
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                >
                  Track Order
                </a>
              </li>
              <li>
                <a
                  href="/returns"
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                >
                  Returns & Refunds
                </a>
              </li>
              <li>
                <a
                  href="/faq"
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-nunito-sans text-sm font-semibold text-white">
              Contact Us
            </h4>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-400">
                  Dubai, United Arab Emirates
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-400">+971 4 123 4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-400">
                  support@ewingshop.ae
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-gray-800 pt-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-xs text-gray-500">
              © 2024 E-Wingshop. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a
                href="/terms"
                className="text-xs text-gray-500 transition-colors hover:text-white"
              >
                Terms of Service
              </a>
              <a
                href="/privacy"
                className="text-xs text-gray-500 transition-colors hover:text-white"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
