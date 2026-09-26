import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowUpRight,
  GitBranch,
  Layers,
  Box,
  ShoppingCart,
  Truck,
  BookOpen,
  ExternalLink,
  Code2,
  Database,
  CreditCard,
  MailCheck,
  Smartphone
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    type: 'Business Central',
    title: 'Al Jazira — Navision 2009 R2 to BC 23',
    description: 'Migrated a legacy Navision 2009 R2 system to Business Central 23, delivering a seamless data migration with improved performance and expanded platform functionality.',
    icon: Database,
    color: '#2e5bff',
    tags: ['NAV 2009 R2', 'BC 23', 'Data Migration']
  },
  {
    type: 'Business Central',
    title: 'Maldives Duty Free — NAV 2016 to BC 23',
    description: 'End-to-end NAV 2016 to Business Central 23 upgrade — data preparation through go-live. Extended BC–Magento and BC–WordPress integrations to support custom fields.',
    icon: GitBranch,
    color: '#00f2fe',
    tags: ['Duty Free', 'BC 23', 'BC–Magento']
  },
  {
    type: 'Business Central',
    title: 'African & Eastern — NAV 2016 to BC 24',
    description: 'Upgraded NAV 2016 to Business Central 24 and customized modules to unique business requirements. Delivered advanced API integration between Business Central and Magento.',
    icon: ShoppingCart,
    color: '#ff2e63',
    tags: ['BC 24', 'Magento API', 'Retail']
  },
  {
    type: 'Business Central',
    title: 'Mister Baker — BC 24 Upgrade',
    description: 'Executed a complex Business Central 24 upgrade with minimal downtime, unlocking the latest platform features and optimizations for hospitality operations.',
    icon: Layers,
    color: '#ff9f43',
    tags: ['BC 24', 'Hospitality', 'Zero Downtime']
  },
  {
    type: 'Business Central',
    title: 'Nazih Trading — BC 25 to BC 28',
    description: 'Upgraded Business Central 25 to 28, developed RDLC reports and implemented a license-date driven auto-lock control for regulated licensing scenarios.',
    icon: GitBranch,
    color: '#08fdd8',
    tags: ['BC 28', 'RDLC', 'Auto-lock']
  },
  {
    type: 'Payments',
    title: 'DLL-Based EFT Device Integration (NAV / MDFP)',
    description: 'Designed and developed a .NET DLL acting as the middleware bridge between EFT payment terminals and Microsoft Dynamics NAV / MDFP — covering hardware communication, transaction processing, status management and error handling.',
    icon: CreditCard,
    color: '#2ee6a8',
    tags: ['.NET DLL', 'EFT', 'Payments']
  },
  {
    type: 'LS Central',
    title: 'PAX A35 EFT Integration in LS Central POS',
    description: 'Engineered a secure PAX A35 payment terminal integration for LS Central POS using AL control add-ins, delivering real-time transaction status and reliable card payments at the till.',
    icon: CreditCard,
    color: '#00f2fe',
    tags: ['Control Add-in', 'PAX A35', 'LS Central']
  },
  {
    type: 'E-Commerce',
    title: 'Comicave & Outmall — BC × Magento',
    description: 'Developed and implemented API integrations between Business Central and Magento, enabling real-time inventory synchronization and order processing across systems.',
    icon: ShoppingCart,
    color: '#a55eea',
    tags: ['Magento', 'REST API', 'Inventory Sync']
  },
  {
    type: 'App Development',
    title: 'QBL Delivery Management App (BC)',
    description: 'Led end-to-end development of a delivery management application as Senior Developer, streamlining route planning and real-time tracking to optimize logistics operations.',
    icon: Truck,
    color: '#08fdd8',
    tags: ['Logistics', 'Mobile', 'BC']
  },
  {
    type: 'MAUI',
    title: 'Mini ERP (.NET + React Native)',
    description: 'Cross-platform Mini ERP built with .NET MAUI covering inventory, sales and purchase workflows — designed for small businesses that need lightweight ERP capability on desktop and mobile.',
    icon: Layers,
    color: '#ff9f43',
    tags: ['.NET MAUI', 'Cross-platform', 'ERP']
  },
  {
    type: 'MAUI',
    title: 'Mobile Billing App + Web Dashboard (.NET MAUI)',
    description: 'Mobile billing application built with .NET MAUI, linked to a live dashboard for real-time sales, invoice and revenue tracking across devices.',
    icon: Smartphone,
    color: '#ff2e63',
    tags: ['.NET MAUI', 'Billing', 'Dashboard']
  },
  {
    type: 'Automation',
    title: 'Cloudspace Mail Automation & Upgrade',
    description: 'Designed automated email workflows that eliminated manual notification processes, and led the platform upgrade to the latest version to improve stability and performance.',
    icon: MailCheck,
    color: '#ff5e7d',
    tags: ['Email Automation', 'Upgrade', 'Workflows']
  },
  {
    type: '.NET',
    title: 'Library Management System (.NET)',
    description: 'Full-stack library management system covering cataloging, lending and reporting to streamline end-to-end library operations.',
    icon: BookOpen,
    color: '#2e5bff',
    tags: ['.NET', 'Full-stack', 'CRUD']
  }
];

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(
        headerRef.current,
        { y: 50, opacity: 0, filter: 'blur(10px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Cards staggered reveal with 3D effect
      const cards = gridRef.current?.querySelectorAll('.project-card');
      if (cards) {
        cards.forEach((card, i) => {
          gsap.fromTo(
            card,
            { 
              y: 80, 
              opacity: 0, 
              rotateX: 15,
              scale: 0.9
            },
            {
              y: 0,
              opacity: 1,
              rotateX: 0,
              scale: 1,
              duration: 0.8,
              delay: i * 0.1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: gridRef.current,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="relative min-h-screen py-32 px-6 lg:px-12 overflow-hidden"
    >
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#2e5bff]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#00f2fe]/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div ref={headerRef} className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <Box size={16} className="text-[#2e5bff]" />
            <span className="text-sm text-white/60 font-medium tracking-wider uppercase">Portfolio</span>
          </div>
          
          <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl text-white mb-6">
            Featured{' '}
            <span className="bg-gradient-to-r from-[#2e5bff] to-[#00f2fe] bg-clip-text text-transparent">
              Projects
            </span>
          </h2>
          
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            Key implementations and migrations I've led, delivering enterprise-grade solutions across diverse industries
          </p>
        </div>

        {/* Projects Grid */}
        <div 
          ref={gridRef} 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 perspective-1000"
        >
          {projects.map((project, index) => (
            <div
              key={index}
              className="project-card group relative p-6 rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Hover gradient overlay */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(circle at 50% 0%, ${project.color}15, transparent 70%)`
                }}
              />

              {/* Top accent line */}
              <div 
                className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 scale-x-0 group-hover:scale-x-100"
                style={{
                  background: `linear-gradient(90deg, transparent, ${project.color}, transparent)`,
                  transformOrigin: 'center'
                }}
              />

              {/* Project Type Badge */}
              <div className="relative flex items-center justify-between mb-4">
                <span 
                  className="px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider"
                  style={{
                    background: `${project.color}15`,
                    color: project.color,
                    border: `1px solid ${project.color}30`
                  }}
                >
                  {project.type}
                </span>
                
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{
                    background: `${project.color}10`,
                    border: `1px solid ${project.color}20`
                  }}
                >
                  <project.icon size={20} style={{ color: project.color }} />
                </div>
              </div>

              {/* Content */}
              <div className="relative">
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-white/90 transition-colors line-clamp-2">
                  {project.title}
                </h3>
                
                <p className="text-white/50 text-sm leading-relaxed mb-4 line-clamp-3 group-hover:text-white/60 transition-colors">
                  {project.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag, i) => (
                    <span 
                      key={i}
                      className="text-xs text-white/40 px-2 py-1 rounded-md bg-white/5 group-hover:bg-white/10 transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Action Link */}
                <div className="flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0" style={{ color: project.color }}>
                  <span>View Details</span>
                  <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </div>

              {/* Corner decoration */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-20 transition-opacity">
                <Code2 size={48} style={{ color: project.color }} />
              </div>

              {/* Hover border glow */}
              <div 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  boxShadow: `inset 0 0 20px ${project.color}10`
                }}
              />
            </div>
          ))}
        </div>

        {/* View All CTA */}
        <div className="mt-16 text-center">
          <button className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full overflow-hidden transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-[#2e5bff]/20 to-[#00f2fe]/20 border border-white/10 rounded-full group-hover:border-white/20 transition-colors" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#2e5bff] to-[#00f2fe] opacity-0 group-hover:opacity-20 transition-opacity" />
            
            <span className="relative text-white font-medium flex items-center gap-2">
              View All Projects
              <ExternalLink size={18} className="group-hover:rotate-12 transition-transform" />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}