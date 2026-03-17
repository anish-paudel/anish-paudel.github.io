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
  Database
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const projects = [
  {
    type: 'Business Central',
    title: 'Aljaziraa NAV 2009 to BC 2022 Upgrade',
    description: 'Complete migration of legacy NAV 2009 system to modern Business Central 2022, including data migration, custom code upgrade, and user training.',
    icon: Database,
    color: '#2e5bff',
    tags: ['Migration', 'Data Upgrade', 'Training']
  },
  {
    type: 'Business Central',
    title: 'TBH NAV 2016 to BC 2022 Upgrade',
    description: 'Successfully upgraded NAV 2016 to Business Central 2022 with minimal downtime, ensuring business continuity throughout the transition.',
    icon: GitBranch,
    color: '#00f2fe',
    tags: ['Zero Downtime', 'BC 2022', 'Enterprise']
  },
  {
    type: 'Integration',
    title: 'African Eastern POS & API Integration',
    description: 'Developed POS customization and integrated with 3PL, EMR, Magento, WooCommerce, and WordPress for seamless omnichannel experience.',
    icon: ShoppingCart,
    color: '#ff2e63',
    tags: ['POS', 'API', 'E-commerce']
  },
  {
    type: 'App Development',
    title: 'QBL Delivery Management App',
    description: 'Led development of a comprehensive delivery management application as Senior Developer, optimizing logistics operations.',
    icon: Truck,
    color: '#08fdd8',
    tags: ['Logistics', 'Mobile', 'Optimization']
  },
  {
    type: 'Business Central',
    title: 'Afrina NAV 2019 to BC 2026 Migration',
    description: 'Complete migration from NAV 2019 to Business Central 2026, including custom extensions, reports, and third-party integrations.',
    icon: Layers,
    color: '#ff9f43',
    tags: ['BC 2026', 'Extensions', 'Reports']
  },
  {
    type: '.NET',
    title: 'Library Management System',
    description: 'Built a comprehensive library management system using .NET technologies with features for cataloging, lending, and reporting.',
    icon: BookOpen,
    color: '#a55eea',
    tags: ['.NET', 'Full-stack', 'Management']
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