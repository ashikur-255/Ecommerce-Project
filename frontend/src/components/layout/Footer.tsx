import { Link } from "react-router-dom";
import {
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiYoutube,
  FiMail,
  FiPhone,
  FiMapPin,
  FiLinkedin,
} from "react-icons/fi";

const socialLinks = [
  {
    icon: FiFacebook,
    url: "https://www.facebook.com/Ashikur.1428",
    label: "Facebook",
  },
  {
    icon: FiLinkedin,
    url: "https://www.linkedin.com/in/ashikur-rahman-134300159/",
    label: "LinkedIn",
  },
  {
    icon: FiInstagram,
    url: "https://www.instagram.com/ashikur.1428/",
    label: "Instagram",
  },
  {
    icon: FiYoutube,
    url: "https://www.youtube.com/@your-channel-name",
    label: "YouTube",
  },
  {
    icon: FiTwitter,
    url: "https://x.com/Ashikur96e",
    label: "Twitter (X)",
  },
];

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300 mt-20">
      
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-xl">
                 <img 
              src="/src/assets/logo.png" 
              alt="FashionBD Logo" 
              className="h-10 w-auto" // Adjust size as needed
            />
              </div>

              <div>
                <h2 className="text-2xl font-black text-white">
                  BDFashions
                </h2>
                <p className="text-sm text-gray-500">
                  Performance Meets Style
                </p>
              </div>
            </div>

            <p className="leading-relaxed text-gray-400 mb-6 max-w-md">
              Discover premium sportswear, footwear, and accessories
              engineered for athletes and designed for everyday life.
            </p>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <FiMapPin className="text-primary" />
                <span>Dhaka, Bangladesh</span>
              </div>

              <div className="flex items-center gap-3">
                <FiPhone className="text-primary" />
                <span>+880 1708-588330</span>
              </div>

              <div className="flex items-center gap-3">
                <FiMail className="text-primary" />
                <span>ashikurr255@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-white font-bold mb-5">
              Shop
            </h3>

            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/products" className="hover:text-primary transition">
                  All Products
                </Link>
              </li>

              <li>
                <Link to="/#new" className="hover:text-primary transition">
                  New Arrivals
                </Link>
              </li>

              <li>
                <Link to="/#product" className="hover:text-primary transition">
                  Featured Products
                </Link>
              </li>

              <li>
                <Link to="/products/:id" className="hover:text-primary transition">
                  Sale
                </Link>
              </li>

              <li>
                <Link to="/orders" className="hover:text-primary transition">
                  Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-bold mb-5">
              Customer Service
            </h3>

            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/help" className="hover:text-primary transition">
                  Help Center
                </Link>
              </li>

              <li>
                <Link to="/returns" className="hover:text-primary transition">
                  Return Policy
                </Link>
              </li>

              <li>
                <Link to="/shipping" className="hover:text-primary transition">
                  Shipping Info
                </Link>
              </li>

              <li>
                <Link to="/faq" className="hover:text-primary transition">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Payment */}
          <div>
            <h3 className="text-white font-bold mb-5">
              Secure Payments
            </h3>

            <div className="flex flex-wrap gap-2">
              {["Visa", "MasterCard", "Roket", "Nagod", "bKash"]?.map(
                (item) => (
                  <span
                    key={item}
                    className="bg-gray-900 border border-gray-800 px-3 py-2 rounded-lg text-xs font-semibold"
                  >
                    {item}
                  </span>
                )
              )}
            </div>

            <div className="mt-6">
              <p className="text-sm text-green-400 font-medium">
                ✓ SSL Secured Checkout
              </p>

              <p className="text-sm text-green-400 font-medium mt-2">
                ✓ 100% Secure Payments
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">

            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} BDFashions Store. All rights reserved.
            </p>

            <div className="flex gap-3">
              {socialLinks.map(({ icon: Icon, url, label }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-800 bg-gray-900 transition-all duration-300 hover:border-primary hover:text-primary hover:scale-105"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}