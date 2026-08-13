import React, { useState } from 'react';
import {
  Shield,
  Zap,
  Target,
  BarChart3,
  Globe2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Building2,
  Sparkles,
  Menu,
  Brain,
  Rocket,
  Users,
  TrendingUp,
  MapPin,
  Award,
  School,
  Library,
  ArrowRightCircle,
  ArrowLeftCircle,
  Instagram,
  Linkedin,
} from 'lucide-react';
import logo from '../assets/logo.png';

const SynzyHome = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Prof. Anita Sharma",
      title: "Dean of Admissions | IIT Delhi",
      quote: "The platform's analytics and insights have been invaluable. We can now target our outreach more effectively and have significantly improved our admission process efficiency.",
      bgColor: "bg-white"
    },
    {
      name: "Dr. Rajesh Kumar",
      title: "Principal | Delhi Public School, Mumbai",
      quote: "Synzy has revolutionized how we connect with prospective students. The AI matching is incredibly accurate, and we've seen a 40% increase in quality applications.",
      bgColor: "bg-white"
    },
    {
      name: "Mr. Vikram Patel",
      title: "Director | National Public School, Bangalore",
      quote: "As a school administrator, Synzy has made our admission process seamless. The quality of student profiles and the ease of management is outstanding.",
      bgColor: "bg-white"
    },
    {
      name: "Dr. Meera Iyer",
      title: "Vice Chancellor | Anna University, Chennai",
      quote: "The AI-powered recommendations have helped us discover talented students from across India. It's like having a smart recruitment team working 24/7.",
      bgColor: "bg-white"
    }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const cards = [
    {
      icon: <Brain className="w-10 h-10 text-purple-600" />,
      title: "AI-Powered Matching",
      desc: "Our advanced AI algorithms analyze preferences, performance, and requirements to create perfect matches between students and institutions.",
      color: "purple"
    },
    {
      icon: <Rocket className="w-10 h-10 text-blue-600" />,
      title: "Smart Discovery",
      desc: "Intelligent search and filtering system that helps students discover schools and colleges based on their unique needs and aspirations.",
      color: "blue"
    },
    {
      icon: <Target className="w-10 h-10 text-red-600" />,
      title: "Precision Targeting",
      desc: "Help your institution reach the right students with data-driven insights and targeted outreach capabilities.",
      color: "red"
    },
    {
      icon: <BarChart3 className="w-10 h-10 text-green-600" />,
      title: "Analytics Dashboard",
      desc: "Comprehensive analytics and insights to track engagement, applications, and optimize your institution's profile.",
      color: "green"
    },
    {
      icon: <Globe2 className="w-10 h-10 text-orange-600" />,
      title: "Pan-India Reach",
      desc: "Connect with students and institutions across India on a single unified platform, expanding your reach exponentially.",
      color: "orange"
    },
    {
      icon: <Shield className="w-10 h-10 text-indigo-600" />,
      title: "Verified Profiles",
      desc: "All institutions undergo thorough verification ensuring authentic and trustworthy connections for students and parents.",
      color: "indigo"
    }
  ];

  // Option 2 - Different icon choices
  const steps = [
    {
      icon: <School className="w-16 h-16 text-blue-600" />, // School icon for registration
      step: "STEP 1",
      title: "Register Your Institution",
      desc: "Create your school or college profile with detailed information about programs, facilities, achievements, and admission criteria."
    },
    {
      icon: <Brain className="w-16 h-16 text-purple-600" />, // Brain for AI processing
      step: "STEP 2",
      title: "AI Does the Magic",
      desc: "Our AI analyzes your profile and matches it with students based on their preferences, academic records, and career goals."
    },
    {
      icon: <TrendingUp className="w-16 h-16 text-green-600" />, // TrendingUp for growth
      step: "STEP 3",
      title: "Connect & Grow",
      desc: "Receive qualified leads, manage applications, and grow your institution with the right students who are the perfect fit."
    }
  ];

  const [hoveredCard, setHoveredCard] = useState(null);
  console.log(import.meta.env.VITE_COLLEGE_PORTAL_URL);
  return (
    <div className="w-full bg-white font-sans">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Synzy Logo" className="w-28 h-12" />
          {/* Synzy text removed */}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-gray-600">
          <button onClick={() => scrollToSection('ai-technology')} className="hover:text-gray-900">Features</button>
          <button onClick={() => scrollToSection('how-it-works')} className="hover:text-gray-900">How It Works</button>
          <a
            href={import.meta.env.VITE_SCHOOL_PORTAL_URL}
            className="px-4 py-2 bg-white border-2 border-gray-900 text-gray-600 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            User School
          </a>
          <a
            href={import.meta.env.VITE_COLLEGE_PORTAL_URL}
            className="px-4 py-2 bg-white border-2 border-gray-900 text-gray-600 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            User College
          </a>
          <a
            href={`${import.meta.env.VITE_SCHOOL_PORTAL_URL}/signup-school`}
            className="px-4 py-2 bg-white border-2 border-gray-900 text-gray-600 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            School Portal
          </a>

          <a
            href={`${import.meta.env.VITE_COLLEGE_PORTAL_URL}/signup-college`}
            className="px-4 py-2 text-gray-900 rounded-lg hover:bg-yellow-400 transition font-medium"
            style={{ backgroundColor: '#fae96d' }}
          >
            College Portal
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2">
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Main Content with Header Spacing */}
      <main className="pt-20">
        {/* AI Pill */}
        <div className="flex justify-center mt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
            style={{ backgroundColor: '#fef9e7', color: '#92400e' }}>
            <Sparkles className="w-4 h-4" style={{ color: '#fbbf24' }} />
            India's First AI-Powered Platform
          </div>
        </div>

        {/* Hero Section */}
        <section className="px-6 py-12 max-w-6xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-4 leading-tight">
            <span className="text-gray-900">Discover Your Perfect</span><br />
            <span className="text-gray-500">School & College</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-8">
            Transform education discovery with AI-powered insights. Connect students with the right institutions and help schools & colleges reach their ideal candidates.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <a href={`${import.meta.env.VITE_SCHOOL_PORTAL_URL}/signup-school`} className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-medium flex items-center justify-center gap-2 text-lg">
              Go to School Portal
            </a>
            <a href={`${import.meta.env.VITE_COLLEGE_PORTAL_URL}/signup-college`} className="px-8 py-3 bg-white text-gray-900 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium flex items-center justify-center gap-2 text-lg">
              Go to College Portal
            </a>
          </div>

          {/* Platform Highlights */}
          <div className="w-full py-16">
            <div className="max-w-4xl mx-auto px-6">
              <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900">
                Platform Highlights
              </h2>
              <div className="space-y-4">

                {/* Students - Blue */}
                <div className="flex items-start gap-5 p-6 bg-gradient-to-r from-blue-50 to-transparent rounded-2xl border-l-8 border-blue-400 shadow-sm">
                  <div className="flex-shrink-0 w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center shadow-inner">
                    <Users className="w-7 h-7 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-extrabold text-blue-800 text-xl mb-2 tracking-tight">Students</p>
                    <p className="text-gray-700 text-base leading-relaxed">
                      Discover the right school or college and apply with ease.
                    </p>
                  </div>
                </div>

                {/* Schools - Green */}
                <div className="flex items-start gap-5 p-6 bg-gradient-to-r from-green-50 to-transparent rounded-2xl border-l-8 border-green-400 shadow-sm">
                  <div className="flex-shrink-0 w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center shadow-inner">
                    <School className="w-7 h-7 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-extrabold text-green-800 text-xl mb-2 tracking-tight">Schools</p>
                    <p className="text-gray-700 text-base leading-relaxed">
                      Connect with interested students and manage admissions efficiently.
                    </p>
                  </div>
                </div>

                {/* Colleges - Purple */}
                <div className="flex items-start gap-5 p-6 bg-gradient-to-r from-purple-50 to-transparent rounded-2xl border-l-8 border-purple-400 shadow-sm">
                  <div className="flex-shrink-0 w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center shadow-inner">
                    <GraduationCap className="w-7 h-7 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-extrabold text-purple-800 text-xl mb-2 tracking-tight">Colleges</p>
                    <p className="text-gray-700 text-base leading-relaxed">
                      Showcase programs, receive applications, and streamline admissions.
                    </p>
                  </div>
                </div>

                {/* AI Matching - Teal */}
                <div className="flex items-start gap-5 p-6 bg-gradient-to-r from-teal-50 to-transparent rounded-2xl border-l-8 border-teal-400 shadow-sm">
                  <div className="flex-shrink-0 w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center shadow-inner">
                    <Brain className="w-7 h-7 text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-extrabold text-teal-800 text-xl mb-2 tracking-tight">AI Matching</p>
                    <p className="text-gray-700 text-base leading-relaxed">
                      Smart recommendations connecting students with the right institutions.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* AI Technology Section */}
        <section id="ai-technology" className="px-6 py-16 max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-3">Powered by Advanced AI Technology</h2>
          <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
            Leverage cutting-edge artificial intelligence to make smarter education decisions
          </p>

          {/* Cards Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {cards.map((card, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 group"
                style={{
                  borderColor: hoveredCard === idx ? '#fae96d' : '#e5e7eb',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={() => setHoveredCard(idx)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {card.icon}
                </div>
                <h3 className="text-2xl font-bold mb-2">{card.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works Section - Light Grey - Full Width */}
        <section id="how-it-works" className="bg-gray-50 px-6 py-16 w-full">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-3">How Synzy Works</h2>
            <p className="text-gray-500 text-center mb-12">Simple, smart, and effective in three steps</p>

            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              {steps.map((step, idx) => (
                <React.Fragment key={idx}>
                  <div className="text-center flex-1">
                    <div className="flex justify-center mb-4">
                      <div className="p-6 bg-white rounded-full shadow-lg">
                        {step.icon}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-gray-500 mb-2">{step.step}</div>
                    <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                    <p className="text-gray-500 text-base leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                  </div>
                  {idx < 2 && (
                    <div className="hidden md:block">
                      <ArrowRightCircle className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        {/* <section id="testimonials" className="px-6 py-16 max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-3">Trusted by Educators Nationwide</h2>
          <p className="text-gray-500 text-center mb-12">See what schools and colleges are saying about Synzy</p>

          Testimonial Card
          <div className="bg-white border-2 border-gray-200 rounded-xl p-8 shadow-lg relative">
            <div className="min-h-[200px] flex items-center">
              <div className="text-center md:text-left">
                <p className="text-gray-600 text-lg italic mb-6">"{testimonials[currentTestimonial].quote}"</p>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">{testimonials[currentTestimonial].name}</p>
                  <p className="text-gray-500 text-sm">{testimonials[currentTestimonial].title}</p>
                </div>
              </div>
            </div>
            
            Navigation Pills instead of arrows
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentTestimonial(idx)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    currentTestimonial === idx 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </section> */}

        {/* CTA Section - Dark */}
        <section className="bg-gray-900 px-6 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Ready to Transform Education Discovery?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of institutions already using Synzy to connect with the right students
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={`${import.meta.env.VITE_SCHOOL_PORTAL_URL}/signup-school`} className="px-8 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition font-medium">
              Go to School Portal
            </a>
            <a href={`${import.meta.env.VITE_COLLEGE_PORTAL_URL}/signup-college`} className="px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white/10 transition font-medium">
              Go to College Portal
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white px-6 py-12 border-t border-gray-200">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            {/* Logo and description - Left */}
            <div className="col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src={logo} alt="Synzy Logo" className="w-28 h-12" />
                {/* <span className="text-xl font-bold text-gray-800">Synzy</span> */}
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                India's first AI-powered platform for school and college exploration. Making education discovery smarter, faster, and more effective.
              </p>
              {/* Social Media Links */}
              <div className="flex gap-4 mt-4">
                <a
                  href="https://www.linkedin.com/company/mycampusinfo/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="https://www.instagram.com/synzy_ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links - Middle */}
            <div className="col-span-1">
              <div className="flex flex-col items-center">
                <h4 className="font-semibold mb-3 text-gray-900">Quick Links</h4>
                <ul className="space-y-2 text-sm text-gray-500 text-center">
                  <li><button onClick={() => scrollToSection('ai-technology')} className="hover:text-gray-900">Features</button></li>
                  <li><button onClick={() => scrollToSection('how-it-works')} className="hover:text-gray-900">How It Works</button></li>
                </ul>
              </div>
            </div>

            {/* Registration - Right */}
            <div className="col-span-1">
              <div className="flex flex-col items-end">
                <h4 className="font-semibold mb-3 text-gray-900">Registration</h4>
                <ul className="space-y-2 text-sm text-gray-500 text-right">
                  <li><a href={`${import.meta.env.VITE_SCHOOL_PORTAL_URL}/signup-school`} className="hover:text-gray-900">School Registration</a></li>
                  <li><a href={`${import.meta.env.VITE_COLLEGE_PORTAL_URL}/signup-college`} className="hover:text-gray-900">College Registration</a></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Copyright line - moved to bottom single line */}
          <div className="max-w-6xl mx-auto mt-8 pt-4 border-t border-gray-100 text-center text-sm text-gray-500">
            © 2025 Synzy. All rights reserved. Empowering education through AI.
          </div>
        </footer>
      </main>
    </div>
  );
};

export default SynzyHome;