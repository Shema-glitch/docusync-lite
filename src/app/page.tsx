
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import {
  FileText,
  Users,
  Lock,
  Cloud,
  Cpu,
  ShieldCheck,
  ChevronRight,
  Twitter,
  Github,
  Linkedin,
  Disc,
  PlayCircle,
  Menu,
  X,
  Heart,
  Mail,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const MotionButton = motion(Button);
const MotionCard = motion(Card);

const navLinks = [
  { name: 'Features', href: '#features' },
  { name: 'Showcase', href: '#showcase' },
  { name: 'Enterprise', href: '#enterprise' },
];

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { theme, setTheme } = useTheme();

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg"
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-2"
                    >
                        <FileText className="h-8 w-8 text-primary" />
                        <span className="text-xl font-bold">DocuSync Lite</span>
                    </motion.div>

                    <nav className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link key={link.name} href={link.href} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    <div className="hidden md:flex items-center gap-4">
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

                    <div className="md:hidden">
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
                            {isOpen ? <X /> : <Menu />}
                        </Button>
                    </div>
                </div>
            </div>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="md:hidden absolute top-20 left-0 right-0 bg-background/95 pb-4"
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
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
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
          className="h-full w-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,_hsl(var(--primary)/0.3),_rgba(255,255,255,0))] bg-no-repeat"
          style={{
            background: 'radial-gradient(ellipse 80% 80% at 50% -20%, hsl(var(--primary)/0.2), transparent)',
            backgroundSize: '200% 200%',
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
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500 mt-2">
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
            <Link href="/signup">
                <MotionButton
                    size="lg"
                    className="w-full sm:w-auto text-lg font-semibold shadow-lg shadow-primary/20"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Join Waitlist
                </MotionButton>
            </Link>
            <MotionButton
              size="lg"
              variant="outline"
              className="w-full sm:w-auto text-lg font-semibold"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <PlayCircle className="mr-2" />
              Watch Preview
            </MotionButton>
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
                  src="https://picsum.photos/seed/docusync/1200/600"
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
                viewport={{ once: true, amount: 0.3 }}
                variants={cardVariants}
                className="bg-background/50 hover:bg-background/80 transition-colors duration-300 border-border/50 hover:border-primary/50 shadow-sm hover:shadow-lg"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 text-primary mb-6">
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
              duration: 4,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
            className="absolute -top-1/4 -left-1/4 h-1/2 w-1/2 bg-purple-500/20 rounded-full filter blur-3xl"
          />
          <motion.div
            animate={{
              transform: ['translateX(10%) translateY(10%)', 'translateX(-10%) translateY(-10%)'],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
            className="absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2 bg-primary/20 rounded-full filter blur-3xl"
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
                <Checkbox id="wishlist" checked={wishlisted} onCheckedChange={() => setWishlisted(!wishlisted)} />
                <Label htmlFor="wishlist" className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                    <Heart className={`h-5 w-5 transition-colors ${wishlisted ? 'text-red-500 fill-current' : ''}`} />
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
    const [index, setIndex] = useState(0);

    return (
        <section id="showcase" className="py-20 lg:py-32 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative h-[600px] w-full max-w-5xl mx-auto overflow-hidden rounded-2xl border bg-muted/20">
                    <AnimatePresence initial={false}>
                        <motion.img
                            key={index}
                            src={carouselItems[index].image}
                            alt={carouselItems[index].caption}
                            data-ai-hint={carouselItems[index].dataAiHint}
                            initial={{ opacity: 0, x: 300 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -300 }}
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                    </AnimatePresence>
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                        <h3 className="text-2xl font-bold text-white">{carouselItems[index].caption}</h3>
                    </div>
                </div>
                <div className="flex justify-center gap-2 mt-6">
                    {carouselItems.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setIndex(i)}
                            className={`h-2 w-8 rounded-full transition-colors ${i === index ? 'bg-primary' : 'bg-muted-foreground/50'}`}
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
            <div className="mt-10">
                <Button size="lg" variant="outline">
                    Contact Enterprise <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
            </div>
        </div>
    </section>
);

const Footer = () => (
    <footer className="relative py-12 bg-muted/30">
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-background to-transparent" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                    <span className="font-bold">DocuSync Lite</span>
                </div>
                <div className="flex gap-6 text-sm text-muted-foreground">
                    <Link href="#" className="hover:text-primary">Privacy Policy</Link>
                    <Link href="#" className="hover:text-primary">Terms</Link>
                    <Link href="#" className="hover:text-primary">Contact</Link>
                    <Link href="#" className="hover:text-primary">Docs</Link>
                </div>
                <div className="flex gap-6">
                    <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter /></Link>
                    <Link href="#" className="text-muted-foreground hover:text-primary"><Github /></Link>
                    <Link href="#" className="text-muted-foreground hover:text-primary"><Linkedin /></Link>
                    <Link href="#" className="text-muted-foreground hover:text-primary"><Disc /></Link>
                </div>
            </div>
            <p className="mt-8 text-center text-sm text-muted-foreground">© 2025 DocuSync Lite. Built for creators, thinkers, and teams.</p>
        </div>
    </footer>
);

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <WaitlistSection />
        <ShowcaseSection />
        <EnterpriseSection />
      </main>
      <Footer />
    </div>
  );
}
