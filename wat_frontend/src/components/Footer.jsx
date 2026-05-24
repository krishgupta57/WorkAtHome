import { Link } from "react-router-dom";
import { Hammer, Zap, Droplet, Star, ShieldCheck, HelpCircle } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 py-16 border-t border-gray-900 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* BRAND COLUMN */}
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-black bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              WorkAtHome
            </span>
          </Link>
          <p className="text-sm text-gray-500 leading-relaxed">
            Leading home service booking platform. Hire vetted electricians, plumbers, carpenters, drivers, and cleaning professionals instantly.
          </p>
          <div className="flex gap-4 pt-2">
            <span className="text-xs tracking-wider bg-gray-900 border border-gray-800 text-gray-300 font-semibold px-2.5 py-1 rounded">
              ★ 4.9 Rated
            </span>
            <span className="text-xs tracking-wider bg-indigo-950 border border-indigo-900 text-indigo-400 font-semibold px-2.5 py-1 rounded">
              ✓ Secured Payments
            </span>
          </div>
        </div>

        {/* SERVICES COLUMN */}
        <div className="space-y-4">
          <h4 className="text-white font-semibold tracking-wider uppercase text-xs">Popular Services</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/book" className="hover:text-white transition">Electrician repairs</Link></li>
            <li><Link to="/book" className="hover:text-white transition">Plumbing services</Link></li>
            <li><Link to="/book" className="hover:text-white transition">Full home deep cleaning</Link></li>
            <li><Link to="/book" className="hover:text-white transition">AC & Appliance repair</Link></li>
            <li><Link to="/book" className="hover:text-white transition">Professional Drivers</Link></li>
          </ul>
        </div>

        {/* COMPANY COLUMN */}
        <div className="space-y-4">
          <h4 className="text-white font-semibold tracking-wider uppercase text-xs">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-white transition">About Us</Link></li>
            <li><Link to="/" className="hover:text-white transition">Careers</Link></li>
            <li><Link to="/" className="hover:text-white transition">Privacy Policy</Link></li>
            <li><Link to="/" className="hover:text-white transition">Terms of Service</Link></li>
            <li><Link to="/" className="hover:text-white transition">Contact Support</Link></li>
          </ul>
        </div>

        {/* TRUST COLUMN */}
        <div className="space-y-4">
          <h4 className="text-white font-semibold tracking-wider uppercase text-xs">Trust & Safety</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            Every professional on our network is reference-checked, verified, and background-vetted to guarantee your complete peace of mind.
          </p>
          <div className="space-y-2 pt-1 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span>₹10,000 Insurance Cover</span>
            </div>
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              <span>24/7 Priority Support Chat</span>
            </div>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-900 text-center text-xs text-gray-600">
        <p>© 2026 WorkAtHome Technologies Private Limited. All rights reserved.</p>
        <p className="mt-1">Crafted with excellence for maximum comfort and speed.</p>
      </div>
    </footer>
  );
}

export default Footer;