import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const footerLinks = [
    { name: 'Home', path: '/' },
    { name: 'Platform', path: '/recycling' },
    { name: 'EPR Compliance', path: '/epr' },
    { name: 'Contact Us', path: '/contact' }
  ];

  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="bg-gray-50 py-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Company Info */}
          <div>
            <h3 className="text-3xl font-bold text-green-600 mb-6">
              Waste OS
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              The smart operating system for waste management — connecting citizens, municipalities, and businesses to build cleaner, accountable cities.
            </p>
            <div className="space-y-3 text-gray-600">
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-green-600" />
                <span>hello@wasteos.in</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-green-600" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-3 text-green-600" />
                <span>Bengaluru, Karnataka, India</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-bold text-gray-900 mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {footerLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-600 hover:text-green-600 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xl font-bold text-gray-900 mb-6">Platform Features</h4>
            <ul className="space-y-3 text-gray-600">
              <li>Smart Collection Tracking</li>
              <li>AI Waste Scanner</li>
              <li>Carbon Credit Market</li>
              <li>EPR Compliance Suite</li>
              <li>Rewards &amp; Leaderboard</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8 text-center">
          <p className="text-gray-600">
            © 2025 Waste OS. All rights reserved. Smart Waste. Cleaner Cities.
          </p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;