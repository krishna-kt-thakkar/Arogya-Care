import React from 'react';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-card-surface border-t border-card-custom transition-colors duration-300 mt-auto shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
          {/* Brand */}
          <div className="flex items-center space-x-2">
            <div className="bg-brand-gradient p-1.5 rounded-lg">
              <Heart className="h-4 w-4 text-white animate-pulse" />
            </div>
            <span className="text-sm font-black tracking-tight text-brand-color">
              AROGYA CARE
            </span>
          </div>

          {/* Credit */}
          <p className="text-xs text-secondary-custom text-center">
            Made with <span className="text-red-500">❤</span> by{' '}
            <span className="font-bold text-primary-custom">
              Abhijit Chauhan & Krishna for MSME IDEA Hackathon 6.0
            </span>
          </p>

          {/* Year */}
          <p className="text-xs text-secondary-custom">
            © {new Date().getFullYear()} AROGYA CARE
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
