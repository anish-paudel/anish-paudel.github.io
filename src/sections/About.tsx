import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Code2, Database, Cloud, Server, Cpu, Layers, Sparkles, MapPin, Globe } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const competencies = [
  { icon: Code2, text: 'Advanced AL Language Development', color: '#2e5bff' },
  { icon: Database, text: 'D365 Business Central Customization', color: '#00f2fe' },
  { icon: Server, text: 'Full-stack .NET & C# Integration', color: '#ff2e63' },
  { icon: Cloud, text: 'Cloud API & Microservices', color: '#08fdd8' },
  { icon: Cpu, text: 'SQL Server Optimization', color: '#ff9f43' },
  { icon: Layers, text: 'ERP Architecture Design', color: '#a55eea' },
];

const stats = [
  { value: '5+', label: 'Years', sublabel: 'Experience' },
  { value: '50+', label: 'Projects', sublabel: 'Delivered' },
  { value: '20+', label: 'Global', sublabel: 'Clients' },
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading glitch reveal with split text effect
      const headingTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });

      headingTl.fromTo(
        headingRef.current,
        { 
          clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)',
          opacity: 0,
          x: -50
        },
        {
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
          opacity: 1,
          x: 0,
          duration: 1.2,
          ease: 'power4.inOut',
        }
      );

      // Image mask reveal with scale
      gsap.fromTo(
        imageRef.current,
        { 
          clipPath: 'circle(0% at 50% 50%)',
          opacity: 0,
          scale: 0.8
        },
        {
          clipPath: 'circle(100% at 50% 50%)',
          opacity: 1,
          scale: 1,
          duration: 1.4,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Orbiting elements animation
      const orbits = orbitRef.current?.querySelectorAll('.orbit-ring');
      orbits?.forEach((orbit, i) => {
        gsap.to(orbit, {
          rotation: i % 2 === 0 ? 360 : -360,
          duration: 20 + i * 5,
          repeat: -1,
          ease: 'none',
        });
      });

      // Content lines stagger with blur
      const contentLines = contentRef.current?.querySelectorAll('.content-line');
      if (contentLines) {
        gsap.fromTo(
          contentLines,
          { 
            y: 60, 
            opacity: 0,
            filter: 'blur(10px)'
          },
          {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 1.2,
            stagger: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: contentRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Cards magnetic scatter/gather effect
      const cards = cardsRef.current?.querySelectorAll('.competency-card');
      if (cards) {
        cards.forEach((card, i) => {
          gsap.fromTo(
            card,
            { 
              x: (i % 2 === 0 ? -150 : 150) + (Math.random() - 0.5) * 100,
              y: (Math.random() - 0.5) * 100,
              opacity: 0,
              scale: 0.5,
              rotation: (Math.random() - 0.5) * 30
            },
            {
              x: 0,
              y: 0,
              opacity: 1,
              scale: 1,
              rotation: 0,
              duration: 1,
              delay: i * 0.1,
              ease: 'back.out(1.7)',
              scrollTrigger: {
                trigger: cardsRef.current,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        });
      }

      // Stats counter animation
      const statValues = sectionRef.current?.querySelectorAll('.stat-value');
      statValues?.forEach((stat) => {
        // const value = stat.getAttribute('data-value');
        gsap.fromTo(
          stat,
          { opacity: 0, scale: 0.5, y: 20 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.8,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: stat,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative min-h-screen py-32 px-6 lg:px-12 overflow-hidden"
    >
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#2e5bff]/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#00f2fe]/10 rounded-full blur-[120px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ff2e63]/5 rounded-full blur-[150px]" />
      </div>

      {/* Section Header */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <h2
          ref={headingRef}
          className="font-display text-5xl sm:text-6xl lg:text-8xl text-white mb-20 flex items-center gap-6"
        >
          <span className="bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
            ABOUT ME
          </span>
          <span className="flex-1 h-[2px] bg-gradient-to-r from-[#2e5bff] via-[#00f2fe] to-transparent opacity-50" />
          <Sparkles className="w-8 h-8 text-[#2e5bff] animate-pulse" />
        </h2>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          {/* Left Column - Bio & Image */}
          <div className="lg:col-span-5 space-y-10">
            {/* Profile Image with Orbiting Elements */}
            <div className="relative w-56 h-56 mx-auto lg:mx-0" ref={orbitRef}>
              {/* Outer glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#2e5bff]/30 to-[#00f2fe]/30 blur-2xl animate-pulse" />
              
              {/* Orbiting rings */}
              <div className="orbit-ring absolute inset-[-20px] rounded-full border border-[#2e5bff]/20 border-dashed" />
              <div className="orbit-ring absolute inset-[-40px] rounded-full border border-[#00f2fe]/10" />
              
              {/* Main image container */}
              <div
                ref={imageRef}
                className="relative w-full h-full rounded-full overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#2e5bff]/20 to-[#00f2fe]/20 backdrop-blur-sm border border-white/10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display text-7xl bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
                    AP
                  </span>
                </div>
                
                {/* Inner rotating border */}
                <div className="absolute inset-2 rounded-full border border-white/20 animate-spin" style={{ animationDuration: '15s' }} />
              </div>

              {/* Floating badges */}
              <div className="absolute -right-4 top-1/2 -translate-y-1/2 glass px-3 py-1.5 rounded-full flex items-center gap-2 animate-bounce">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-white/80 font-medium">Available</span>
              </div>
            </div>

            {/* Bio Content */}
            <div ref={contentRef} className="space-y-6">
              <div className="content-line flex items-center gap-2 text-[#00f2fe]">
                <MapPin size={16} />
                <span className="text-sm font-medium tracking-wider uppercase">Pokhara, Nepal</span>
              </div>

              <p className="content-line text-xl text-white/80 leading-relaxed font-light">
                I am a <span className="text-white font-semibold bg-gradient-to-r from-[#2e5bff] to-[#00f2fe] bg-clip-text text-transparent">
                  Technical Architect
                </span> specializing in Microsoft Dynamics 365 Business Central.
              </p>
              
              <p className="content-line text-lg text-white/60 leading-relaxed">
                My approach combines deep ERP logic with modern .NET engineering, 
                building "future-proof" extensions using the AL language.
              </p>
              
              <p className="content-line text-lg text-white/60 leading-relaxed flex items-start gap-2">
                <Globe size={20} className="mt-1 text-[#2e5bff] flex-shrink-0" />
                <span>Working globally to solve complex business workflow challenges 
                and deliver enterprise-grade solutions that scale.</span>
              </p>

              {/* CTA Button */}
              <div className="content-line pt-4">
                <button className="group relative px-8 py-3 rounded-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#2e5bff] to-[#00f2fe] opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative text-white font-medium flex items-center gap-2">
                    Download Resume
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Competencies */}
          <div className="lg:col-span-7 space-y-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/20" />
              <h3 className="font-display text-2xl text-white/40 uppercase tracking-[0.2em]">
                Core Competencies
              </h3>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/20" />
            </div>
            
            <div ref={cardsRef} className="grid sm:grid-cols-2 gap-4">
              {competencies.map((comp, index) => (
                <div
                  key={index}
                  className="competency-card group relative p-6 rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02]"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  {/* Hover gradient background */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle at 50% 0%, ${comp.color}20, transparent 70%)`
                    }}
                  />
                  
                  {/* Top accent line */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${comp.color}, transparent)`
                    }}
                  />

                  <div className="relative flex items-start gap-4">
                    <div 
                      className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                      style={{
                        background: `linear-gradient(135deg, ${comp.color}20, ${comp.color}10)`,
                        border: `1px solid ${comp.color}30`
                      }}
                    >
                      <comp.icon size={22} style={{ color: comp.color }} />
                    </div>
                    
                    <div className="flex-1">
                      <span className="text-white/90 text-sm font-medium leading-relaxed group-hover:text-white transition-colors block">
                        {comp.text}
                      </span>
                    </div>
                  </div>

                  {/* Corner decoration */}
                  <div className="absolute bottom-2 right-2 w-8 h-8 opacity-0 group-hover:opacity-30 transition-opacity">
                    <comp.icon size={32} style={{ color: comp.color }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-4 mt-12">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="group relative p-6 rounded-2xl text-center overflow-hidden transition-all duration-500 hover:scale-105"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  {/* Animated border on hover */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#2e5bff]/20 to-[#00f2fe]/20" />
                  </div>

                  <div className="relative">
                    <div 
                      className="stat-value font-display text-4xl sm:text-5xl mb-2 bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent"
                      data-value={stat.value}
                    >
                      {stat.value}
                    </div>
                    <div className="text-sm text-white/50 font-medium uppercase tracking-wider">
                      {stat.label}
                    </div>
                    <div className="text-xs text-white/30 mt-1">
                      {stat.sublabel}
                    </div>
                  </div>

                  {/* Decorative dot */}
                  <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-[#2e5bff]/50 group-hover:bg-[#00f2fe] transition-colors" />
                </div>
              ))}
            </div>

            {/* Tech Stack Marquee */}
            <div className="mt-12 overflow-hidden opacity-50">
              <div className="flex gap-8 animate-marquee whitespace-nowrap">
                {['AL Language', '.NET Core', 'C#', 'SQL Server', 'Azure', 'Docker', 'React', 'TypeScript', 'PowerShell'].map((tech, i) => (
                  <span key={i} className="text-sm text-white/40 font-mono flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2e5bff]" />
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for marquee animation */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </section>
  );
}