import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Social", href: "#social" },
];

export default function Navbar() {
  const [active, setActive] = useState("Home");
  const observerRef = useRef<IntersectionObserver | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleNavigation = (label: string, href: string) => {
    setActive(label);
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
      className="fixed top-6 left-1/2 -translate-x-1/2 w-auto z-50"
    >
      <div className="flex justify-center">
        <motion.div 
          className="flex items-center px-2 py-2 rounded-full bg-white/80 dark:bg-gray-900/80 shadow-xl backdrop-blur-lg border border-white/30 gap-2"
        >
          {navItems.map((item) => (
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
              {active === item.label && (
                <motion.span
                  layoutId="pill-nav"
                  transition={{ 
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                  }}
                  className="absolute inset-0 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700"
                  style={{ zIndex: -1 }}
                />
              )}
              {item.label}
            </motion.button>
          ))}
        </motion.div>
      </div>
    </motion.nav>
  );
} 