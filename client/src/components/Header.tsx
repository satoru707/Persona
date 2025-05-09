import { BellRing, Menu, Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  openSidebar: () => void;
}

const Header = ({ openSidebar }: HeaderProps) => {
  const { theme, toggleTheme } = useThemeStore();
  const { user } = useAuthStore();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="py-4 px-6 bg-card border-b border-border flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          className="md:hidden p-2 rounded-md hover:bg-secondary"
          onClick={openSidebar}
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-semibold flex items-center">
          <span className="text-accent">Time</span>
          <span className="text-foreground">forge</span>
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          className="p-2 rounded-md hover:bg-secondary"
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <div className="relative" ref={notificationsRef}>
          <button
            className="p-2 rounded-md hover:bg-secondary relative"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <BellRing className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-accent"></span>
          </button>

          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute right-0 mt-2 w-72 bg-card rounded-md shadow-lg py-1 z-10 border border-border"
              >
                <div className="px-4 py-2 border-b border-border">
                  <h3 className="text-sm font-medium">Notifications</h3>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  <div className="py-2 px-4 hover:bg-secondary">
                    <p className="text-sm">Daily standup meeting in 15 minutes</p>
                    <p className="text-xs text-foreground/70 mt-1">10 minutes ago</p>
                  </div>
                  <div className="py-2 px-4 hover:bg-secondary">
                    <p className="text-sm">Website redesign goal: Step 3 is due today</p>
                    <p className="text-xs text-foreground/70 mt-1">1 hour ago</p>
                  </div>
                </div>
                <a href="#" className="block text-center text-sm text-accent py-2 border-t border-border">
                  View all notifications
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative" ref={profileRef}>
          <button
            className="flex items-center gap-2"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <span className="hidden md:block text-sm font-medium">
              {user?.name || 'User'}
            </span>
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg py-1 z-10 border border-border"
              >
                <a href="#" className="block px-4 py-2 text-sm hover:bg-secondary">
                  Your Profile
                </a>
                <a href="#" className="block px-4 py-2 text-sm hover:bg-secondary">
                  Settings
                </a>
                <button 
                  className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-secondary"
                  onClick={() => useAuthStore.getState().logout()}
                >
                  Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Header;