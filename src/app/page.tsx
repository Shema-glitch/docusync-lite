
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import {
  FileText,
  Users,
  Cloud,
  Cpu,
  ShieldCheck,
  ChevronRight,
  Menu,
  X,
  Heart,
  Mail,
  PlayCircle,
  Disc,
  Twitter,
  Github,
  Linkedin,
  ArrowUp,
  Moon,
  Sun
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import useEmblaCarousel from 'embla-carousel-react'

const MotionButton = motion(Button);
const MotionCard = motion(Card);

const navLinks = [
  { name: 'Features', href: '#features' },
  { name: 'Showcase', href: '#showcase' },
  { name: 'Enterprise', href: '#enterprise' },
  { name: 'Waitlist', href: '#waitlist' },
];

const useActiveSection = (sectionIds: string[]) => {
    const [activeSection, setActiveSection] = useState<string>(sectionIds[0]);
    
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, { rootMargin: "-50% 0px -50% 0px" });

        sectionIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => {
            sectionIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) observer.unobserve(el);
            });
        };
    }, [sectionIds]);

    return activeSection;
}

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { theme, setTheme } = useTheme();
    const activeSection = useActiveSection(['hero', 'features', 'showcase', 'enterprise', 'waitlist']);

    const ThemeToggle = () => (
      <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
      </Button>
    );

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md"
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-primary">
                            <path d="M12.378 1.602a.75.75 0 00-.756 0L3 7.232V18a1.5 1.5 0 001.5 1.5h15A1.5 1.5 0 0021 18V7.232l-8.622-5.63zM12 7.5a.75.75 0 01.75.75v3.69l3.44-2.293a.75.75 0 01.912 1.214l-4.25 2.833a.75.75 0 01-.912 0L7.898 11.16a.75.75 0 01.912-1.213L11.25 11.94V8.25A.75.75 0 0112 7.5z" />
                        </svg>
                        <span className="text-xl font-bold">DocuSync Lite</span>
                    </motion.div>

                    <nav className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link key={link.name} href={link.href} className="relative text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                                {link.name}
                                {activeSection === link.href.substring(1) && (
                                    <motion.div 
                                      className="absolute bottom-[-6px] left-0 right-0 h-0.5 bg-primary"
                                      layoutId="underline"
                                      />
                                )}
                            </Link>
                        ))}
                    </nav>

                    <div className="hidden md:flex items-center gap-2">
                        <ThemeToggle />
                        <Link href="/login">
                            <Button variant="ghost">Log In</Button>
                        </Link>
                        <Link href="/signup">
                          <MotionButton
                            className="bg-primary hover:bg-primary/90"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                           >
                            Sign Up
                          </MotionButton>
                        </Link>
                    </div>

                    <div className="md:hidden flex items-center">
                        <ThemeToggle />
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
                            {isOpen ? <X /> : <Menu />}
                        </Button>
                    </div>
                </div>
            </div>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden absolute top-20 left-0 right-0 bg-background/95 pb-4 border-b"
                    >
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <Link key={link.name} href={link.href} className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                                    {link.name}
                                </Link>
                            ))}
                            <div className="flex flex-col gap-4 mt-4">
                                <Link href="/login">
                                    <Button variant="outline" className="w-full">Log In</Button>
                                </Link>
                                <Link href="/signup">
                                    <Button className="w-full">Sign Up</Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
};

const HeroSection = () => {
  return (
    <section id="hero" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="h-full w-full bg-cover"
          style={{
            backgroundImage: 'radial-gradient(ellipse 80% 80% at 50% -20%, hsl(var(--primary)/0.2), transparent)',
          }}
        />
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight">
              Create. Sync. Collaborate.
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-orange-400 mt-2">
                Effortlessly.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
              DocuSync Lite connects teams through powerful, real-time document sync technology.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="#waitlist">
                <Button size="lg">
                    Join Waitlist
                    <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
            </Link>
            <Button size="lg" variant="outline">
              <PlayCircle className="mr-2" />
              Watch Preview
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4, type: 'spring', stiffness: 100 }}
          className="mt-16 lg:mt-24"
        >
          <div className="relative">
            <MotionCard className="max-w-4xl mx-auto p-2 bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl shadow-primary/10">
              <CardContent className="p-0">
                <img
                  src="https://picsum.photos/seed/docusync-app/1200/600"
                  alt="DocuSync App Mockup"
                  className="rounded-lg"
                  data-ai-hint="app interface"
                />
              </CardContent>
            </MotionCard>
          </div>
        </motion.div>
      </div>
    </section>
  );
};


