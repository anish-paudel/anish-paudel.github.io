import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Boxes, 
  Database, 
  Code2, 
  Globe, 
  Server,
  Cpu,
  Cloud,
  Shield,
  X
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);


interface Skill {
  icon:  React.ElementType;   // <-- important
  title: string;
  description: string;
  level: number;
  category:  'Core' | 'Integration' | 'DevOps';
  color: string;
}

const skills: Skill[] = [
  {
    icon: Boxes,
    title: 'AL Language',
    description: 'Building complex business logic and extensions for the D365 ecosystem with clean, maintainable code architecture.',
    level: 95,
    category: 'Core',
    color: '#2e5bff',
  },
  {
    icon: Database,
    title: 'Business Central',
    description: 'Expertise in SaaS and On-Premise ERP architecture, configuration, and enterprise customization.',
    level: 92,
    category: 'Core',
    color: '#2e5bff',
  },
  {
    icon: Code2,
    title: '.NET Core',
    description: 'Developing robust middleware and standalone enterprise applications with C# and modern patterns.',
    level: 88,
    category: 'Core',
    color: '#00f2fe',
  },
  {
    icon: Globe,
    title: 'API Integrations',
    description: 'Connecting ERP systems with OData, REST, and custom web services for seamless data flow.',
    level: 90,
    category: 'Integration',
    color: '#00f2fe',
  },
  {
    icon: Server,
    title: 'SQL Server',
    description: 'Database design, optimization, and complex query development for high-performance systems.',
    level: 85,
    category: 'Integration',
    color: '#00f2fe',
  },
  {
    icon: Cpu,
    title: 'Azure DevOps',
    description: 'CI/CD pipelines, version control strategies, and automated deployment architectures.',
    level: 82,
    category: 'DevOps',
    color: '#ff006e',
  },
  {
    icon: Cloud,
    title: 'Cloud Services',
    description: 'Azure cloud architecture, serverless solutions, and scalable infrastructure design.',
    level: 78,
    category: 'DevOps',
    color: '#ff006e',
  },
  {
    icon: Shield,
    title: 'Security',
    description: 'Implementing robust security practices, compliance standards, and data protection.',
    level: 80,
    category: 'DevOps',
    color: '#ff006e',
  },
];

const categories = ['All', 'Core', 'Integration', 'DevOps'] as const;

export default function Skills() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState<typeof categories[number]>('All');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter skills
  const filteredSkills = activeCategory === 'All' 
    ? skills 
    : skills.filter(s => s.category === activeCategory);

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading reveal
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Staggered card reveal
      const cards = gridRef.current?.querySelectorAll('.skill-card');
      if (cards) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 40, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [activeCategory]); // Re-run when category changes

  // Handle skill selection
  const handleSkillClick = useCallback((skill: Skill) => {
    if (isMobile) {
      setSelectedSkill(skill);
      document.body.style.overflow = 'hidden';
    }
  }, [isMobile]);

  const closeModal = useCallback(() => {
    setSelectedSkill(null);
    document.body.style.overflow = '';
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeModal]);

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="relative min-h-screen py-20 lg:py-32 px-4 sm:px-6 lg:px-8 xl:px-12 overflow-hidden bg-[#0a0a0f]"
    >
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(46, 91, 255, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(46, 91, 255, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Floating Orbs Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#2e5bff]/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00f2fe]/10 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <div ref={headingRef} className="mb-12 lg:mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-6">
            <div>
              <span className="text-[#2e5bff] text-sm font-semibold tracking-wider uppercase mb-2 block">
                Expertise
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
                Tech <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2e5bff] to-[#00f2fe]">Stack</span>
              </h2>
            </div>
            
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeCategory === cat
                      ? 'bg-[#2e5bff] text-white shadow-lg shadow-[#2e5bff]/25'
                      : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          <p className="text-white/50 text-base lg:text-lg max-w-2xl leading-relaxed">
            A comprehensive toolkit for building enterprise-grade solutions. 
            Each technology represents years of hands-on experience in production environments.
          </p>
        </div>

        {/* Skills Grid */}
        <div 
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6"
        >
          {filteredSkills.map((skill, index) => {
            const isHovered = hoveredSkill === skill.title;
            
            return (
              <div
                key={skill.title}
                className="skill-card group relative"
                onMouseEnter={() => setHoveredSkill(skill.title)}
                onMouseLeave={() => setHoveredSkill(null)}
                onClick={() => handleSkillClick(skill)}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div 
                  className={`
                    relative h-full p-5 lg:p-6 rounded-2xl border transition-all duration-500 cursor-pointer
                    ${isHovered 
                      ? 'bg-white/10 border-[#2e5bff]/50 scale-[1.02] shadow-2xl shadow-[#2e5bff]/10' 
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                    }
                  `}
                >
                  {/* Category Badge */}
                  <div 
                    className="absolute top-4 right-4 w-2 h-2 rounded-full"
                    style={{ backgroundColor: skill.color }}
                  />

                  {/* Icon */}
                  <div 
                    className={`
                      w-12 h-12 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-300
                      ${isHovered ? 'scale-110 rotate-3' : ''}
                    `}
                    style={{ 
                      backgroundColor: `${skill.color}15`,
                    }}
                  >
                  </div>
                  {/* Content */}
                  <h3 className="text-lg lg:text-xl font-semibold text-white mb-2 group-hover:text-[#2e5bff] transition-colors">
                    {skill.title}
                  </h3>
                  
                  <p className="text-white/50 text-sm leading-relaxed mb-4 line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                    {skill.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/40">Proficiency</span>
                      <span 
                        className="font-semibold"
                        style={{ color: skill.color }}
                      >
                        {skill.level}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ 
                          width: isHovered ? `${skill.level}%` : '0%',
                          backgroundColor: skill.color,
                          transitionDelay: isHovered ? '100ms' : '0ms'
                        }}
                      />
                    </div>
                  </div>

                  {/* Hover Glow */}
                  <div 
                    className={`
                      absolute inset-0 rounded-2xl transition-opacity duration-500 -z-10 blur-xl
                      ${isHovered ? 'opacity-30' : 'opacity-0'}
                    `}
                    style={{ backgroundColor: skill.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats Summary */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8">
          {[
            { label: 'Years Experience', value: '5+' },
            { label: 'Projects Delivered', value: '50+' },
            { label: 'Technologies', value: skills.length.toString() },
            { label: 'Certifications', value: '3' },
          ].map((stat) => (
            <div 
              key={stat.label}
              className="text-center p-6 rounded-2xl bg-white/5 border border-white/10"
            >
              <div className="text-3xl lg:text-4xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-white/40">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Detail Modal */}
      {selectedSkill && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm md:hidden"
          onClick={closeModal}
        >
          <div 
            className="relative w-full max-w-sm bg-[#1a1a2e] border border-white/10 rounded-3xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60"
            >
              <X size={18} />
            </button>

            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ backgroundColor: `${selectedSkill.color}20` }}
            >
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">{selectedSkill.title}</h3>
            <span 
              className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-4"
              style={{ 
                backgroundColor: `${selectedSkill.color}20`,
                color: selectedSkill.color 
              }}
            >
              {selectedSkill.category}
            </span>

            <p className="text-white/60 text-sm leading-relaxed mb-6">
              {selectedSkill.description}
            </p>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Proficiency</span>
                <span className="font-semibold text-white">{selectedSkill.level}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${selectedSkill.level}%`,
                    backgroundColor: selectedSkill.color 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}