import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Home, User, FolderGit2, MessageSquare } from "lucide-react";

const navItems = [
  { label: "Home", href: "#home", icon: Home },
  { label: "About", href: "#about", icon: User },
  { label: "Projects", href: "#projects", icon: FolderGit2 },
  { label: "Social", href: "#social", icon: MessageSquare },
];

export default function Navbar() {
  const [active, setActive] = useState("Home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create intersection observer with more sensitive settings
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            const matchingItem = navItems.find(item => item.href === `#${sectionId}`);
            if (matchingItem) {
              setActive(matchingItem.label);
              // Update URL hash without scrolling
              if (window.location.hash !== `#${sectionId}`) {
                window.history.replaceState(null, '', `#${sectionId}`);
              }
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '-30% 0px -30% 0px', // More sensitive margin
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0] // Multiple thresholds
      }
    );

    // Observe all sections
    navItems.forEach(item => {
      const section = document.getElementById(item.href.slice(1));
      if (section) {
        observerRef.current?.observe(section);
      }
    });

    // Add scroll event listener as fallback
    const handleScroll = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        const sections = navItems.map(item => ({
          element: document.getElementById(item.href.slice(1)),
          href: item.href,
          label: item.label
        })).filter(section => section.element);

        const currentSection = sections.find(section => {
          const rect = section.element?.getBoundingClientRect();
          return rect && rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2;
        });

        if (currentSection) {
          setActive(currentSection.label);
          if (window.location.hash !== currentSection.href) {
            window.history.replaceState(null, '', currentSection.href);
          }
        }
      }, 100); // Debounce scroll events
    };

    window.addEventListener('scroll', handleScroll);

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when scrolling
  useEffect(() => {
    const handleScroll = () => {
      setIsMobileMenuOpen(false);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = (label: string, href: string) => {
    setActive(label);
    setIsMobileMenuOpen(false);
    const section = document.getElementById(href.slice(1));
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ 
        duration: 0.5,
        type: "spring",
        stiffness: 100,
        damping: 10
      }}
      className="fixed md:top-6 md:left-1/2 md:-translate-x-1/2 bottom-6 right-6 w-auto z-40"
    >
      <div className="flex justify-center">
        {/* Desktop Navigation */}
        <motion.div 
          className="hidden md:flex items-center px-2 py-2 rounded-full bg-gray-50/80 dark:bg-gray-900/80 shadow-xl backdrop-blur-lg border border-gray-200/30 dark:border-gray-700/30 gap-2"
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.label}
                onClick={() => handleNavigation(item.label, item.href)}
                className={`relative px-6 py-2 rounded-full font-medium transition-colors duration-200 focus:outline-none ${
                  active === item.label
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                }`}
                style={{ zIndex: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${
                    active === item.label
                      ? "text-blue-500 dark:text-blue-400"
                      : "text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400"
                  }`} />
                  <span>{item.label}</span>
                </div>
                {active === item.label && (
                  <motion.span
                    layoutId="pill-nav"
                    transition={{ 
                      type: "spring",
                      stiffness: 500,
                      damping: 30
                    }}
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-blue-500/10 dark:to-purple-500/10 shadow-md border border-white/20 dark:border-gray-700/20"
                    style={{ zIndex: -1 }}
                  />
                )}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Mobile Menu Button */}
        <motion.button
          className="md:hidden p-4 rounded-full bg-gray-50/80 dark:bg-gray-900/80 shadow-xl backdrop-blur-lg border border-gray-200/30 dark:border-gray-700/30"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          whileHover={{ scale: 1.05, rotate: 90 }}
          whileTap={{ scale: 0.95 }}
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-blue-500 dark:text-blue-400" />
          ) : (
            <Menu className="w-6 h-6 text-blue-500 dark:text-blue-400" />
          )}
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-56 rounded-2xl bg-gray-50/80 dark:bg-gray-900/80 shadow-xl backdrop-blur-lg border border-gray-200/30 dark:border-gray-700/30 overflow-hidden"
          >
            <div className="flex flex-col py-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.label}
                    onClick={() => handleNavigation(item.label, item.href)}
                    className={`relative px-6 py-3 text-left font-medium transition-colors duration-200 flex items-center gap-3 ${
                      active === item.label
                        ? "text-blue-500 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20"
                        : "text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                    }`}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className={`w-5 h-5 ${
                      active === item.label
                        ? "text-blue-500 dark:text-blue-400"
                        : "text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400"
                    }`} />
                    <span>{item.label}</span>
                    {active === item.label && (
                      <motion.div
                        layoutId="mobile-active"
                        className="absolute right-4 w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
} 