const features = [
  { icon: Users, title: 'Real-time Collaboration', description: 'Work together on the same document, at the same time, without conflicts.' },
  { icon: Cloud, title: 'Lite Cloud Sync Engine', description: 'Seamlessly sync your work across all devices, even when you are offline.' },
  { icon: FileText, title: 'Smart Document Structuring', description: 'Organize your thoughts and content with our intuitive and flexible editor.' },
  { icon: ShieldCheck, title: 'Enterprise-grade Security', description: 'Your data is protected with end-to-end encryption and robust access controls.' },
  { icon: Cpu, title: 'AI Smart Suggestions', description: 'Enhance your writing and find insights with intelligent AI-powered assistance.' },
  { icon: Disc, title: 'Cross-Platform Support', description: 'Access DocuSync Lite on any device — web, desktop, and mobile.' },
];

const FeaturesSection = () => {
  const cardVariants = {
    offscreen: {
      y: 50,
      opacity: 0,
    },
    onscreen: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 50,
        delay: i * 0.1,
      },
    }),
  };

  return (
    <section id="features" className="py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Why DocuSync Lite?</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">Everything you need to move ideas forward, faster.</p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <MotionCard
                key={feature.title}
                custom={i}
                initial="offscreen"
                whileInView="onscreen"
                whileHover={{ y: -5, scale: 1.02, boxShadow: "0px 10px 30px -5px hsla(var(--primary), 0.2)"}}
                viewport={{ once: true, amount: 0.3 }}
                variants={cardVariants}
                className="bg-card/50 hover:bg-card transition-all duration-300 border-border/50 hover:border-primary/50 shadow-sm hover:shadow-xl"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-primary/10 to-purple-500/10 text-primary mb-6">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="mt-2 text-muted-foreground">{feature.description}</p>
                </CardContent>
              </MotionCard>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const WaitlistSection = () => {
    const [wishlisted, setWishlisted] = useState(false);
  
    return (
      <section id="waitlist" className="relative py-20 lg:py-32 bg-muted/30 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.div
            animate={{
              transform: ['translateX(-10%) translateY(-10%)', 'translateX(10%) translateY(10%)'],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
            className="absolute -top-1/4 -left-1/4 h-1/2 w-1/2 bg-purple-500/10 rounded-full filter blur-3xl"
          />
          <motion.div
            animate={{
              transform: ['translateX(10%) translateY(10%)', 'translateX(-10%) translateY(-10%)'],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
            className="absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2 bg-primary/10 rounded-full filter blur-3xl"
          />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Be Part of the Sync Revolution.</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">12,000+ professionals are already on the waitlist. Join them to get early access and exclusive updates.</p>
          </div>
          <div className="mt-12 max-w-xl mx-auto">
            <form className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter your email to get notified"
                  className="pl-10 h-14 text-lg"
                  required
                />
              </div>
              <MotionButton
                type="submit"
                size="lg"
                className="h-14 text-lg font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Notified
              </MotionButton>
            </form>
            <div className="mt-6 flex items-center justify-center gap-4">
                <Checkbox id="wishlist" checked={wishlisted} onCheckedChange={(checked) => setWishlisted(!!checked)} />
                <Label htmlFor="wishlist" className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                    <Heart className={cn(`h-5 w-5 transition-all`, wishlisted ? 'text-red-500 fill-current' : '')} />
                    Add to Wishlist
                </Label>
            </div>
          </div>
        </div>
      </section>
    );
};

const carouselItems = [
    { image: "https://picsum.photos/seed/showcase1/1000/600", caption: "Sync in Real Time", dataAiHint: "collaboration interface" },
    { image: "https://picsum.photos/seed/showcase2/1000/600", caption: "Organize Like Never Before", dataAiHint: "dashboard view" },
    { image: "https://picsum.photos/seed/showcase3/1000/600", caption: "Team Flow. Redefined.", dataAiHint: "team workspace" },
    { image: "https://picsum.photos/seed/showcase4/1000/600", caption: "AI-Powered Insights", dataAiHint: "analytics chart" },
];
  
const ShowcaseSection = () => {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        if (!emblaApi) return;
        const onSelect = () => {
            setSelectedIndex(emblaApi.selectedScrollSnap());
        };
        emblaApi.on('select', onSelect);
        return () => { emblaApi.off('select', onSelect) };
    }, [emblaApi]);

    return (
        <section id="showcase" className="py-20 lg:py-32 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div ref={emblaRef} className="relative h-[600px] w-full max-w-5xl mx-auto overflow-hidden rounded-2xl border bg-muted/20">
                    <div className="flex h-full">
                        {carouselItems.map((item, i) => (
                            <div className="relative flex-[0_0_100%] h-full" key={i}>
                                <AnimatePresence>
                                {i === selectedIndex && (
                                    <motion.img
                                        key={i}
                                        src={item.image}
                                        alt={item.caption}
                                        data-ai-hint={item.dataAiHint}
                                        initial={{ opacity: 0, scale: 1.05 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.05 }}
                                        transition={{ duration: 0.8, ease: 'easeInOut' }}
                                        className="absolute inset-0 h-full w-full object-cover"
                                    />
                                )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                     <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                        <h3 className="text-2xl font-bold text-white">{carouselItems[selectedIndex].caption}</h3>
                    </div>
                </div>
                <div className="flex justify-center gap-2 mt-6">
                    {carouselItems.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => emblaApi?.scrollTo(i)}
                            className={cn('h-2 w-8 rounded-full transition-colors', i === selectedIndex ? 'bg-primary' : 'bg-muted-foreground/50')}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

const EnterpriseSection = () => (
    <section id="enterprise" className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-muted-foreground to-foreground">
                "Trusted by teams, built for enterprise."
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">Secure, scalable, and ready for the most demanding workflows.</p>
            <div className="mt-10 flex justify-center gap-4">
                <Button size="lg" variant="outline">
                    Schedule a Demo
                </Button>
                <Button size="lg">
                    Contact Enterprise <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
            </div>
        </div>
    </section>
);

const Footer = () => (
    <footer className="relative py-12 bg-muted/30 border-t">
         <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-background to-transparent" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-muted-foreground">
                        <path d="M12.378 1.602a.75.75 0 00-.756 0L3 7.232V18a1.5 1.5 0 001.5 1.5h15A1.5 1.5 0 0021 18V7.232l-8.622-5.63zM12 7.5a.75.75 0 01.75.75v3.69l3.44-2.293a.75.75 0 01.912 1.214l-4.25 2.833a.75.75 0 01-.912 0L7.898 11.16a.75.75 0 01.912-1.213L11.25 11.94V8.25A.75.75 0 0112 7.5z" />
                    </svg>
                    <span className="font-bold">DocuSync Lite</span>
                </div>
                <div className="flex gap-6 text-sm text-muted-foreground">
                    <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
                    <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
                    <Link href="#" className="hover:text-primary transition-colors">Contact</Link>
                </div>
                <div className="flex gap-6">
                    <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Twitter /></Link>
                    <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Github /></Link>
                    <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Linkedin /></Link>
                    <Link href="#" className="text-muted-foreground hover:text-primary transition-colors"><Disc /></Link>
                </div>
            </div>
            <p className="mt-8 text-center text-sm text-muted-foreground">© 2025 DocuSync Lite. Built for creators, thinkers, and teams.</p>
        </div>
    </footer>
);

const ScrollToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        if (window.pageYOffset > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    return (
        <AnimatePresence>
        {isVisible && (
            <MotionButton
                onClick={scrollToTop}
                className="fixed bottom-8 right-8 z-50 h-12 w-12 rounded-full shadow-lg"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Scroll to top"
            >
                <ArrowUp className="h-6 w-6" />
            </MotionButton>
        )}
        </AnimatePresence>
    );
};


export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="bg-background text-foreground">
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-50" style={{ scaleX }} />
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <WaitlistSection />
        <ShowcaseSection />
        <EnterpriseSection />
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
}
