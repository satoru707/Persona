import React from "react";
import { Github, Twitter, Linkedin, Instagram } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 py-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-1">
            <a
              href="#"
              className="font-bold text-2xl text-violet-600 mb-4 inline-block"
            >
              TimeForge
            </a>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              AI-powered time management and goal tracking for ambitious
              professionals.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://x.com/xlyla277615?t=NSmxrCmUNOzTQZfYv8N1vg&s=09"
                className="text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://www.linkedin.com/in/thepraiseolaoye"
                className="text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="https://www.instagram.com/prai__ez?igsh=enI4OWcxOHN1Yml3"
                className="text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://github.com/satoru707/Persona"
                className="text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                <Github size={20} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#features"
                  className="text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="https://satoru707.vercel.app/#contact"
                  className="text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/satoru707/Persona"
                  className="text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/satoru707"
                  className="text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  About Me
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-gray-600 dark:text-gray-400">
          <p>
            © {new Date().getFullYear()} Time Forge. All rights reserved. Talk
            to Praise sha.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
