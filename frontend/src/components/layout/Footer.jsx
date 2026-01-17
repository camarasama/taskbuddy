import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Left side - Copyright */}
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <span>© {currentYear} TaskBuddy. Built with</span>
            <Heart className="w-4 h-4 text-danger-500 fill-current" />
            <span>for families everywhere</span>
          </div>

          {/* Right side - Links */}
          <div className="flex items-center space-x-6 text-sm">
            <Link
              to="/about"
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              About
            </Link>
            <Link
              to="/privacy"
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/contact"
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>

        {/* Academic project notice */}
        <div className="mt-4 pt-4 border-t border-gray-100 text-center text-xs text-gray-500">
          Academic Project - Regional Maritime University - BSc Information Technology
        </div>
      </div>
    </footer>
  );
};

export default Footer;
