import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mail, Send, Terminal, Copy, Check, Github, Linkedin, Twitter, ExternalLink } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface SocialLink {
  name: string;
  href: string;
  icon: React.ElementType;
  color: string;
}

const socialLinks: SocialLink[] = [
  { name: 'LinkedIn', href: 'https://linkedin.com/in/anishpaudel', icon: Linkedin, color: '#0077b5' },
  { name: 'GitHub', href: 'https://github.com/anish-paudel', icon: Github, color: '#ffffff' },
  { name: 'Twitter', href: 'https://twitter.com/anishpaudel', icon: Twitter, color: '#1da1f2' },
];

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [terminalText, setTerminalText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  const fullText = `> Initializing contact protocol...
> Loading profile data...
> Name: Anish Paudel
> Role: Technical Solutions Architect
> Location: Pokhara, Nepal
> Email: anishpaudel88@gmail.com
> Status: Available for global consulting
> Ready to connect...`;

  const startTyping = useCallback(() => {
    let index = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    const typeChar = () => {
      if (index < fullText.length) {
        setTerminalText(fullText.substring(0, index + 1));
        index++;
        const delay = Math.random() * 30 + 20;
        timeoutId = setTimeout(typeChar, delay);
      } else {
        setIsTypingComplete(true);
      }
    };

    timeoutId = setTimeout(typeChar, 500);
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
            onEnter: () => startTyping(),
          },
        }
      );

      gsap.fromTo(
        terminalRef.current,
        { opacity: 0, y: 50, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          delay: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [startTyping]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('anishpaudel88@gmail.com');
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSendEmail = () => {
    setIsSending(true);
    setTimeout(() => {
      window.location.href = 'mailto:anishpaudel88@gmail.com?subject=Project%20Inquiry&body=Hi%20Anish,%0A%0AI%20would%20like%20to%20discuss%20a%20project%20with%20you.';
      setIsSending(false);
    }, 600);
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative min-h-screen py-20 lg:py-32 flex flex-col justify-center overflow-hidden"
    >
      {/* Container with same padding as your other sections - adjust this to match your Skills section */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        
        {/* Header */}
        <div ref={contentRef} className="mb-12 lg:mb-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-4">
            <div>
              <span className="text-[#2e5bff] text-sm font-semibold tracking-wider uppercase mb-2 block">
                Get In Touch
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
                Let&apos;s <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2e5bff] to-[#00f2fe]">Connect</span>
              </h2>
            </div>
            <p className="text-white/50 text-base lg:text-lg max-w-md leading-relaxed">
              Ready to bring your ideas to life? I&apos;m available for consulting, collaborations, and new opportunities.
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Terminal - Takes 3 columns */}
          <div ref={terminalRef} className="lg:col-span-3">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#2e5bff]/20 to-[#00f2fe]/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                {/* Terminal Header */}
                <div className="flex items-center gap-3 px-4 py-3 bg-white/5 border-b border-white/10">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs text-white/40 font-mono flex items-center justify-center gap-2">
                      <Terminal size={12} />
                      contact.sh — anish@portfolio
                    </span>
                  </div>
                  <div className="w-16" />
                </div>

                {/* Terminal Body */}
                <div className="p-4 sm:p-6 font-mono text-xs sm:text-sm min-h-[240px] sm:min-h-[280px]">
                  <pre className="text-green-400 whitespace-pre-wrap leading-relaxed">
                    {terminalText}
                    <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}>
                      ▊
                    </span>
                  </pre>
                </div>

                {/* Terminal Footer */}
                <div className="px-4 sm:px-6 py-4 bg-white/5 border-t border-white/10">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleSendEmail}
                      disabled={isSending || !isTypingComplete}
                      className="flex-1 group flex items-center justify-center sm:justify-start gap-2 px-5 py-3 bg-[#2e5bff] text-white rounded-lg font-medium text-sm transition-all duration-300 hover:bg-[#1e4bef] hover:shadow-[0_0_20px_rgba(46,91,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Executing...</span>
                        </>
                      ) : (
                        <>
                          <Send size={16} className="group-hover:translate-x-1 transition-transform" />
                          <span>Start Conversation</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleCopyEmail}
                      className="group flex items-center justify-center gap-2 px-5 py-3 border border-white/20 text-white/80 rounded-lg font-medium text-sm transition-all duration-300 hover:border-[#2e5bff] hover:text-[#2e5bff] hover:bg-[#2e5bff]/10"
                    >
                      {isCopied ? (
                        <>
                          <Check size={16} className="text-green-400" />
                          <span className="text-green-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          <span>Copy Email</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs text-white/40 font-mono">
                    <Mail size={12} />
                    <span>anishpaudel88@gmail.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side Panel - Takes 2 columns */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Quick Info Card */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-colors">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2 text-lg">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Currently Available
              </h3>
              <p className="text-white/50 text-sm leading-relaxed mb-6">
                Open for freelance projects, consulting, and full-time opportunities. Based in Pokhara, Nepal, working globally with teams across all timezones.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Remote', 'Contract', 'Full-time'].map((tag) => (
                  <span 
                    key={tag}
                    className="px-4 py-2 rounded-full text-xs bg-white/5 text-white/60 border border-white/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 flex-1">
              <h3 className="text-white font-semibold mb-6 text-lg">Connect Online</h3>
              <div className="space-y-4">
                {socialLinks.map((social) => {
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                          style={{ backgroundColor: `${social.color}20` }}
                        >               
                        </div>
                        <div>
                          <div className="text-white font-medium">{social.name}</div>
                          <div className="text-white/40 text-sm">@{social.name.toLowerCase()}</div>
                        </div>
                      </div>
                      <ExternalLink size={18} className="text-white/20 group-hover:text-white/60 transition-colors" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Text */}
        <div className="mt-16 text-center">
          <p className="text-white/30 text-sm">
            Prefer a formal approach? Download my{' '}
            <a href="#" className="text-[#2e5bff] hover:underline">resume</a>
            {' '}or view my{' '}
            <a href="#" className="text-[#2e5bff] hover:underline">portfolio</a>
          </p>
        </div>
      </div>
    </section>
  );
}