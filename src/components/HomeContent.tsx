import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Github, Instagram, Linkedin, Mail, Download, ArrowRight, Code, Terminal, Database, ArrowDown, Monitor, Smartphone, Cloud, Layers, Code2, FolderGit2 } from 'lucide-react';
import DiscordStatus from './DiscordStatus';

const techIcons = [
  { icon: <Code className="w-7 h-7 text-blue-500" />, name: "Code" },
  { icon: <Database className="w-7 h-7 text-purple-500" />, name: "Database" },
  { icon: <Terminal className="w-7 h-7 text-green-500" />, name: "Terminal" },
  { icon: <Monitor className="w-7 h-7 text-cyan-500" />, name: "Monitor" },
  { icon: <Smartphone className="w-7 h-7 text-pink-500" />, name: "Mobile" },
  { icon: <Cloud className="w-7 h-7 text-blue-400" />, name: "Cloud" },
  { icon: <Layers className="w-7 h-7 text-yellow-500" />, name: "Layers" },
];

const typewriterWords = [
  "Backend Developer",
  "Laravel Artisan",
  "RESTful API Builder",
  "API Specialist",
  "I Speak JSON",
  "Open Source Contributor"
];

function useTypewriter(words: string[], speed = 80, pause = 1200) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [blink, setBlink] = useState(true);
  const timeout = useRef<any>(null);

  useEffect(() => {
    if (subIndex === words[index].length + 1 && !deleting) {
      timeout.current = setTimeout(() => setDeleting(true), pause);
      return;
    }
    if (subIndex === 0 && deleting) {
      setDeleting(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }
    timeout.current = setTimeout(() => {
      setSubIndex((prev) => prev + (deleting ? -1 : 1));
    }, deleting ? speed / 2 : speed);
    return () => clearTimeout(timeout.current);
  }, [subIndex, index, deleting, words, speed, pause]);

  useEffect(() => {
    const blinkInterval = setInterval(() => setBlink((v) => !v), 500);
    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <span>
      {words[index].substring(0, subIndex)}
      <span className={blink ? "opacity-100" : "opacity-0"}>|</span>
    </span>
  );
}

function ProjectImage({ src, alt, projectName }: { src: string; alt: string; projectName: string }) {
  const [imgError, setImgError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const generatePlaceholderSVG = (name: string) => {
    const colors = [
      'from-slate-100 to-slate-200',
      'from-zinc-100 to-zinc-200',
      'from-neutral-100 to-neutral-200',
      'from-stone-100 to-stone-200',
      'from-gray-100 to-gray-200'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${randomColor} dark:from-slate-800 dark:to-slate-900`}>
        <div className="text-slate-600 dark:text-slate-300 text-center p-4">
          <div className="text-4xl font-bold mb-2">{name.charAt(0)}</div>
          <div className="text-sm opacity-80">{name}</div>
        </div>
      </div>
    );
  };

  const handleImageError = () => {
    setImgError(true);
    setIsLoading(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Preload and handle image loading
  useEffect(() => {
    let isMounted = true;
    const img = new Image();

    const loadImage = () => {
      if (!isMounted) return;
      
      img.src = src;
      img.onload = () => {
        if (isMounted) handleImageLoad();
      };
      img.onerror = () => {
        if (isMounted) handleImageError();
      };
    };

    // Set timeout for slow loading
    timeoutRef.current = setTimeout(() => {
      if (isLoading && isMounted) {
        handleImageError();
      }
    }, 2000); // Reduced to 2 seconds for better UX

    loadImage();

    return () => {
      isMounted = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [src, isLoading]);

  return (
    <div className="relative h-48 overflow-hidden">
      {!imgError ? (
        <>
          {/* Loading skeleton with softer gradient */}
          {isLoading && (
            <div className="absolute inset-0 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 animate-shimmer" />
          )}
          <img 
            ref={imgRef}
            src={src}
            alt={alt}
            className={`w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
            decoding="async"
          />
        </>
      ) : (
        generatePlaceholderSVG(projectName)
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}

// Update shimmer animation keyframes
const shimmerKeyframes = `
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
  .animate-shimmer {
    background-size: 200% 100%;
    animation: shimmer 2s infinite linear;
  }
`;

// Add the animation to the document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = shimmerKeyframes;
  document.head.appendChild(style);
}

export default function HomeContent() {
  const typewriter = useTypewriter(typewriterWords);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollPosition, setScrollPosition] = useState(0);

  // Add scroll-based animations
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Transform scroll progress into various animation values
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.98]);
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 20]);

  const aboutOpacity = useTransform(scrollYProgress, [0.1, 0.3], [0, 1]);
  const aboutScale = useTransform(scrollYProgress, [0.1, 0.3], [0.98, 1]);
  const aboutY = useTransform(scrollYProgress, [0.1, 0.3], [20, 0]);

  const projectsOpacity = useTransform(scrollYProgress, [0.2, 0.4], [0, 1]);
  const projectsScale = useTransform(scrollYProgress, [0.2, 0.4], [0.98, 1]);
  const projectsY = useTransform(scrollYProgress, [0.2, 0.4], [20, 0]);

  const socialOpacity = useTransform(scrollYProgress, [0.3, 0.5], [0, 1]);
  const socialScale = useTransform(scrollYProgress, [0.3, 0.5], [0.98, 1]);
  const socialY = useTransform(scrollYProgress, [0.3, 0.5], [20, 0]);

  // Track mouse movement for parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };

    const handleScroll = () => {
      if (containerRef.current) {
        setScrollPosition(containerRef.current.scrollTop);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    containerRef.current?.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      containerRef.current?.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Calculate parallax scroll offsets
  const getScrollParallax = (speed: number) => {
    return scrollPosition * speed;
  };

  // Add animations to document head
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = `
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-15px) translateX(15px);
          }
          50% {
            transform: translateY(0) translateX(30px);
          }
          75% {
            transform: translateY(15px) translateX(15px);
          }
        }

        @keyframes worm-glow {
          0%, 100% {
            filter: blur(8px) brightness(1);
          }
          50% {
            filter: blur(12px) brightness(1.3);
          }
        }

        @keyframes worm-horizontal-1 {
          0% {
            transform: translateX(-100%) scaleX(0.8);
            opacity: 0;
          }
          10% {
            opacity: 1;
            transform: translateX(-80%) scaleX(1);
          }
          90% {
            opacity: 1;
            transform: translateX(80%) scaleX(1);
          }
          100% {
            transform: translateX(100%) scaleX(0.8);
            opacity: 0;
          }
        }
        
        @keyframes worm-horizontal-2 {
          0% {
            transform: translateX(100%) scaleX(0.8);
            opacity: 0;
          }
          10% {
            opacity: 1;
            transform: translateX(80%) scaleX(1);
          }
          90% {
            opacity: 1;
            transform: translateX(-80%) scaleX(1);
          }
          100% {
            transform: translateX(-100%) scaleX(0.8);
            opacity: 0;
          }
        }
        
        @keyframes worm-vertical-1 {
          0% {
            transform: translateY(-100%) scaleY(0.8);
            opacity: 0;
          }
          10% {
            opacity: 1;
            transform: translateY(-80%) scaleY(1);
          }
          90% {
            opacity: 1;
            transform: translateY(80%) scaleY(1);
          }
          100% {
            transform: translateY(100%) scaleY(0.8);
            opacity: 0;
          }
        }

        .animate-float {
          animation: float 20s ease-in-out infinite;
        }

        .animate-worm-glow {
          animation: worm-glow 3s ease-in-out infinite;
        }
        
        .animate-worm-horizontal-1 {
          animation: worm-horizontal-1 12s linear infinite;
        }
        
        .animate-worm-horizontal-2 {
          animation: worm-horizontal-2 15s linear infinite;
        }
        
        .animate-worm-vertical-1 {
          animation: worm-vertical-1 18s linear infinite;
        }
        
        .animate-gradient-shift {
          background-size: 400% 400%;
          animation: gradient-shift 15s ease infinite;
        }
        
        .animate-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          animation: noise 0.2s steps(8) infinite;
        }

        .parallax-slow {
          transition: transform 0.2s cubic-bezier(0.2, 0.49, 0.32, 0.99);
        }

        .parallax-fast {
          transition: transform 0.1s cubic-bezier(0.2, 0.49, 0.32, 0.99);
        }
      `;
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative overflow-y-auto"
    >
      {/* Background Elements - Enhanced animations with Parallax */}
      <div 
        className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
        style={{
          height: '200vh',
          transform: `translateY(${-getScrollParallax(0.1)}px)`
        }}
      >
        {/* Deep background gradient with scroll parallax */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 animate-gradient-shift"
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
            height: '200%' // Ensure full coverage
          }}
        />
        
        {/* Background layer with slower parallax */}
        <div 
          className="absolute inset-0 parallax-slow"
          style={{
            transform: `translate(${mousePosition.x * 0.05}px, ${mousePosition.y * 0.05}px)`,
            height: '200%'
          }}
        >
          {/* Glowing orbs in background */}
          <div 
            className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-blue-400/20 blur-3xl animate-float"
            style={{ transform: `translateY(${getScrollParallax(0.15)}px)` }}
          />
          <div 
            className="absolute bottom-1/4 right-1/3 w-40 h-40 rounded-full bg-purple-400/20 blur-3xl animate-float"
            style={{ 
              animationDelay: '-7s',
              transform: `translateY(${getScrollParallax(0.1)}px)`
            }}
          />
          <div 
            className="absolute top-1/3 right-1/4 w-36 h-36 rounded-full bg-pink-400/20 blur-3xl animate-float"
            style={{ 
              animationDelay: '-14s',
              transform: `translateY(${getScrollParallax(0.2)}px)`
            }}
          />
        </div>

        {/* Middle layer with medium parallax */}
        <div 
          className="absolute inset-0 parallax-fast"
          style={{
            transform: `translate(${mousePosition.x * 0.1}px, ${mousePosition.y * 0.1}px)`,
            height: '200%'
          }}
        >
          {/* Grid-following worm effects with glow */}
          <div className="absolute top-0 left-0 w-full h-full">
            {/* Horizontal worms with glow effect */}
            <div className="absolute top-1/4 left-0 w-full">
              <div className="h-1 bg-gradient-to-r from-transparent via-blue-400/40 to-transparent animate-worm-horizontal-1 animate-worm-glow" />
              <div className="h-1 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent animate-worm-horizontal-1" style={{ filter: 'blur(4px)', transform: 'translateY(4px)' }} />
            </div>
            <div className="absolute top-1/2 left-0 w-full">
              <div className="h-1 bg-gradient-to-r from-transparent via-purple-400/40 to-transparent animate-worm-horizontal-2 animate-worm-glow" style={{ animationDelay: '-3s' }} />
              <div className="h-1 bg-gradient-to-r from-transparent via-purple-400/20 to-transparent animate-worm-horizontal-2" style={{ filter: 'blur(4px)', transform: 'translateY(4px)', animationDelay: '-3s' }} />
            </div>
            <div className="absolute bottom-1/4 left-0 w-full">
              <div className="h-1 bg-gradient-to-r from-transparent via-pink-400/40 to-transparent animate-worm-horizontal-1 animate-worm-glow" style={{ animationDelay: '-6s' }} />
              <div className="h-1 bg-gradient-to-r from-transparent via-pink-400/20 to-transparent animate-worm-horizontal-1" style={{ filter: 'blur(4px)', transform: 'translateY(4px)', animationDelay: '-6s' }} />
            </div>

            {/* Vertical worms with glow effect */}
            <div className="absolute left-1/4 top-0 h-full">
              <div className="w-1 h-full bg-gradient-to-b from-transparent via-blue-400/40 to-transparent animate-worm-vertical-1 animate-worm-glow" />
              <div className="w-1 h-full bg-gradient-to-b from-transparent via-blue-400/20 to-transparent animate-worm-vertical-1" style={{ filter: 'blur(4px)', transform: 'translateX(4px)' }} />
            </div>
            <div className="absolute left-1/2 top-0 h-full">
              <div className="w-1 h-full bg-gradient-to-b from-transparent via-purple-400/40 to-transparent animate-worm-vertical-1 animate-worm-glow" style={{ animationDelay: '-4s' }} />
              <div className="w-1 h-full bg-gradient-to-b from-transparent via-purple-400/20 to-transparent animate-worm-vertical-1" style={{ filter: 'blur(4px)', transform: 'translateX(4px)', animationDelay: '-4s' }} />
            </div>
            <div className="absolute right-1/4 top-0 h-full">
              <div className="w-1 h-full bg-gradient-to-b from-transparent via-pink-400/40 to-transparent animate-worm-vertical-1 animate-worm-glow" style={{ animationDelay: '-8s' }} />
              <div className="w-1 h-full bg-gradient-to-b from-transparent via-pink-400/20 to-transparent animate-worm-vertical-1" style={{ filter: 'blur(4px)', transform: 'translateX(4px)', animationDelay: '-8s' }} />
            </div>
          </div>
        </div>

        {/* Foreground layer with fastest parallax */}
        <div 
          className="absolute inset-0 parallax-fast"
          style={{
            transform: `translate(${mousePosition.x * 0.15}px, ${mousePosition.y * 0.15}px)`,
            height: '200%'
          }}
        >
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:24px_24px] opacity-50" />
          
          {/* Animated noise texture */}
          <div className="absolute inset-0 opacity-[0.02] animate-noise" />
        </div>
      </div>

      <main className="relative">
        <AnimatePresence>
          {/* Hero Section */}
          <motion.section 
            id="home" 
            className="min-h-screen flex items-start justify-center pt-20 md:pt-24 pb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col-reverse md:flex-row items-center justify-center gap-12">
                <motion.div 
                  className="w-full md:w-1/2 space-y-8 text-center md:text-left"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-sm border border-blue-500/20 shadow-lg"
                  >
                    <motion.span 
                      className="w-2 h-2 rounded-full bg-green-400"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <span className="text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Available for work</span>
                  </motion.div>
                  
                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight"
                  >
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                      Hi, I'm Afif Medya
                    </span>
                  </motion.h1>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-xl md:text-2xl font-semibold text-gray-700 dark:text-gray-200 min-h-[2.5rem]"
                  >
                    {typewriter}
                  </motion.div>

                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-lg mx-auto md:mx-0"
                  >
                    I am a student with a great interest in technology and software development. I am currently learning various programming languages and frameworks . Although I am still in the learning phase, I am enthusiastic about continuously improving my skills.
                  </motion.p>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex flex-wrap gap-4 justify-center md:justify-start"
                  >
                    {techIcons.map((tech, i) => (
                      <motion.div
                        key={`tech-icon-${i}-${tech.name}`}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ 
                          duration: 0.3,
                          delay: 0.8 + i * 0.1
                        }}
                        whileHover={{ 
                          scale: 1.2,
                          boxShadow: "0 0 16px 4px rgba(59,130,246,0.3)"
                        }}
                        className="rounded-full bg-white/70 dark:bg-gray-900/70 p-3 shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-200 cursor-pointer"
                        title={tech.name}
                      >
                        {tech.icon}
                      </motion.div>
                    ))}
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="flex flex-wrap gap-4 justify-center md:justify-start"
                  >
                    <motion.a 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href="mailto:amwp@afifmedya.my.id" 
                      className="group px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                    >
                      <Mail className="w-5 h-5" />
                      Contact Me
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </motion.a>
                    <motion.a 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href="#projects" 
                      className="group px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg hover:bg-white/20 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                    >
                      <FolderGit2 className="w-5 h-5" />
                      View Projects
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </motion.a>
                  </motion.div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="w-full md:w-1/2 flex justify-center order-first md:order-none"
                >
                  <motion.div 
                    className="relative"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-3xl opacity-20"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.3, 0.2]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full blur-3xl opacity-20"
                      animate={{ 
                        scale: [1.2, 1, 1.2],
                        opacity: [0.3, 0.2, 0.3]
                      }}
                      transition={{ 
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <motion.img 
                      src="https://www.afifmedya.my.id/_next/image?url=https%3A%2F%2Fapi.lanyard.rest%2F481734993622728715.png&w=256&q=75" 
                      alt="Profile Picture" 
                      className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full object-cover border-4 border-white shadow-2xl hover:shadow-3xl transition-all duration-300"
                      whileHover={{ 
                        scale: 1.05,
                        boxShadow: "0 0 30px rgba(59,130,246,0.3)"
                      }}
                    />
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.section>

          {/* About Section */}
          <motion.section 
            id="about" 
            className="min-h-screen py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-3xl font-bold mb-8 text-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  About Me
                </span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-white/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 mx-4 sm:mx-0">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Who Am I?</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    I'm a backend-focused developer who loves turning complex logic into elegant solutions. From APIs to databases, I build the engines that keep modern web apps running smoothly.
                    </p>
                  </div>

                  <div className="bg-white/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 mx-4 sm:mx-0">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Programming Languages</h3>
                    <div className="space-y-4">
                      {/* JavaScript */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">JavaScript</span>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">24.09%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '24.09%' }}></div>
                        </div>
                      </div>

                      {/* Blade Template */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Blade Template</span>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">13.63%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '13.63%' }}></div>
                        </div>
                      </div>

                      {/* Dart */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dart</span>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">10.90%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-400 h-2 rounded-full" style={{ width: '10.90%' }}></div>
                        </div>
                      </div>

                      {/* Java */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Java</span>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">10.26%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full" style={{ width: '10.26%' }}></div>
                        </div>
                      </div>

                      {/* TypeScript */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">TypeScript</span>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">8.87%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '8.87%' }}></div>
                        </div>
                      </div>

                      {/* PHP */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">PHP</span>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">8.40%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: '8.40%' }}></div>
                        </div>
                      </div>

                      {/* Python */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Python</span>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">5.45%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '5.45%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <DiscordStatus />

                  <div className="bg-white/50 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100">
                    <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">Experience</h3>
                    <div className="space-y-6">
                      {/* Current Experience */}
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Backend Developer (Freelance)</h4>
                            <span className="text-sm text-gray-500 dark:text-gray-400">2022 - Present</span>
                          </div>
                          <p className="text-blue-600 dark:text-blue-400 mb-1">Projects.co.id</p>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">Developed and maintained server-side applications for various clients using technologies like Node.js and Laravel.</p>
                        </div>
                      </div>

                      {/* Internship */}
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white">Web Development Intern</h4>
                            <span className="text-sm text-gray-500 dark:text-gray-400">2024</span>
                          </div>
                          <p className="text-yellow-600 dark:text-yellow-400 mb-1">Sada Technology</p>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">Focused on learning modern web development practices, including backend fundamentals, version control with Git, and collaborative workflows.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.section>

          {/* Projects Section */}
          <motion.section 
            id="projects" 
            className="min-h-screen py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="max-w-6xl mx-auto px-4"
            >
              <h2 className="text-3xl font-bold mb-12 text-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  Featured Projects
                </span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Todos-Nodejs */}
                <motion.div
                  whileHover={{ y: -5 }}
                  className="group bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-800 overflow-hidden"
                >
                  <ProjectImage 
                    src="https://raw.githubusercontent.com/ItzApipAjalah/Todos-Nodejs/main/public/images/todo-preview.png"
                    alt="Todos-Nodejs Preview"
                    projectName="Todos-Nodejs"
                  />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Todos-Nodejs</h3>
                      <div className="flex space-x-2">
                        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">EJS</span>
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">Node.js</span>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      A simple todo application built with Node.js and EJS templating engine.
                    </p>
                    <div className="flex items-center justify-between">
                      <a href="https://github.com/ItzApipAjalah/Todos-Nodejs" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">View Project →</a>
                      <div className="flex space-x-2">
                        <a href="https://github.com/ItzApipAjalah/Todos-Nodejs" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* NoteApp */}
                <motion.div
                  whileHover={{ y: -5 }}
                  className="group bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-800 overflow-hidden"
                >
                  <ProjectImage 
                    src="https://raw.githubusercontent.com/ItzApipAjalah/noteapp/main/assets/images/noteapp-preview.png"
                    alt="NoteApp Preview"
                    projectName="NoteApp"
                  />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white">NoteApp</h3>
                      <div className="flex space-x-2">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">Flutter</span>
                        <span className="px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full">Dart</span>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      A Flutter-based note-taking application with local storage capabilities.
                    </p>
                    <div className="flex items-center justify-between">
                      <a href="https://github.com/ItzApipAjalah/noteapp" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">View Project →</a>
                      <div className="flex space-x-2">
                        <a href="https://github.com/ItzApipAjalah/noteapp" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Memory Game */}
                <motion.div
                  whileHover={{ y: -5 }}
                  className="group bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-800 overflow-hidden"
                >
                  <ProjectImage 
                    src="https://raw.githubusercontent.com/ItzApipAjalah/memory_game_flutter/main/assets/images/memory-game-preview.png"
                    alt="Memory Game Preview"
                    projectName="Memory Game"
                  />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Memory Game</h3>
                      <div className="flex space-x-2">
                        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">Flutter</span>
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">Dart</span>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      A memory matching game built with Flutter for mobile devices.
                    </p>
                    <div className="flex items-center justify-between">
                      <a href="https://github.com/ItzApipAjalah/memory_game_flutter" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">View Project →</a>
                      <div className="flex space-x-2">
                        <a href="https://github.com/ItzApipAjalah/memory_game_flutter" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Custom Project Card Template */}
                <motion.div
                  whileHover={{ y: -5 }}
                  className="group bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-800 overflow-hidden"
                >
                  <ProjectImage 
                    src="https://raw.githubusercontent.com/ItzApipAjalah/astro-app/main/public/images/project-template.png"
                    alt="Project Template Preview"
                    projectName="New Project"
                  />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Your Project</h3>
                      <div className="flex space-x-2">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">Custom</span>
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">New</span>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Add your custom project description here.
                    </p>
                    <div className="flex items-center justify-between">
                      <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">View Project →</a>
                      <div className="flex space-x-2">
                        <a href="#" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.section>

          {/* Social Media Section */}
          <motion.section 
            id="social" 
            className="min-h-screen py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto px-4"
            >
              <h2 className="text-3xl font-bold mb-12 text-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  Let's Connect
                </span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/* Contact Info */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-white/50 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100"
                >
                  <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">Get in Touch</h3>
                  <div className="space-y-4">
                    <motion.a
                      href="mailto:amwp@afifmedya.my.id"
                      className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors"
                      whileHover={{ x: 5 }}
                    >
                      <Mail className="w-5 h-5" />
                      <span>amwp@afifmedya.my.id</span>
                    </motion.a>
                    <motion.div
                      className="flex items-center gap-3 text-gray-600"
                      whileHover={{ x: 5 }}
                    >
                      <Code2 className="w-5 h-5" />
                      <span>Backend Developer</span>
                    </motion.div>
                    <motion.div
                      className="flex items-center gap-3 text-gray-600"
                      whileHover={{ x: 5 }}
                    >
                      <ArrowDown className="w-5 h-5" />
                      <span>Available for Opportunities</span>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Social Links */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-white/50 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100"
                >
                  <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">Social Media</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <motion.a
                      href="https://github.com/ItzApipAjalah"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Github className="w-5 h-5" />
                      <span className="text-sm font-medium">GitHub</span>
                    </motion.a>
                    <motion.a
                      href="https://instagram.com/apip01____"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Instagram className="w-5 h-5 text-pink-500" />
                      <span className="text-sm font-medium">Instagram</span>
                    </motion.a>
                    <motion.a
                      href="https://www.linkedin.com/in/afif-medya-5ba201267/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Linkedin className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium">LinkedIn</span>
                    </motion.a>
                    <motion.a
                      href="mailto:amwp@afifmedya.my.id"
                      className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Mail className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium">Email</span>
                    </motion.a>
                  </div>
                </motion.div>
              </div>

              {/* Call to Action */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="text-center"
              >
                <motion.div
                  className="inline-block p-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <a
                    href="mailto:amwp@afifmedya.my.id"
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-opacity-90 transition-colors"
                  >
                    <Mail className="w-5 h-5 text-blue-600" />
                    <span className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                      Let's Work Together
                    </span>
                    <ArrowRight className="w-4 h-4 text-purple-600" />
                  </a>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.section>
        </AnimatePresence>
      </main>
    </div>
  );
} 