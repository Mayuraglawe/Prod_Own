'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  useEffect(() => {
    // Load lucide script dynamically to render the icons
    const script = document.createElement('script');
    script.src = "https://unpkg.com/lucide@latest";
    script.onload = () => {
      const w = window as unknown as { lucide?: { createIcons: () => void } };
      if (w.lucide) {
        w.lucide.createIcons();
      }
    };
    document.head.appendChild(script);

    // Intersection Observer for reveals
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Counter animation
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          const target = parseInt(el.dataset.target || '0');
          if (!target || el.dataset.counted) return;
          el.dataset.counted = 'true';
          const duration = 2000;
          const start = performance.now();
          function update(now: number) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            el.textContent = Math.floor(eased * target).toLocaleString();
            if (progress < 1) requestAnimationFrame(update);
            else el.textContent = target.toLocaleString();
          }
          requestAnimationFrame(update);
        }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));
    
    // Add event listeners for feature toggles
    document.querySelectorAll('.glass-card').forEach(card => {
      card.addEventListener('click', function(this: HTMLElement) {
        const detail = this.querySelector('.feature-detail') as HTMLElement;
        const chevron = this.querySelector('.feature-chevron') as HTMLElement;
        const text = this.querySelector('.feature-toggle-text') as HTMLElement;
        
        if (detail?.classList.contains('open')) {
          detail.classList.remove('open');
          if (chevron) chevron.style.transform = 'rotate(0deg)';
          if (text) text.textContent = 'Click for details';
        } else {
          document.querySelectorAll('.feature-detail.open').forEach(d => {
            d.classList.remove('open');
            const parent = d.closest('.glass-card') as HTMLElement;
            if (parent) {
              const pChevron = parent.querySelector('.feature-chevron') as HTMLElement;
              const pText = parent.querySelector('.feature-toggle-text') as HTMLElement;
              if (pChevron) pChevron.style.transform = 'rotate(0deg)';
              if (pText) pText.textContent = 'Click for details';
            }
          });
          
          if (detail) detail.classList.add('open');
          if (chevron) chevron.style.transform = 'rotate(180deg)';
          if (text) text.textContent = 'Close details';
        }
      });
    });

  }, []);

  return (
    <div className="min-h-screen font-sans text-neutral-100 overflow-x-hidden landing-page-wrapper">
      <style dangerouslySetInnerHTML={{__html: `
        :root {
          --bg-page: #0B0C0E;
          --glass-border: rgba(255, 255, 255, 0.08);
          --glass-surface: rgba(255, 255, 255, 0.03);
          --accent-glow: rgba(249, 115, 22, 0.4);
        }
        .landing-page-wrapper {
          background: var(--bg-page);
          color: #EDEDED;
        }
        .landing-page-wrapper::before {
          content: '';
          position: fixed;
          inset: 0;
          background: url('https://grainy-gradients.vercel.app/noise.svg');
          opacity: 0.2;
          pointer-events: none;
          z-index: 0;
        }
        .bg-grid {
          background-size: 40px 40px;
          background-image:
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);
          mask-image: radial-gradient(circle at center, black 40%, transparent 100%);
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); filter: blur(4px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .anim-up { opacity: 0; animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }
        .delay-5 { animation-delay: 0.5s; }
        .delay-6 { animation-delay: 0.6s; }

        .reveal {
          opacity: 0;
          transform: translateY(24px);
          filter: blur(4px);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal.visible {
          opacity: 1;
          transform: translateY(0);
          filter: blur(0);
        }

        .gradient-text {
          background: linear-gradient(to right, #fed7aa, #fb923c, #f59e0b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          backdrop-filter: blur(24px);
          transition: all 300ms ease;
        }
        .glass-card:hover {
          border-color: rgba(255, 255, 255, 0.15);
          background: rgba(255, 255, 255, 0.05);
          transform: translateY(-2px);
        }

        .shine-button {
          position: relative;
          overflow: hidden;
        }
        .shine-button::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
          transition: 0.5s;
        }
        .shine-button:hover::after { left: 100%; }

        @keyframes pulseRing {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .pulse-ring::before {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid #F97316;
          animation: pulseRing 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .dash-glow {
          box-shadow: 0 0 60px rgba(249, 115, 22, 0.15), 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .mobile-menu { max-height: 0; overflow: hidden; transition: max-height 0.4s ease; }
        .mobile-menu.open { max-height: 500px; }

        .toast {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%) translateY(100px);
          opacity: 0;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 9999;
        }
        .toast.show {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }

        .counter { font-variant-numeric: tabular-nums; }

        .icon-glow-orange { box-shadow: 0 0 12px rgba(249, 115, 22, 0.4); }
        .icon-glow-blue { box-shadow: 0 0 12px rgba(59, 130, 246, 0.4); }
        .icon-glow-emerald { box-shadow: 0 0 12px rgba(16, 185, 129, 0.4); }
        .icon-glow-purple { box-shadow: 0 0 12px rgba(168, 85, 247, 0.4); }
        .icon-glow-yellow { box-shadow: 0 0 12px rgba(234, 179, 8, 0.4); }
        .icon-glow-red { box-shadow: 0 0 12px rgba(239, 68, 68, 0.4); }

        .pricing-popular {
          border: 1px solid rgba(249, 115, 22, 0.4);
          box-shadow: 0 0 40px rgba(249, 115, 22, 0.1);
        }

        .nav-link {
          position: relative;
          padding: 6px 0;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 1px;
          background: #F97316;
          transition: width 0.3s ease;
        }
        .nav-link:hover::after,
        .nav-link.active::after {
          width: 100%;
        }

        .feature-detail {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
          opacity: 0;
        }
        .feature-detail.open {
          max-height: 300px;
          opacity: 1;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .float-anim { animation: float 4s ease-in-out infinite; }

        .compare-row:hover {
          background: rgba(255,255,255,0.02);
        }
      `}} />
      

  {/*  TOAST  */}
  <div id="toast" className="toast">
    <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-[#131418] border border-[rgba(255,255,255,0.1)] shadow-lg">
      <i data-lucide="check-circle" className="w-5 h-5 text-emerald-400"></i>
      <span id="toastMsg" className="text-sm text-white/90">Done!</span>
    </div>
  </div>

  {/*  ========== NAVBAR ==========  */}
  <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-6 border-b border-white/[0.06]" style={{"background":"rgba(11,12,14,0.85)","backdropFilter":"blur(24px)"}}>
    <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
      <a href="/" className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
          <i data-lucide="zap" className="w-4 h-4 text-white"></i>
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-white">LiteTrace</span>
      </a>

      <div className="hidden lg:flex items-center gap-7">
        <a href="#features" className="nav-link text-[13px] text-white/60 hover:text-white transition-colors">Features</a>
        <a href="#how-it-works" className="nav-link text-[13px] text-white/60 hover:text-white transition-colors">How It Works</a>
        <a href="#comparison" className="nav-link text-[13px] text-white/60 hover:text-white transition-colors">Compare</a>
        <a href="#pricing" className="nav-link text-[13px] text-white/60 hover:text-white transition-colors">Pricing</a>
        <a href="#testimonials" className="nav-link text-[13px] text-white/60 hover:text-white transition-colors">Testimonials</a>
        <a href="#faq" className="nav-link text-[13px] text-white/60 hover:text-white transition-colors">FAQ</a>
      </div>

      <div className="hidden lg:flex items-center gap-3">
        <Link href="/login" className="text-[13px] font-medium text-white/60 hover:text-white transition-colors px-4 py-2">Log In</Link>
        <Link href="/register" className="shine-button text-[13px] font-medium bg-[#EBEBEB] text-[#0B0C0E] px-5 py-2 rounded-full hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all">Get Started Free</Link>
      </div>

      <button id="menuToggle" className="lg:hidden text-white/70 hover:text-white transition-colors">
        <i data-lucide="menu" className="w-5 h-5"></i>
      </button>
    </div>

    <div id="mobileMenu" className="mobile-menu absolute top-14 left-0 right-0 bg-[#131418] border-b border-white/[0.06] lg:hidden" style={{"backdropFilter":"blur(24px)"}}>
      <div className="flex flex-col px-6 py-4 gap-1">
        <a href="#features" className="text-sm text-white/60 hover:text-white hover:bg-white/[0.03] px-3 py-2.5 rounded-lg transition-all" >⚡ Features</a>
        <a href="#how-it-works" className="text-sm text-white/60 hover:text-white hover:bg-white/[0.03] px-3 py-2.5 rounded-lg transition-all" >🔧 How It Works</a>
        <a href="#comparison" className="text-sm text-white/60 hover:text-white hover:bg-white/[0.03] px-3 py-2.5 rounded-lg transition-all" >📊 Compare</a>
        <a href="#pricing" className="text-sm text-white/60 hover:text-white hover:bg-white/[0.03] px-3 py-2.5 rounded-lg transition-all" >💰 Pricing</a>
        <a href="#testimonials" className="text-sm text-white/60 hover:text-white hover:bg-white/[0.03] px-3 py-2.5 rounded-lg transition-all" >💬 Testimonials</a>
        <a href="#faq" className="text-sm text-white/60 hover:text-white hover:bg-white/[0.03] px-3 py-2.5 rounded-lg transition-all" >❓ FAQ</a>
        <div className="border-t border-white/[0.06] my-2"></div>
        <Link href="/register" className="shine-button text-[13px] font-medium bg-[#EBEBEB] text-[#0B0C0E] px-5 py-2 rounded-full hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all">Get Started Free</Link>
      </div>
    </div>
  </nav>


  {/*  ========== HERO ==========  */}
  <section id="hero" className="relative pt-32 pb-24 px-6 overflow-hidden">
    <div className="absolute inset-0 bg-grid"></div>
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none"></div>

    <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
      <div>
        <div className="anim-up delay-1 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] mb-8">
          <span className="relative w-2 h-2 rounded-full bg-emerald-500 pulse-ring"></span>
          <span className="text-[11px] font-medium uppercase tracking-wider text-white/60">Now in Public Beta — v2.0</span>
        </div>

        <h1 className="anim-up delay-2 text-5xl lg:text-7xl font-medium tracking-tight leading-[1.1] mb-6">
          Track everything.<br/>
          <span className="gradient-text">Weigh nothing.</span>
        </h1>

        <p className="anim-up delay-3 text-lg font-light leading-relaxed text-white/60 max-w-lg mb-10">
          LiteTrace is the ultra-lightweight analytics platform. Under 5KB. Real-time insights. Zero cookies. No bloat. Just the data that matters.
        </p>

        <div className="anim-up delay-4 flex flex-wrap items-center gap-4 mb-10">
          <Link href="/register" className="shine-button text-[15px] font-medium bg-[#EBEBEB] text-[#0B0C0E] px-8 py-3.5 rounded-full hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all flex items-center gap-2">Start Tracking Free <i data-lucide="arrow-right" className="w-4 h-4"></i></Link>
          <button  className="text-[15px] font-medium text-white/60 hover:text-white px-6 py-3.5 rounded-full border border-white/[0.08] hover:border-white/[0.15] transition-all flex items-center gap-2">
            <i data-lucide="play-circle" className="w-4 h-4"></i>
            Watch Demo
          </button>
        </div>

        <div className="anim-up delay-5 flex items-center gap-4">
          <div className="flex -space-x-2">
            <img src="https://picsum.photos/seed/u1/56/56.jpg" className="w-7 h-7 rounded-full border-2 border-[#0B0C0E] object-cover" alt="" />
            <img src="https://picsum.photos/seed/u2/56/56.jpg" className="w-7 h-7 rounded-full border-2 border-[#0B0C0E] object-cover" alt="" />
            <img src="https://picsum.photos/seed/u3/56/56.jpg" className="w-7 h-7 rounded-full border-2 border-[#0B0C0E] object-cover" alt="" />
            <img src="https://picsum.photos/seed/u4/56/56.jpg" className="w-7 h-7 rounded-full border-2 border-[#0B0C0E] object-cover" alt="" />
            <img src="https://picsum.photos/seed/u5/56/56.jpg" className="w-7 h-7 rounded-full border-2 border-[#0B0C0E] object-cover" alt="" />
          </div>
          <div>
            <div className="flex items-center gap-1 mb-0.5">
              <i data-lucide="star" className="w-3 h-3 text-orange-400 fill-orange-400"></i>
              <i data-lucide="star" className="w-3 h-3 text-orange-400 fill-orange-400"></i>
              <i data-lucide="star" className="w-3 h-3 text-orange-400 fill-orange-400"></i>
              <i data-lucide="star" className="w-3 h-3 text-orange-400 fill-orange-400"></i>
              <i data-lucide="star" className="w-3 h-3 text-orange-400 fill-orange-400"></i>
            </div>
            <span className="text-[11px] text-white/40">Trusted by 2,400+ developers</span>
          </div>
        </div>
      </div>

      {/*  Dashboard Mockup  */}
      <div className="anim-up delay-5 relative float-anim">
        <div className="dash-glow rounded-2xl border border-white/[0.08] bg-[#131418] p-1 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
            </div>
            <span className="text-[11px] text-white/30 ml-2">dashboard.litetrace.io</span>
            <div className="ml-auto flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] text-emerald-400">Live</span>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                <p className="text-[11px] text-white/40 mb-1">Page Views</p>
                <p className="text-2xl font-semibold counter" data-target="48293">0</p>
                <span className="text-[11px] text-emerald-400 flex items-center gap-0.5 mt-1"><i data-lucide="trending-up" className="w-3 h-3"></i> +12.5%</span>
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                <p className="text-[11px] text-white/40 mb-1">Users</p>
                <p className="text-2xl font-semibold counter" data-target="8421">0</p>
                <span className="text-[11px] text-emerald-400 flex items-center gap-0.5 mt-1"><i data-lucide="trending-up" className="w-3 h-3"></i> +8.3%</span>
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                <p className="text-[11px] text-white/40 mb-1">Load Time</p>
                <p className="text-2xl font-semibold">0.4<span className="text-sm text-white/40">ms</span></p>
                <span className="text-[11px] text-emerald-400 flex items-center gap-0.5 mt-1"><i data-lucide="trending-down" className="w-3 h-3"></i> -23%</span>
              </div>
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[13px] font-medium">Traffic Overview</span>
                <span className="text-[11px] text-white/40">Last 7 days</span>
              </div>
              <div className="flex items-end gap-1.5 h-24">
                <div className="flex-1 bg-orange-500/20 rounded-t-sm transition-all duration-500" style={{"height":"45%"}}></div>
                <div className="flex-1 bg-orange-500/30 rounded-t-sm transition-all duration-500" style={{"height":"60%"}}></div>
                <div className="flex-1 bg-orange-500/40 rounded-t-sm transition-all duration-500" style={{"height":"35%"}}></div>
                <div className="flex-1 bg-orange-500/50 rounded-t-sm transition-all duration-500" style={{"height":"80%"}}></div>
                <div className="flex-1 bg-orange-500/60 rounded-t-sm transition-all duration-500" style={{"height":"65%"}}></div>
                <div className="flex-1 bg-orange-500/70 rounded-t-sm transition-all duration-500" style={{"height":"90%"}}></div>
                <div className="flex-1 bg-orange-500 rounded-t-sm transition-all duration-500" style={{"height":"100%"}}></div>
              </div>
              <div className="flex gap-1.5 mt-2">
                <div className="flex-1 text-center text-[10px] text-white/30">Mon</div>
                <div className="flex-1 text-center text-[10px] text-white/30">Tue</div>
                <div className="flex-1 text-center text-[10px] text-white/30">Wed</div>
                <div className="flex-1 text-center text-[10px] text-white/30">Thu</div>
                <div className="flex-1 text-center text-[10px] text-white/30">Fri</div>
                <div className="flex-1 text-center text-[10px] text-white/30">Sat</div>
                <div className="flex-1 text-center text-[10px] text-white/40 font-medium">Sun</div>
              </div>
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="relative w-2 h-2 rounded-full bg-emerald-500"><span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping"></span></span>
                <span className="text-[13px] font-medium">Live Events</span>
              </div>
              <div className="space-y-2 text-[12px] text-white/50 font-mono">
                <div className="flex justify-between"><span>page_view</span><span className="text-white/30">just now</span></div>
                <div className="flex justify-between"><span>button_click</span><span className="text-white/30">2s ago</span></div>
                <div className="flex justify-between"><span>form_submit</span><span className="text-white/30">5s ago</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>


  {/*  ========== LOGOS ==========  */}
  <section className="relative z-10 py-12 px-6 border-y border-white/[0.04]">
    <div className="max-w-7xl mx-auto">
      <p className="text-center text-[11px] uppercase tracking-wider text-white/30 mb-8">Trusted by teams at</p>
      <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-6 opacity-40">
        <div className="flex items-center gap-2 text-white/80"><i data-lucide="hexagon" className="w-6 h-6"></i><span className="text-sm font-medium">Next.js</span></div>
        <div className="flex items-center gap-2 text-white/80"><i data-lucide="flame" className="w-6 h-6"></i><span className="text-sm font-medium">Firebase</span></div>
        <div className="flex items-center gap-2 text-white/80"><i data-lucide="cloud" className="w-6 h-6"></i><span className="text-sm font-medium">Vercel</span></div>
        <div className="flex items-center gap-2 text-white/80"><i data-lucide="database" className="w-6 h-6"></i><span className="text-sm font-medium">Supabase</span></div>
        <div className="flex items-center gap-2 text-white/80"><i data-lucide="container" className="w-6 h-6"></i><span className="text-sm font-medium">Docker</span></div>
        <div className="flex items-center gap-2 text-white/80"><i data-lucide="layers" className="w-6 h-6"></i><span className="text-sm font-medium">Stripe</span></div>
      </div>
    </div>
  </section>


  {/*  ========== FEATURES ==========  */}
  <section id="features" className="relative z-10 py-28 px-6">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none"></div>
    <div className="max-w-7xl mx-auto">

      <div className="text-center max-w-2xl mx-auto mb-20 reveal">
        <span className="inline-block text-[11px] font-medium uppercase tracking-wider text-orange-400 mb-4">Features</span>
        <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-5">Everything you need,<br/><span className="gradient-text">nothing you don't.</span></h2>
        <p className="text-lg font-light text-white/60 leading-relaxed">Built for developers who care about performance. No bloated scripts, no cookie banners, no GDPR nightmares.</p>
      </div>

      {/*  Feature Grid — 6 main cards  */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">

        <div className="glass-card rounded-2xl p-8 reveal group cursor-pointer" >
          <div className="w-11 h-11 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-5 icon-glow-orange">
            <i data-lucide="feather" className="w-5 h-5 text-orange-400"></i>
          </div>
          <h3 className="text-[18px] font-medium tracking-tight mb-2">Under 5KB Gzipped</h3>
          <p className="text-[14px] font-light text-white/50 leading-relaxed">Smaller than most images. Zero impact on Core Web Vitals.</p>
          <div className="feature-detail mt-4">
            <div className="pt-4 border-t border-white/[0.06]">
              <ul className="space-y-2 text-[13px] text-white/50">
                <li className="flex items-start gap-2"><i data-lucide="check" className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0"></i>4.7KB gzipped — smaller than a favicon</li>
                <li className="flex items-start gap-2"><i data-lucide="check" className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0"></i>No render-blocking CSS or fonts</li>
                <li className="flex items-start gap-2"><i data-lucide="check" className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0"></i>Lighthouse score stays at 100</li>
                <li className="flex items-start gap-2"><i data-lucide="check" className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0"></i>Async loading — never blocks your page</li>
              </ul>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-[12px] text-orange-400/70 group-hover:text-orange-400 transition-colors">
            <span className="feature-toggle-text">Click for details</span>
            <i data-lucide="chevron-down" className="w-3.5 h-3.5 transition-transform duration-300 feature-chevron"></i>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-8 reveal group cursor-pointer" >
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5 icon-glow-blue">
            <i data-lucide="shield-check" className="w-5 h-5 text-blue-400"></i>
          </div>
          <h3 className="text-[18px] font-medium tracking-tight mb-2">Privacy-First</h3>
          <p className="text-[14px] font-light text-white/50 leading-relaxed">No cookies, no personal data. GDPR & CCPA compliant.</p>
          <div className="feature-detail mt-4">
            <div className="pt-4 border-t border-white/[0.06]">
              <ul className="space-y-2 text-[13px] text-white/50">
                <li className="flex items-start gap-2"><i data-lucide="check" className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0"></i>Zero cookies — no consent banner needed</li>
                <li className="flex items-start gap-2"><i data-lucide="check" className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0"></i>No IP addresses stored</li>
                <li className="flex items-start gap-2"><i data-lucide="check" className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0"></i>GDPR, CCPA, ePrivacy compliant</li>
                <li className="flex items-start gap-2"><i data-lucide="check" className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0"></i>DPA available for enterprise</li>
              </ul>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-[12px] text-blue-400/70 group-hover:text-blue-400 transition-colors">
            <span className="feature-toggle-text">Click for details</span>
            <i data-lucide="chevron-down" className="w-3.5 h-3.5 transition-transform duration-300 feature-chevron"></i>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-8 reveal group cursor-pointer" >
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5 icon-glow-emerald">
            <i data-lucide="activity" className="w-5 h-5 text-emerald-400"></i>
          </div>
          <h3 className="text-[18px] font-medium tracking-tight mb-2">Real-Time Dashboard</h3>
          <p className="text-[14px] font-light text-white/50 leading-relaxed">Watch visitors stream in live. Zero refresh needed.</p>
          <div className="feature-detail mt-4">
            <div className="pt-4 border-t border-white/[0.06]">
              <ul className="space-y-2 text-[13px] text-white/50">
                <li className="flex items-start gap-2"><i data-lucide="check" className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0"></i>WebSocket-powered live updates</li>
                <li className="flex items-start gap-2"><i data-lucide="check" className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0"></i>Active visitors count in real-time</li>
                <li className="flex items-start gap-2"><i data-lucide="check" className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0"></i>Live event stream feed</li>
                <li className="flex items-start gap-2"><i data-lucide="check" className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0"></i>Geographic map of current visitors</li>
              </ul>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-[12px] text-emerald-400/70 group-hover:text-emerald-400 transition-colors">
            <span className="feature-toggle-text">Click for details</span>
            <i data-lucide="chevron-down" className="w-3.5 h-3.5 transition-transform duration-300 feature-chevron"></i>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-8 reveal group cursor-pointer" >
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-5 icon-glow-purple">
            <i data-lucide="code-2" className="w-5 h-5 text-purple-400"></i>
          </div>
          <h3 className="text-[18px] font-medium tracking-tight mb-2">2-Line Setup</h3>
          <p className="text-[14px] font-light text-white/50 leading-relaxed">One script tag. Works with any framework.</p>
          <div className="feature-detail mt-4">
            <div className="pt-4 border-t border-white/[0.06]">
              <ul className="space-y-2 text-[13px] text-white/50">
                <li className="flex items-start gap-2"><i data-lucide="check" className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0"></i>Works with React, Vue, Svelte, Next.js</li>
                <li className="flex items-start gap-2"><i data-lucide="check" className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0"></i>Auto-detects SPA route changes</li>
                <li className="flex items-start gap-2"><i data-lucide="check" className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0"></i>NPM package available</li>
                <li className="flex items-start gap-2"><i data-lucide="check" className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0"></i>WordPress plugin coming soon</li>
              </ul>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-[12px] text-purple-400/70 group-hover:text-purple-400 transition-colors">
            <span className="feature-toggle-text">Click for details</span>
            <i data-lucide="chevron-down" className="w-3.5 h-3.5 transition-transform duration-300 feature-chevron"></i>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-8 reveal group cursor-pointer" >
          <div className="w-11 h-11 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-5 icon-glow-yellow">
            <i data-lucide="bar-chart-3" className="w-5 h-5 text-yellow-400"></i>
          </div>
          <h3 className="text-[18px] font-medium tracking-tight mb-2">Custom Events</h3>
          <p className="text-[14px] font-light text-white/50 leading-relaxed">Track anything with a single function call.</p>
          <div className="feature-detail mt-4">
            <div className="pt-4 border-t border-white/[0.06]">
              <ul className="space-y-2 text-[13px] text-white/50">
                <li className="flex items-start gap-2"><i data-lucide="check" className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0"></i>Unlimited custom events on Pro+</li>
                <li className="flex items-start gap-2"><i data-lucide="check" className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0"></i>Event properties & metadata</li>
                <li className="flex items-start gap-2"><i data-lucide="check" className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0"></i>Conversion funnels</li>
                <li className="flex items-start gap-2"><i data-lucide="check" className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0"></i>Event breakdowns by referrer, country, device</li>
              </ul>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-[12px] text-yellow-400/70 group-hover:text-yellow-400 transition-colors">
            <span className="feature-toggle-text">Click for details</span>
            <i data-lucide="chevron-down" className="w-3.5 h-3.5 transition-transform duration-300 feature-chevron"></i>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-8 reveal group cursor-pointer" >
          <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5 icon-glow-red">
            <i data-lucide="webhook" className="w-5 h-5 text-red-400"></i>
          </div>
          <h3 className="text-[18px] font-medium tracking-tight mb-2">Webhooks & API</h3>
          <p className="text-[14px] font-light text-white/50 leading-relaxed">Push data anywhere. Full REST API access.</p>
          <div className="feature-detail mt-4">
            <div className="pt-4 border-t border-white/[0.06]">
              <ul className="space-y-2 text-[13px] text-white/50">
                <li className="flex items-start gap-2"><i data-lucide="check" className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0"></i>Slack & Discord webhooks</li>
                <li className="flex items-start gap-2"><i data-lucide="check" className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0"></i>RESTful API with JSON responses</li>
                <li className="flex items-start gap-2"><i data-lucide="check" className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0"></i>API key authentication</li>
                <li className="flex items-start gap-2"><i data-lucide="check" className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0"></i>Export to CSV / JSON</li>
              </ul>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-[12px] text-red-400/70 group-hover:text-red-400 transition-colors">
            <span className="feature-toggle-text">Click for details</span>
            <i data-lucide="chevron-down" className="w-3.5 h-3.5 transition-transform duration-300 feature-chevron"></i>
          </div>
        </div>
      </div>

      {/*  Extra feature highlights row  */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 reveal">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <i data-lucide="globe" className="w-5 h-5 text-orange-400 flex-shrink-0"></i>
          <span className="text-[13px] text-white/60">150+ country detection</span>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <i data-lucide="smartphone" className="w-5 h-5 text-blue-400 flex-shrink-0"></i>
          <span className="text-[13px] text-white/60">Device & browser tracking</span>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <i data-lucide="clock" className="w-5 h-5 text-emerald-400 flex-shrink-0"></i>
          <span className="text-[13px] text-white/60">Session duration tracking</span>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <i data-lucide="link" className="w-5 h-5 text-purple-400 flex-shrink-0"></i>
          <span className="text-[13px] text-white/60">UTM parameter support</span>
        </div>
      </div>
    </div>
  </section>


  {/*  ========== HOW IT WORKS ==========  */}
  <section id="how-it-works" className="relative z-10 py-28 px-6 border-t border-white/[0.04]">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none"></div>
    <div className="max-w-7xl mx-auto">

      <div className="text-center max-w-2xl mx-auto mb-20 reveal">
        <span className="inline-block text-[11px] font-medium uppercase tracking-wider text-orange-400 mb-4">How It Works</span>
        <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-5">Up and running in <span className="gradient-text">30 seconds</span></h2>
        <p className="text-lg font-light text-white/60 leading-relaxed">No complex setup. No SDK initialization. Just add the snippet and start tracking.</p>
      </div>

      {/*  Timeline Steps  */}
      <div className="max-w-3xl mx-auto relative">
        {/*  Vertical line  */}
        <div className="absolute left-6 top-0 bottom-0 w-px timeline-line hidden md:block"></div>

        {/*  Step 1  */}
        <div className="reveal flex gap-6 md:gap-10 mb-16 items-start">
          <div className="relative z-10 w-12 h-12 rounded-full bg-[#131418] border-2 border-orange-500/50 flex items-center justify-center flex-shrink-0 text-orange-400 text-lg font-semibold">1</div>
          <div className="pt-1">
            <h3 className="text-xl font-medium tracking-tight mb-3">Create Your Account</h3>
            <p className="text-[15px] font-light text-white/50 leading-relaxed mb-4">Sign up with just your email — no credit card, no verification maze. You get instant access to your personal dashboard with a unique site ID.</p>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center"><i data-lucide="mail" className="w-4 h-4 text-orange-400"></i></div>
                <div>
                  <p className="text-[13px] text-white/70">Enter email → Get site ID → Done</p>
                  <p className="text-[11px] text-white/30">Takes about 10 seconds</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/*  Step 2  */}
        <div className="reveal flex gap-6 md:gap-10 mb-16 items-start">
          <div className="relative z-10 w-12 h-12 rounded-full bg-[#131418] border-2 border-orange-500/50 flex items-center justify-center flex-shrink-0 text-orange-400 text-lg font-semibold">2</div>
          <div className="pt-1">
            <h3 className="text-xl font-medium tracking-tight mb-3">Add the Script Tag</h3>
            <p className="text-[15px] font-light text-white/50 leading-relaxed mb-4">Paste a single line into your HTML &lt;head&gt;. That's it. LiteTrace auto-detects page views, referrers, and session data — no manual configuration.</p>
            <div className="rounded-xl border border-white/[0.06] bg-[#0E0F11] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
                <span className="text-[11px] text-white/30">index.html</span>
                <button  className="text-[11px] text-white/40 hover:text-white/70 transition-colors flex items-center gap-1"><i data-lucide="copy" className="w-3 h-3"></i> Copy</button>
              </div>
              <pre className="p-4 text-[12px] font-mono leading-relaxed"><code><span className="text-orange-400">&lt;script</span> <span className="text-blue-400">src</span>=<span className="text-emerald-400">"https://cdn.litetrace.io/v1.js"</span>
  <span className="text-blue-400">data-id</span>=<span className="text-emerald-400">"lt_abc123"</span><span className="text-orange-400">&gt;&lt;/script&gt;</span></code></pre>
            </div>
          </div>
        </div>

        {/*  Step 3  */}
        <div className="reveal flex gap-6 md:gap-10 mb-16 items-start">
          <div className="relative z-10 w-12 h-12 rounded-full bg-[#131418] border-2 border-orange-500/50 flex items-center justify-center flex-shrink-0 text-orange-400 text-lg font-semibold">3</div>
          <div className="pt-1">
            <h3 className="text-xl font-medium tracking-tight mb-3">Track Custom Events (Optional)</h3>
            <p className="text-[15px] font-light text-white/50 leading-relaxed mb-4">Want more than page views? Add custom event tracking with one function call. Button clicks, form submissions, purchases — anything you need.</p>
            <div className="rounded-xl border border-white/[0.06] bg-[#0E0F11] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
                <span className="text-[11px] text-white/30">app.js</span>
                <button  className="text-[11px] text-white/40 hover:text-white/70 transition-colors flex items-center gap-1"><i data-lucide="copy" className="w-3 h-3"></i> Copy</button>
              </div>
              <pre className="p-4 text-[12px] font-mono leading-relaxed"><code><span className="text-purple-400">LiteTrace</span>.<span className="text-blue-400">track</span>(<span className="text-emerald-400">'purchase'</span>, {"{"}
  <span className="text-blue-400">amount</span>: <span className="text-orange-300">49.99</span>,
  <span className="text-blue-400">plan</span>: <span className="text-emerald-400">'pro'</span>,
  <span className="text-blue-400">currency</span>: <span className="text-emerald-400">'USD'</span>
{"}"});</code></pre>
            </div>
          </div>
        </div>

        {/*  Step 4  */}
        <div className="reveal flex gap-6 md:gap-10 items-start">
          <div className="relative z-10 w-12 h-12 rounded-full bg-[#131418] border-2 border-emerald-500/50 flex items-center justify-center flex-shrink-0">
            <i data-lucide="check" className="w-5 h-5 text-emerald-400"></i>
          </div>
          <div className="pt-1">
            <h3 className="text-xl font-medium tracking-tight mb-3">Watch Data Flow In Real-Time</h3>
            <p className="text-[15px] font-light text-white/50 leading-relaxed">Open your dashboard and see visitors, page views, and custom events streaming in live. No delays, no batching — instant insights.</p>
          </div>
        </div>
      </div>
    </div>
  </section>


  {/*  ========== COMPARISON TABLE ==========  */}
  <section id="comparison" className="relative z-10 py-28 px-6 border-t border-white/[0.04]">
    <div className="max-w-5xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-16 reveal">
        <span className="inline-block text-[11px] font-medium uppercase tracking-wider text-orange-400 mb-4">Comparison</span>
        <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-5">Why developers <span className="gradient-text">switch</span></h2>
        <p className="text-lg font-light text-white/60 leading-relaxed">See how LiteTrace stacks up against the heavyweights.</p>
      </div>

      <div className="reveal rounded-2xl border border-white/[0.08] overflow-hidden">
        {/*  Header  */}
        <div className="grid grid-cols-4 gap-4 px-6 py-4 bg-white/[0.03] border-b border-white/[0.06]">
          <div className="text-[13px] text-white/40 font-medium">Feature</div>
          <div className="text-center">
            <span className="text-[14px] font-semibold gradient-text">LiteTrace</span>
          </div>
          <div className="text-center text-[13px] text-white/50 font-medium">Google Analytics</div>
          <div className="text-center text-[13px] text-white/50 font-medium">Plausible</div>
        </div>

        {/*  Rows  */}
        <div className="compare-row grid grid-cols-4 gap-4 px-6 py-4 border-b border-white/[0.04] transition-colors">
          <div className="text-[13px] text-white/60">Script Size</div>
          <div className="text-center text-[13px] text-emerald-400 font-medium">4.7 KB</div>
          <div className="text-center text-[13px] text-white/40">~500 KB</div>
          <div className="text-center text-[13px] text-white/40">~45 KB</div>
        </div>
        <div className="compare-row grid grid-cols-4 gap-4 px-6 py-4 border-b border-white/[0.04] transition-colors">
          <div className="text-[13px] text-white/60">Cookies</div>
          <div className="text-center"><i data-lucide="x-circle" className="w-5 h-5 text-emerald-400 mx-auto"></i></div>
          <div className="text-center"><i data-lucide="check-circle" className="w-5 h-5 text-red-400 mx-auto"></i></div>
          <div className="text-center"><i data-lucide="x-circle" className="w-5 h-5 text-emerald-400 mx-auto"></i></div>
        </div>
        <div className="compare-row grid grid-cols-4 gap-4 px-6 py-4 border-b border-white/[0.04] transition-colors">
          <div className="text-[13px] text-white/60">Cookie Banner Needed</div>
          <div className="text-center"><i data-lucide="x-circle" className="w-5 h-5 text-emerald-400 mx-auto"></i></div>
          <div className="text-center"><i data-lucide="check-circle" className="w-5 h-5 text-red-400 mx-auto"></i></div>
          <div className="text-center"><i data-lucide="x-circle" className="w-5 h-5 text-emerald-400 mx-auto"></i></div>
        </div>
        <div className="compare-row grid grid-cols-4 gap-4 px-6 py-4 border-b border-white/[0.04] transition-colors">
          <div className="text-[13px] text-white/60">Real-Time Dashboard</div>
          <div className="text-center"><i data-lucide="check-circle" className="w-5 h-5 text-emerald-400 mx-auto"></i></div>
          <div className="text-center"><i data-lucide="check-circle" className="w-5 h-5 text-white/30 mx-auto"></i></div>
          <div className="text-center"><i data-lucide="check-circle" className="w-5 h-5 text-white/30 mx-auto"></i></div>
        </div>
        <div className="compare-row grid grid-cols-4 gap-4 px-6 py-4 border-b border-white/[0.04] transition-colors">
          <div className="text-[13px] text-white/60">Custom Events</div>
          <div className="text-center"><i data-lucide="check-circle" className="w-5 h-5 text-emerald-400 mx-auto"></i></div>
          <div className="text-center"><i data-lucide="check-circle" className="w-5 h-5 text-white/30 mx-auto"></i></div>
          <div className="text-center"><i data-lucide="x-circle" className="w-5 h-5 text-red-400 mx-auto"></i></div>
        </div>
        <div className="compare-row grid grid-cols-4 gap-4 px-6 py-4 border-b border-white/[0.04] transition-colors">
          <div className="text-[13px] text-white/60">Webhooks / API</div>
          <div className="text-center"><i data-lucide="check-circle" className="w-5 h-5 text-emerald-400 mx-auto"></i></div>
          <div className="text-center"><i data-lucide="check-circle" className="w-5 h-5 text-white/30 mx-auto"></i></div>
          <div className="text-center"><i data-lucide="x-circle" className="w-5 h-5 text-red-400 mx-auto"></i></div>
        </div>
        <div className="compare-row grid grid-cols-4 gap-4 px-6 py-4 border-b border-white/[0.04] transition-colors">
          <div className="text-[13px] text-white/60">Self-Host Option</div>
          <div className="text-center"><i data-lucide="check-circle" className="w-5 h-5 text-emerald-400 mx-auto"></i></div>
          <div className="text-center"><i data-lucide="x-circle" className="w-5 h-5 text-red-400 mx-auto"></i></div>
          <div className="text-center"><i data-lucide="check-circle" className="w-5 h-5 text-white/30 mx-auto"></i></div>
        </div>
        <div className="compare-row grid grid-cols-4 gap-4 px-6 py-4 border-b border-white/[0.04] transition-colors">
          <div className="text-[13px] text-white/60">GDPR Compliant</div>
          <div className="text-center text-[13px] text-emerald-400 font-medium">Out of box</div>
          <div className="text-center text-[13px] text-white/40">Setup needed</div>
          <div className="text-center text-[13px] text-emerald-400">Yes</div>
        </div>
        <div className="compare-row grid grid-cols-4 gap-4 px-6 py-4 transition-colors">
          <div className="text-[13px] text-white/60">Starting Price</div>
          <div className="text-center text-[13px] text-emerald-400 font-medium">Free</div>
          <div className="text-center text-[13px] text-white/40">Free</div>
          <div className="text-center text-[13px] text-white/40">$9/mo</div>
        </div>
      </div>
    </div>
  </section>


  {/*  ========== STATS ==========  */}
  <section className="relative z-10 py-20 px-6 border-y border-white/[0.04]">
    <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
      <div className="text-center reveal">
        <p className="text-4xl md:text-5xl font-semibold tracking-tight gradient-text counter" data-target="2400">0</p>
        <p className="text-[14px] text-white/40 mt-2">Active Developers</p>
      </div>
      <div className="text-center reveal">
        <p className="text-4xl md:text-5xl font-semibold tracking-tight text-white"><span className="counter" data-target="50">0</span>M+</p>
        <p className="text-[14px] text-white/40 mt-2">Events Tracked / Month</p>
      </div>
      <div className="text-center reveal">
        <p className="text-4xl md:text-5xl font-semibold tracking-tight text-white">4.7<span className="text-orange-400 text-2xl">KB</span></p>
        <p className="text-[14px] text-white/40 mt-2">Gzipped Script Size</p>
      </div>
      <div className="text-center reveal">
        <p className="text-4xl md:text-5xl font-semibold tracking-tight text-white">99.9<span className="text-emerald-400 text-2xl">%</span></p>
        <p className="text-[14px] text-white/40 mt-2">Uptime SLA</p>
      </div>
    </div>
  </section>


  {/*  ========== DEMO VIDEO ==========  */}
  <section id="demo-section" className="relative z-10 py-28 px-6">
    <div className="max-w-4xl mx-auto reveal">
      <div className="text-center mb-10">
        <span className="inline-block text-[11px] font-medium uppercase tracking-wider text-orange-400 mb-4">See It In Action</span>
        <h2 className="text-3xl md:text-4xl font-medium tracking-tight">One minute. That's all you need.</h2>
      </div>
      <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] group cursor-pointer" >
        <img src="https://picsum.photos/seed/litetrace-demo2/1200/675.jpg" className="w-full aspect-video object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700" alt="Demo" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-orange-500/20 group-hover:border-orange-500/40 group-hover:scale-110 transition-all duration-300">
            <i data-lucide="play" className="w-7 h-7 text-white ml-1"></i>
          </div>
        </div>
        <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/[0.08]">
          <span className="text-[12px] text-white/70">1:24</span>
        </div>
      </div>
    </div>
  </section>


  {/*  ========== TESTIMONIALS ==========  */}
  <section id="testimonials" className="relative z-10 py-28 px-6 border-t border-white/[0.04]">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none"></div>
    <div className="max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-16 reveal">
        <span className="inline-block text-[11px] font-medium uppercase tracking-wider text-orange-400 mb-4">Testimonials</span>
        <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-5">Loved by <span className="gradient-text">developers</span></h2>
        <p className="text-lg font-light text-white/60 leading-relaxed">Don't take our word for it. Here's what our users say.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-8 reveal">
          <div className="flex items-center gap-1 mb-4">
            <i data-lucide="star" className="w-4 h-4 text-orange-400 fill-orange-400"></i>
            <i data-lucide="star" className="w-4 h-4 text-orange-400 fill-orange-400"></i>
            <i data-lucide="star" className="w-4 h-4 text-orange-400 fill-orange-400"></i>
            <i data-lucide="star" className="w-4 h-4 text-orange-400 fill-orange-400"></i>
            <i data-lucide="star" className="w-4 h-4 text-orange-400 fill-orange-400"></i>
          </div>
          <p className="text-[15px] font-light text-white/70 leading-relaxed mb-6">"Replaced GA on all my projects. My Lighthouse score jumped 15 points. The dashboard is beautiful and blazing fast."</p>
          <div className="flex items-center gap-3">
            <img src="https://picsum.photos/seed/sarah/80/80.jpg" className="w-10 h-10 rounded-full object-cover" alt="" />
            <div>
              <p className="text-sm font-medium">Sarah Chen</p>
              <p className="text-[12px] text-white/40">Frontend Engineer @ Vercel</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-8 reveal">
          <div className="flex items-center gap-1 mb-4">
            <i data-lucide="star" className="w-4 h-4 text-orange-400 fill-orange-400"></i>
            <i data-lucide="star" className="w-4 h-4 text-orange-400 fill-orange-400"></i>
            <i data-lucide="star" className="w-4 h-4 text-orange-400 fill-orange-400"></i>
            <i data-lucide="star" className="w-4 h-4 text-orange-400 fill-orange-400"></i>
            <i data-lucide="star" className="w-4 h-4 text-orange-400 fill-orange-400"></i>
          </div>
          <p className="text-[15px] font-light text-white/70 leading-relaxed mb-6">"The custom events API is a joy. I set up conversion tracking in 2 minutes. Webhook to Slack is chef's kiss. 🔥"</p>
          <div className="flex items-center gap-3">
            <img src="https://picsum.photos/seed/marcus/80/80.jpg" className="w-10 h-10 rounded-full object-cover" alt="" />
            <div>
              <p className="text-sm font-medium">Marcus Rivera</p>
              <p className="text-[12px] text-white/40">Indie Hacker & Founder</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-8 reveal">
          <div className="flex items-center gap-1 mb-4">
            <i data-lucide="star" className="w-4 h-4 text-orange-400 fill-orange-400"></i>
            <i data-lucide="star" className="w-4 h-4 text-orange-400 fill-orange-400"></i>
            <i data-lucide="star" className="w-4 h-4 text-orange-400 fill-orange-400"></i>
            <i data-lucide="star" className="w-4 h-4 text-orange-400 fill-orange-400"></i>
            <i data-lucide="star" className="w-4 h-4 text-orange-400 fill-orange-400"></i>
          </div>
          <p className="text-[15px] font-light text-white/70 leading-relaxed mb-6">"Finally, analytics that respects privacy. No cookie banner needed. Our legal team was thrilled. Serious win for us."</p>
          <div className="flex items-center gap-3">
            <img src="https://picsum.photos/seed/elena/80/80.jpg" className="w-10 h-10 rounded-full object-cover" alt="" />
            <div>
              <p className="text-sm font-medium">Elena Kowalski</p>
              <p className="text-[12px] text-white/40">CTO @ DataFlow</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-8 reveal">
          <div className="flex items-center gap-1 mb-4">
            <i data-lucide="star" className="w-4 h-4 text-orange-400 fill-orange-400"></i>
            <i data-lucide="star" className="w-4 h-4 text-orange-400 fill-orange-400"></i>
            <i data-lucide="star" className="w-4 h-4 text-orange-400 fill-orange-400"></i>
            <i data-lucide="star" className="w-4 h-4 text-orange-400 fill-orange-400"></i>
            <i data-lucide="star" className="w-4 h-4 text-orange-400 fill-orange-400"></i>
          </div>
          <p className="text-[15px] font-light text-white/70 leading-relaxed mb-6">"We migrated 200+ sites from GA4 to LiteTrace in a weekend. The script is so small it's almost invisible. Performance improved across the board."</p>
          <div className="flex items-center gap-3">
            <img src="https://picsum.photos/seed/james/80/80.jpg" className="w-10 h-10 rounded-full object-cover" alt="" />
            <div>
              <p className="text-sm font-medium">James Park</p>
              <p className="text-[12px] text-white/40">DevOps Lead @ CloudScale</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-8 reveal">
          <div className="flex items-center gap-1 mb-4">
            <i data-lucide="star" className="w-4 h-4 text-orange-400 fill-orange-400"></i>
            <i data-lucide="star" className="w-4 h-4 text-orange-400 fill-orange-400"></i>
            <i data-lucide="star" className="w-4 h-4 text-orange-400 fill-orange-400"></i>
            <i data-lucide="star" className="w-4 h-4 text-orange-400 fill-orange-400"></i>
            <i data-lucide="star" className="w-4 h-4 text-orange-400 fill-orange-400"></i>
          </div>
          <p className="text-[15px] font-light text-white/70 leading-relaxed mb-6">"I use LiteTrace on my Next.js SaaS. The auto route detection is perfect. No need to call pageview manually. Just plug and play."</p>
          <div className="flex items-center gap-3">
            <img src="https://picsum.photos/seed/priya/80/80.jpg" className="w-10 h-10 rounded-full object-cover" alt="" />
            <div>
              <p className="text-sm font-medium">Priya Sharma</p>
              <p className="text-[12px] text-white/40">Full-Stack Developer</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-8 reveal">
          <div className="flex items-center gap-1 mb-4">
            <i data-lucide="star" className="w-4 h-4 text-orange-400 fill-orange-400"></i>
            <i data-lucide="star" className="w-4 h-4 text-orange-400 fill-orange-400"></i>
            <i data-lucide="star" className="w-4 h-4 text-orange-400 fill-orange-400"></i>
            <i data-lucide="star" className="w-4 h-4 text-orange-400 fill-orange-400"></i>
            <i data-lucide="star" className="w-4 h-4 text-orange-400 fill-orange-400"></i>
          </div>
          <p className="text-[15px] font-light text-white/70 leading-relaxed mb-6">"The REST API is clean and well-documented. I built a custom Slack bot that posts daily summaries. Took me 20 minutes."</p>
          <div className="flex items-center gap-3">
            <img src="https://picsum.photos/seed/alex/80/80.jpg" className="w-10 h-10 rounded-full object-cover" alt="" />
            <div>
              <p className="text-sm font-medium">Alex Müller</p>
              <p className="text-[12px] text-white/40">Backend Engineer @ StartupHub</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>


  {/*  ========== PRICING ==========  */}
  <section id="pricing" className="relative z-10 py-28 px-6 border-t border-white/[0.04]">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none"></div>
    <div className="max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-16 reveal">
        <span className="inline-block text-[11px] font-medium uppercase tracking-wider text-orange-400 mb-4">Pricing</span>
        <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-5">Simple, <span className="gradient-text">honest pricing</span></h2>
        <p className="text-lg font-light text-white/60 leading-relaxed">Start free. Scale when you're ready. No surprise bills, ever.</p>
      </div>

      {/*  Toggle  */}
      <div className="flex items-center justify-center gap-3 mb-14 reveal">
        <span id="monthlyLabel" className="text-sm text-white/90 font-medium">Monthly</span>
        <button id="billingToggle"  className="relative w-12 h-6 rounded-full bg-white/10 border border-white/[0.1] transition-all flex-shrink-0">
          <div id="toggleDot" className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-orange-500 transition-all duration-300 shadow-[0_0_10px_rgba(249,115,22,0.8)]"></div>
        </button>
        <span id="yearlyLabel" className="text-sm text-white/40 font-medium">Yearly <span className="text-emerald-400 text-[11px] font-semibold">-20%</span></span>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {/*  Free  */}
        <div className="glass-card rounded-2xl p-8 reveal flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center"><i data-lucide="user" className="w-4 h-4 text-white/50"></i></div>
            <h3 className="text-[18px] font-medium tracking-tight">Free</h3>
          </div>
          <p className="text-[13px] text-white/40 mb-6 ml-10">For personal projects</p>
          <div className="mb-6">
            <span className="text-5xl font-semibold">$0</span>
            <span className="text-white/40 text-sm">/month</span>
          </div>
          <ul className="space-y-3 mb-8 flex-1">
            <li className="flex items-center gap-2.5 text-[14px] text-white/60"><i data-lucide="check" className="w-4 h-4 text-emerald-400 flex-shrink-0"></i>10K page views/mo</li>
            <li className="flex items-center gap-2.5 text-[14px] text-white/60"><i data-lucide="check" className="w-4 h-4 text-emerald-400 flex-shrink-0"></i>1 website</li>
            <li className="flex items-center gap-2.5 text-[14px] text-white/60"><i data-lucide="check" className="w-4 h-4 text-emerald-400 flex-shrink-0"></i>Real-time dashboard</li>
            <li className="flex items-center gap-2.5 text-[14px] text-white/60"><i data-lucide="check" className="w-4 h-4 text-emerald-400 flex-shrink-0"></i>7-day data retention</li>
            <li className="flex items-center gap-2.5 text-[14px] text-white/30"><i data-lucide="minus" className="w-4 h-4 text-white/20 flex-shrink-0"></i>Custom events</li>
            <li className="flex items-center gap-2.5 text-[14px] text-white/30"><i data-lucide="minus" className="w-4 h-4 text-white/20 flex-shrink-0"></i>Webhooks & API</li>
          </ul>
          <button  className="w-full py-3.5 rounded-full border border-white/[0.1] text-[14px] font-medium text-white/70 hover:bg-white/[0.05] hover:border-white/[0.15] transition-all">
            Get Started
          </button>
        </div>

        {/*  Pro  */}
        <div className="pricing-popular rounded-2xl p-8 bg-[#131418] reveal flex flex-col relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-orange-500 text-[11px] font-semibold text-white uppercase tracking-wider">Most Popular</div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center"><i data-lucide="zap" className="w-4 h-4 text-orange-400"></i></div>
            <h3 className="text-[18px] font-medium tracking-tight">Pro</h3>
          </div>
          <p className="text-[13px] text-white/40 mb-6 ml-10">For growing businesses</p>
          <div className="mb-6">
            <span className="text-5xl font-semibold price-monthly">$19</span>
            <span className="text-5xl font-semibold price-yearly hidden">$15</span>
            <span className="text-white/40 text-sm">/month</span>
          </div>
          <ul className="space-y-3 mb-8 flex-1">
            <li className="flex items-center gap-2.5 text-[14px] text-white/60"><i data-lucide="check" className="w-4 h-4 text-orange-400 flex-shrink-0"></i>500K page views/mo</li>
            <li className="flex items-center gap-2.5 text-[14px] text-white/60"><i data-lucide="check" className="w-4 h-4 text-orange-400 flex-shrink-0"></i>10 websites</li>
            <li className="flex items-center gap-2.5 text-[14px] text-white/60"><i data-lucide="check" className="w-4 h-4 text-orange-400 flex-shrink-0"></i>Real-time dashboard</li>
            <li className="flex items-center gap-2.5 text-[14px] text-white/60"><i data-lucide="check" className="w-4 h-4 text-orange-400 flex-shrink-0"></i>12-month data retention</li>
            <li className="flex items-center gap-2.5 text-[14px] text-white/60"><i data-lucide="check" className="w-4 h-4 text-orange-400 flex-shrink-0"></i>Unlimited custom events</li>
            <li className="flex items-center gap-2.5 text-[14px] text-white/60"><i data-lucide="check" className="w-4 h-4 text-orange-400 flex-shrink-0"></i>Webhooks & API access</li>
            <li className="flex items-center gap-2.5 text-[14px] text-white/60"><i data-lucide="check" className="w-4 h-4 text-orange-400 flex-shrink-0"></i>Email reports</li>
          </ul>
          <button  className="shine-button w-full py-3.5 rounded-full bg-[#EBEBEB] text-[#0B0C0E] text-[14px] font-medium hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all">
            Start Free Trial
          </button>
        </div>

        {/*  Enterprise  */}
        <div className="glass-card rounded-2xl p-8 reveal flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center"><i data-lucide="building-2" className="w-4 h-4 text-white/50"></i></div>
            <h3 className="text-[18px] font-medium tracking-tight">Enterprise</h3>
          </div>
          <p className="text-[13px] text-white/40 mb-6 ml-10">For large organizations</p>
          <div className="mb-6">
            <span className="text-5xl font-semibold">Custom</span>
          </div>
          <ul className="space-y-3 mb-8 flex-1">
            <li className="flex items-center gap-2.5 text-[14px] text-white/60"><i data-lucide="check" className="w-4 h-4 text-emerald-400 flex-shrink-0"></i>Unlimited page views</li>
            <li className="flex items-center gap-2.5 text-[14px] text-white/60"><i data-lucide="check" className="w-4 h-4 text-emerald-400 flex-shrink-0"></i>Unlimited websites</li>
            <li className="flex items-center gap-2.5 text-[14px] text-white/60"><i data-lucide="check" className="w-4 h-4 text-emerald-400 flex-shrink-0"></i>Unlimited data retention</li>
            <li className="flex items-center gap-2.5 text-[14px] text-white/60"><i data-lucide="check" className="w-4 h-4 text-emerald-400 flex-shrink-0"></i>SSO & SAML auth</li>
            <li className="flex items-center gap-2.5 text-[14px] text-white/60"><i data-lucide="check" className="w-4 h-4 text-emerald-400 flex-shrink-0"></i>Self-hosting option</li>
            <li className="flex items-center gap-2.5 text-[14px] text-white/60"><i data-lucide="check" className="w-4 h-4 text-emerald-400 flex-shrink-0"></i>Dedicated support engineer</li>
            <li className="flex items-center gap-2.5 text-[14px] text-white/60"><i data-lucide="check" className="w-4 h-4 text-emerald-400 flex-shrink-0"></i>99.99% SLA guarantee</li>
          </ul>
          <button  className="w-full py-3.5 rounded-full border border-white/[0.1] text-[14px] font-medium text-white/70 hover:bg-white/[0.05] hover:border-white/[0.15] transition-all">
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  </section>


  {/*  ========== FAQ ==========  */}
  <section id="faq" className="relative z-10 py-28 px-6 border-t border-white/[0.04]">
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-16 reveal">
        <span className="inline-block text-[11px] font-medium uppercase tracking-wider text-orange-400 mb-4">FAQ</span>
        <h2 className="text-3xl md:text-5xl font-medium tracking-tight">Frequently asked questions</h2>
      </div>

      <div className="space-y-3 reveal">
        <div className="faq-item glass-card rounded-xl overflow-hidden">
          <button  className="w-full flex items-center justify-between px-6 py-5 text-left">
            <span className="text-[15px] font-medium pr-4">How does LiteTrace compare to Google Analytics?</span>
            <i data-lucide="chevron-down" className="w-5 h-5 text-white/40 transition-transform duration-300 faq-icon flex-shrink-0"></i>
          </button>
          <div className="faq-content max-h-0 overflow-hidden transition-all duration-300">
            <p className="px-6 pb-5 text-[14px] font-light text-white/60 leading-relaxed">LiteTrace is 100x smaller (4.7KB vs ~500KB), doesn't use cookies, requires no cookie consent banner, and provides a cleaner, faster dashboard. It's built for developers who want insights without the bloat. See our full comparison table above.</p>
          </div>
        </div>

        <div className="faq-item glass-card rounded-xl overflow-hidden">
          <button  className="w-full flex items-center justify-between px-6 py-5 text-left">
            <span className="text-[15px] font-medium pr-4">Is LiteTrace GDPR compliant?</span>
            <i data-lucide="chevron-down" className="w-5 h-5 text-white/40 transition-transform duration-300 faq-icon flex-shrink-0"></i>
          </button>
          <div className="faq-content max-h-0 overflow-hidden transition-all duration-300">
            <p className="px-6 pb-5 text-[14px] font-light text-white/60 leading-relaxed">Yes! LiteTrace doesn't collect any personal data, doesn't use cookies, and doesn't track individuals across sites. It's fully GDPR, CCPA, and ePrivacy compliant out of the box. No cookie banner needed — ever.</p>
          </div>
        </div>

        <div className="faq-item glass-card rounded-xl overflow-hidden">
          <button  className="w-full flex items-center justify-between px-6 py-5 text-left">
            <span className="text-[15px] font-medium pr-4">Can I self-host LiteTrace?</span>
            <i data-lucide="chevron-down" className="w-5 h-5 text-white/40 transition-transform duration-300 faq-icon flex-shrink-0"></i>
          </button>
          <div className="faq-content max-h-0 overflow-hidden transition-all duration-300">
            <p className="px-6 pb-5 text-[14px] font-light text-white/60 leading-relaxed">Self-hosting is available on our Enterprise plan. We provide Docker images and full documentation for deploying on your own infrastructure. Cloud-hosted is available on all plans with zero maintenance.</p>
          </div>
        </div>

        <div className="faq-item glass-card rounded-xl overflow-hidden">
          <button  className="w-full flex items-center justify-between px-6 py-5 text-left">
            <span className="text-[15px] font-medium pr-4">Does it work with SPA frameworks like React or Vue?</span>
            <i data-lucide="chevron-down" className="w-5 h-5 text-white/40 transition-transform duration-300 faq-icon flex-shrink-0"></i>
          </button>
          <div className="faq-content max-h-0 overflow-hidden transition-all duration-300">
            <p className="px-6 pb-5 text-[14px] font-light text-white/60 leading-relaxed">Absolutely! LiteTrace automatically detects route changes in React, Vue, Svelte, Next.js, Nuxt, and any other SPA framework. No additional configuration needed — it just works out of the box.</p>
          </div>
        </div>

        <div className="faq-item glass-card rounded-xl overflow-hidden">
          <button  className="w-full flex items-center justify-between px-6 py-5 text-left">
            <span className="text-[15px] font-medium pr-4">What happens if I exceed my page view limit?</span>
            <i data-lucide="chevron-down" className="w-5 h-5 text-white/40 transition-transform duration-300 faq-icon flex-shrink-0"></i>
          </button>
          <div className="faq-content max-h-0 overflow-hidden transition-all duration-300">
            <p className="px-6 pb-5 text-[14px] font-light text-white/60 leading-relaxed">We'll never cut off your tracking unexpectedly. You'll get notified at 80% and 100% usage. Data continues to flow and we'll prompt you to upgrade — no data loss, no downtime.</p>
          </div>
        </div>

        <div className="faq-item glass-card rounded-xl overflow-hidden">
          <button  className="w-full flex items-center justify-between px-6 py-5 text-left">
            <span className="text-[15px] font-medium pr-4">Can I migrate from Google Analytics to LiteTrace?</span>
            <i data-lucide="chevron-down" className="w-5 h-5 text-white/40 transition-transform duration-300 faq-icon flex-shrink-0"></i>
          </button>
          <div className="faq-content max-h-0 overflow-hidden transition-all duration-300">
            <p className="px-6 pb-5 text-[14px] font-light text-white/60 leading-relaxed">Yes! Simply remove the GA script tag and add the LiteTrace snippet. We also provide a migration guide and can import your historical GA data (Enterprise plan). The whole process takes under 5 minutes per site.</p>
          </div>
        </div>

        <div className="faq-item glass-card rounded-xl overflow-hidden">
          <button  className="w-full flex items-center justify-between px-6 py-5 text-left">
            <span className="text-[15px] font-medium pr-4">Do you offer a refund policy?</span>
            <i data-lucide="chevron-down" className="w-5 h-5 text-white/40 transition-transform duration-300 faq-icon flex-shrink-0"></i>
          </button>
          <div className="faq-content max-h-0 overflow-hidden transition-all duration-300">
            <p className="px-6 pb-5 text-[14px] font-light text-white/60 leading-relaxed">Yes — 14-day money-back guarantee on all paid plans. No questions asked. If LiteTrace isn't the right fit, just email us and we'll process your refund within 24 hours.</p>
          </div>
        </div>
      </div>
    </div>
  </section>


  {/*  ========== CTA ==========  */}
  <section className="relative z-10 py-32 px-6 overflow-hidden">
    <div className="absolute inset-0 bg-grid"></div>
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none"></div>

    <div className="relative z-10 max-w-3xl mx-auto text-center reveal">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-500/20 bg-orange-500/5 mb-8">
        <i data-lucide="rocket" className="w-3.5 h-3.5 text-orange-400"></i>
        <span className="text-[11px] font-medium uppercase tracking-wider text-orange-400">Free forever plan available</span>
      </div>
      <h2 className="text-4xl md:text-6xl font-medium tracking-tight mb-6">Ready to ditch the <span className="gradient-text">bloat</span>?</h2>
      <p className="text-lg font-light text-white/60 leading-relaxed mb-10 max-w-xl mx-auto">Join 2,400+ developers who switched to lightweight analytics. Setup takes 30 seconds — no credit card required.</p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button  className="shine-button text-[15px] font-medium bg-[#EBEBEB] text-[#0B0C0E] px-10 py-4 rounded-full hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all flex items-center gap-2">
          Get Started for Free
          <i data-lucide="arrow-right" className="w-4 h-4"></i>
        </button>
        <button  className="text-[15px] font-medium text-white/60 hover:text-white px-8 py-4 rounded-full border border-white/[0.08] hover:border-white/[0.15] transition-all flex items-center gap-2">
          <i data-lucide="book-open" className="w-4 h-4"></i>
          Read Docs
        </button>
      </div>
      <p className="text-[12px] text-white/30 mt-6">No credit card · No cookie banner · Setup in 30 seconds</p>
    </div>
  </section>


  {/*  ========== FOOTER ==========  */}
  <footer className="relative z-10 border-t border-white/[0.06] py-16 px-6">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
        <div className="col-span-2 md:col-span-1">
          <a href="/" className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <i data-lucide="zap" className="w-4 h-4 text-white"></i>
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-white">LiteTrace</span>
          </a>
          <p className="text-[13px] text-white/40 leading-relaxed mb-4">Lightweight analytics<br/>for the modern web.</p>
          <div className="flex items-center gap-3">
            <a href="#" className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-white hover:border-white/[0.15] transition-all"><i data-lucide="github" className="w-4 h-4"></i></a>
            <a href="#" className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-white hover:border-white/[0.15] transition-all"><i data-lucide="twitter" className="w-4 h-4"></i></a>
            <a href="#" className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-white hover:border-white/[0.15] transition-all"><i data-lucide="linkedin" className="w-4 h-4"></i></a>
          </div>
        </div>
        <div>
          <h4 className="text-[11px] font-medium uppercase tracking-wider text-white/30 mb-4">Product</h4>
          <ul className="space-y-2.5">
            <li><a href="#features" className="text-[13px] text-white/50 hover:text-white transition-colors">Features</a></li>
            <li><a href="#pricing" className="text-[13px] text-white/50 hover:text-white transition-colors">Pricing</a></li>
            <li><a href="#" className="text-[13px] text-white/50 hover:text-white transition-colors">Changelog</a></li>
            <li><a href="#" className="text-[13px] text-white/50 hover:text-white transition-colors">Roadmap</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[11px] font-medium uppercase tracking-wider text-white/30 mb-4">Resources</h4>
          <ul className="space-y-2.5">
            <li><a href="#" className="text-[13px] text-white/50 hover:text-white transition-colors">Documentation</a></li>
            <li><a href="#" className="text-[13px] text-white/50 hover:text-white transition-colors">API Reference</a></li>
            <li><a href="#" className="text-[13px] text-white/50 hover:text-white transition-colors">Integration Guides</a></li>
            <li><a href="#" className="text-[13px] text-white/50 hover:text-white transition-colors">Blog</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[11px] font-medium uppercase tracking-wider text-white/30 mb-4">Company</h4>
          <ul className="space-y-2.5">
            <li><a href="#" className="text-[13px] text-white/50 hover:text-white transition-colors">About</a></li>
            <li><a href="#" className="text-[13px] text-white/50 hover:text-white transition-colors">Careers</a></li>
            <li><a href="#" className="text-[13px] text-white/50 hover:text-white transition-colors">Contact</a></li>
            <li><a href="#" className="text-[13px] text-white/50 hover:text-white transition-colors">Press Kit</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[11px] font-medium uppercase tracking-wider text-white/30 mb-4">Legal</h4>
          <ul className="space-y-2.5">
            <li><a href="#" className="text-[13px] text-white/50 hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="text-[13px] text-white/50 hover:text-white transition-colors">Terms of Service</a></li>
            <li><a href="#" className="text-[13px] text-white/50 hover:text-white transition-colors">DPA</a></li>
            <li><a href="#" className="text-[13px] text-white/50 hover:text-white transition-colors">Cookie Policy</a></li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/[0.06] gap-4">
        <p className="text-[12px] text-white/30">© 2025 LiteTrace. All rights reserved.</p>
        <div className="flex items-center gap-2 text-[12px] text-white/30">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          All systems operational
        </div>
      </div>
    </div>
  </footer>


  {/*  ========== SCRIPTS ==========  */}
  

    </div>
  );
}
