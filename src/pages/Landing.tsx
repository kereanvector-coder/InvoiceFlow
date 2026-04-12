import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, CheckCircle } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      setShowStickyCTA(window.scrollY > window.innerHeight);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for fade-in
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-5');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in-section').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="bg-[#030712] font-sans" style={{ fontFamily: "'Inter', sans-serif", minHeight: 'calc(var(--vh, 1vh) * 100)' }}>
      {/* SECTION 1 — TOP NAV */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-14 px-6 flex items-center justify-between ${scrolled ? 'bg-white shadow-sm' : 'bg-transparent'}`}>
        <div className="font-bold text-[20px] text-[#059669]">InvoiceFlow</div>
        <button 
          onClick={() => navigate('/setup')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${scrolled ? 'border-[#059669] text-[#059669] hover:bg-[#F0FDF4]' : 'border-white/30 text-white hover:bg-white/10'}`}
        >
          Get Started
        </button>
      </nav>

      {/* SECTION 2 — HERO */}
      <section className="pt-32 pb-20 px-6 flex flex-col items-center justify-center text-center relative overflow-hidden" style={{ minHeight: 'calc(var(--vh, 1vh) * 100)' }}>
        {/* Atmospheric Background Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#059669] rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#34D399] rounded-full blur-[150px] opacity-10 pointer-events-none"></div>
        
        <div className="max-w-[800px] w-full mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-white text-[13px] font-medium mb-8 shadow-2xl">
            <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse"></span>
            For freelancers & small businesses in Nigeria
          </div>
          
          <h1 className="text-[48px] sm:text-[72px] leading-[1.05] font-extrabold text-white mb-6 tracking-tight drop-shadow-2xl">
            Stop chasing clients<br/>for money.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#34D399] to-[#10B981]">Start getting paid on time.</span>
          </h1>
          
          <p className="text-[18px] sm:text-[20px] text-[#9CA3AF] leading-[1.6] max-w-[540px] mx-auto mb-10 font-light">
            Create a professional invoice in 60 seconds, send it via WhatsApp, and track exactly when you get paid — all from your phone.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/setup')}
              className="w-full sm:w-auto px-8 h-14 bg-white text-[#030712] font-bold text-[17px] rounded-full shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-[1.02] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)] transition-all duration-300 active:scale-[0.98]"
            >
              Create My First Invoice
            </button>
            <button 
              onClick={() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 h-14 bg-transparent text-white font-bold text-[17px] rounded-full border border-white/20 hover:bg-white/5 transition-all duration-300"
            >
              See How It Works
            </button>
          </div>
          
          <div className="text-[#6B7280] text-[12px] mt-6 font-medium tracking-widest uppercase">
            No signup required · Free to use · Works on any phone
          </div>
          
          <div className="mt-12 flex flex-col items-center">
            <div className="text-[#F59E0B] text-lg tracking-widest mb-1 drop-shadow-md">★★★★★</div>
            <div className="text-[#9CA3AF] text-[14px] mb-4">Trusted by freelancers across Nigeria</div>
            
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-[#030712] flex items-center justify-center text-[10px] font-bold text-white shadow-md">AO</div>
                <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-[#030712] flex items-center justify-center text-[10px] font-bold text-white shadow-md">CU</div>
                <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-[#030712] flex items-center justify-center text-[10px] font-bold text-white shadow-md">EM</div>
              </div>
              <div className="text-[#D1D5DB] text-[13px] font-medium">Join 2,000+ users</div>
            </div>
          </div>
          
          {/* Hero Phone Mockup */}
          <div className="mt-16 relative max-w-[320px] mx-auto" style={{ perspective: '2000px' }}>
            <div 
              className="w-[240px] h-[480px] rounded-[36px] border-[6px] border-[#1F2937] bg-white shadow-[0_30px_60px_rgba(0,0,0,0.6),0_0_80px_rgba(5,150,105,0.2)] mx-auto relative overflow-hidden transition-transform duration-700 hover:transform-none"
              style={{ transform: 'rotateY(-12deg) rotateX(5deg)' }}
            >
              {/* Mini Dashboard inside phone */}
              <div className="absolute top-0 left-0 w-[420px] h-[840px] origin-top-left scale-[0.57] bg-gray-50">
                <div className="p-6">
                  <div className="text-2xl font-bold text-gray-900 mb-6">Good morning, AO</div>
                  <div className="bg-emerald-600 rounded-2xl p-6 text-white mb-6 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-700">
                    <div className="text-emerald-100 text-sm mb-1">Total Received</div>
                    <div className="text-4xl font-bold tracking-tight">₦450,000</div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="font-bold text-lg text-gray-900">Recent Invoices</div>
                      <div className="text-emerald-600 font-medium">View All</div>
                    </div>
                    {[1, 2, 3].map(i => (
                      <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                        <div>
                          <div className="font-bold text-gray-900">Client {i}</div>
                          <div className="text-sm text-gray-500">INV-00{i}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">₦{i * 25},000</div>
                          <div className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md inline-block mt-1 font-medium">Paid</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Cards */}
            <div className="absolute top-[20%] -left-12 bg-white/90 backdrop-blur-md rounded-xl p-3 shadow-2xl border border-white/20 animate-[float_4s_ease-in-out_infinite]">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                <span className="text-[11px] font-medium text-gray-500">INV-012 · Paid</span>
              </div>
              <div className="text-[16px] font-bold text-[#059669]">₦85,000</div>
            </div>
            
            <div className="absolute top-[60%] -right-12 bg-white/90 backdrop-blur-md rounded-xl p-3 shadow-2xl border border-white/20 animate-[float_4s_ease-in-out_infinite]" style={{ animationDelay: '2s' }}>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-[11px] font-medium text-gray-500">INV-013 · Due Tomorrow</span>
              </div>
              <div className="text-[16px] font-bold text-gray-900">₦120,000</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — PROBLEM */}
      <section className="bg-white py-20 px-6 fade-in-section opacity-0 translate-y-5 transition-all duration-500">
        <div className="max-w-[640px] mx-auto">
          <div className="text-[#059669] text-[12px] font-bold uppercase tracking-[0.1em] mb-3">Sound Familiar?</div>
          <h2 className="text-[28px] font-bold text-[#111827] leading-tight mb-8">
            The painful reality of<br/>getting paid in Nigeria
          </h2>
          
          <div className="flex flex-col gap-3">
            <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-6">
              <div className="text-[32px] mb-3">⏳</div>
              <h3 className="font-bold text-[16px] text-[#111827] mb-2">You finished the job weeks ago</h3>
              <p className="text-[14px] text-[#6B7280] leading-[1.6]">
                The money still hasn't arrived. Following up feels awkward — like you're the one doing something wrong when you're not.
              </p>
            </div>
            
            <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-6">
              <div className="text-[32px] mb-3">🔍</div>
              <h3 className="font-bold text-[16px] text-[#111827] mb-2">You have no idea who owes you what</h3>
              <p className="text-[14px] text-[#6B7280] leading-[1.6]">
                Client names are in your head. Amounts are in your Notes app. Due dates you're trying not to forget. There's no system.
              </p>
            </div>
            
            <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-6">
              <div className="text-[32px] mb-3">😬</div>
              <h3 className="font-bold text-[16px] text-[#111827] mb-2">Your invoices don't look professional</h3>
              <p className="text-[14px] text-[#6B7280] leading-[1.6]">
                Screenshots of bank details and WhatsApp voice notes don't inspire confidence. Clients take you less seriously than you deserve.
              </p>
            </div>
          </div>
          
          <div className="text-center text-[20px] font-bold text-[#111827] mt-10">
            You do great work.<br/>You deserve to get paid like it.
          </div>
        </div>
      </section>

      {/* SECTION 4 — SOLUTION */}
      <section className="bg-[#F0FDF4] py-20 px-6 fade-in-section opacity-0 translate-y-5 transition-all duration-500">
        <div className="max-w-[640px] mx-auto">
          <div className="text-[#059669] text-[12px] font-bold uppercase tracking-[0.1em] mb-3">The Solution</div>
          <h2 className="text-[28px] font-bold text-[#111827] leading-tight mb-4">
            The fastest way to invoice and track your money — from your phone
          </h2>
          <p className="text-[16px] text-[#6B7280] mb-8">
            InvoiceFlow works entirely through WhatsApp — the app your clients already use every day.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-[#059669] shrink-0 mt-0.5" />
              <p className="text-[15px] text-[#374151] leading-relaxed">
                Send invoices that look better than what most agencies send — in 60 seconds
              </p>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-[#059669] shrink-0 mt-0.5" />
              <p className="text-[15px] text-[#374151] leading-relaxed">
                Clients tap a link and see the invoice plus your bank details instantly. No app download needed.
              </p>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-[#059669] shrink-0 mt-0.5" />
              <p className="text-[15px] text-[#374151] leading-relaxed">
                See exactly what's paid, pending, and overdue — all in one screen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — HOW IT WORKS */}
      <section className="bg-white py-20 px-6 fade-in-section opacity-0 translate-y-5 transition-all duration-500">
        <div className="max-w-[640px] mx-auto">
          <div className="text-[#059669] text-[12px] font-bold uppercase tracking-[0.1em] mb-3">How it works</div>
          <h2 className="text-[28px] font-bold text-[#111827] leading-tight mb-10">
            Up and running in 4 steps
          </h2>
          
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-[#E5E7EB]"></div>
            
            <div className="space-y-8 relative">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#D1FAE5] text-[#059669] flex items-center justify-center font-bold text-sm shrink-0 z-10 ring-4 ring-white">1</div>
                <div className="pt-1">
                  <h3 className="font-bold text-[16px] text-[#111827] mb-1">Set up once (2 minutes)</h3>
                  <p className="text-[14px] text-[#6B7280] leading-relaxed">Add your business name and bank details. InvoiceFlow fills them into every invoice automatically.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#D1FAE5] text-[#059669] flex items-center justify-center font-bold text-sm shrink-0 z-10 ring-4 ring-white">2</div>
                <div className="pt-1">
                  <h3 className="font-bold text-[16px] text-[#111827] mb-1">Create your invoice (60 seconds)</h3>
                  <p className="text-[14px] text-[#6B7280] leading-relaxed">Add your client's name, what you did, and the amount. Totals calculate instantly.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#D1FAE5] text-[#059669] flex items-center justify-center font-bold text-sm shrink-0 z-10 ring-4 ring-white">3</div>
                <div className="pt-1">
                  <h3 className="font-bold text-[16px] text-[#111827] mb-1">Send via WhatsApp (1 tap)</h3>
                  <p className="text-[14px] text-[#6B7280] leading-relaxed">Your client gets a link. They open it. They see the full invoice and your payment details — no app needed.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#059669] text-white flex items-center justify-center font-bold text-sm shrink-0 z-10 ring-4 ring-white">4</div>
                <div className="pt-1">
                  <h3 className="font-bold text-[16px] text-[#111827] mb-1">Track and get paid</h3>
                  <p className="text-[14px] text-[#6B7280] leading-relaxed">Watch your dashboard update in real time. Know your monthly income at a glance.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 — PRODUCT PREVIEW */}
      <section className="bg-[#030712] py-20 px-6 text-white fade-in-section opacity-0 translate-y-5 transition-all duration-500">
        <div className="max-w-[640px] mx-auto text-center">
          <div className="text-[#34D399] text-[12px] font-bold uppercase tracking-[0.1em] mb-3">See it in action</div>
          <h2 className="text-[28px] font-bold leading-tight mb-12">
            See exactly what you<br/>and your clients will see
          </h2>
          
          <div className="flex justify-center gap-4 mb-8">
            {/* Left Mockup */}
            <div className="w-[45%] max-w-[180px]">
              <div className="w-full aspect-[210/375] rounded-[24px] border-2 border-[#374151] bg-white shadow-lg relative overflow-hidden mb-3">
                <div className="absolute top-0 left-0 w-[420px] h-[750px] origin-top-left scale-[0.42] sm:scale-[0.45] bg-gray-50">
                  <div className="p-6">
                    <div className="text-2xl font-bold text-gray-900 mb-6">Good morning</div>
                    <div className="bg-emerald-600 rounded-2xl p-6 text-white mb-6">
                      <div className="text-emerald-100 text-sm mb-1">Total Received</div>
                      <div className="text-4xl font-bold">₦450,000</div>
                    </div>
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                          <div>
                            <div className="font-bold text-gray-900">Client {i}</div>
                            <div className="text-sm text-gray-500">INV-00{i}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">₦{i * 25},000</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-[13px] text-[#9CA3AF]">Your dashboard</div>
            </div>
            
            {/* Right Mockup */}
            <div className="w-[45%] max-w-[180px]">
              <div className="w-full aspect-[210/375] rounded-[24px] border-2 border-[#374151] bg-white shadow-lg relative overflow-hidden mb-3">
                <div className="absolute top-0 left-0 w-[420px] h-[750px] origin-top-left scale-[0.42] sm:scale-[0.45] bg-white">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <div className="text-3xl font-bold text-gray-900">INVOICE</div>
                        <div className="text-gray-500 mt-1">INV-001</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">Acme Corp</div>
                      </div>
                    </div>
                    <div className="mb-8">
                      <div className="text-gray-500 text-sm mb-1">Billed To</div>
                      <div className="font-bold text-gray-900">Client Name</div>
                    </div>
                    <div className="border-t border-b border-gray-200 py-4 mb-4">
                      <div className="flex justify-between mb-2">
                        <div className="font-medium text-gray-900">Website Design</div>
                        <div className="text-gray-900">₦150,000</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="font-bold text-gray-900 text-xl">Total</div>
                      <div className="font-bold text-emerald-600 text-2xl">₦150,000</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-[13px] text-[#9CA3AF]">What your client sees</div>
            </div>
          </div>
          
          <p className="text-[14px] text-[#9CA3AF] max-w-[300px] mx-auto">
            Professional enough to send to a company director. Simple enough to use every day.
          </p>
        </div>
      </section>

      {/* SECTION 7 — SOCIAL PROOF */}
      <section className="bg-white py-20 px-6 fade-in-section opacity-0 translate-y-5 transition-all duration-500">
        <div className="max-w-[640px] mx-auto">
          <div className="text-[#059669] text-[12px] font-bold uppercase tracking-[0.1em] mb-3">Trusted By</div>
          <h2 className="text-[28px] font-bold text-[#111827] leading-tight mb-10">
            Built for how Nigerians actually work
          </h2>
          
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
            <div className="min-w-[160px] flex-1 bg-[#F9FAFB] rounded-2xl p-6 border border-[#E5E7EB] snap-start">
              <div className="text-[48px] font-bold text-[#059669] leading-none mb-2">60s</div>
              <div className="text-[14px] text-[#6B7280] font-medium">To send your first invoice</div>
            </div>
            <div className="min-w-[160px] flex-1 bg-[#F9FAFB] rounded-2xl p-6 border border-[#E5E7EB] snap-start">
              <div className="text-[48px] font-bold text-[#059669] leading-none mb-2">₦0</div>
              <div className="text-[14px] text-[#6B7280] font-medium">Cost to get started</div>
            </div>
            <div className="min-w-[160px] flex-1 bg-[#F9FAFB] rounded-2xl p-6 border border-[#E5E7EB] snap-start">
              <div className="text-[48px] font-bold text-[#059669] leading-none mb-2">100%</div>
              <div className="text-[14px] text-[#6B7280] font-medium">Of your data stays on your device</div>
            </div>
          </div>
          
          <div className="mt-8 bg-[#F9FAFB] border-l-4 border-[#059669] rounded-r-xl p-5 sm:p-6">
            <p className="italic text-[16px] text-[#374151] leading-relaxed mb-3">
              "Every freelancer in Nigeria has chased a client for payment. InvoiceFlow makes sure the invoice is never the reason for the delay."
            </p>
            <p className="text-[13px] text-[#6B7280] font-medium">— The InvoiceFlow Team</p>
          </div>
        </div>
      </section>

      {/* SECTION 8 — FAQ */}
      <section className="bg-[#F9FAFB] py-20 px-6 fade-in-section opacity-0 translate-y-5 transition-all duration-500">
        <div className="max-w-[640px] mx-auto">
          <div className="text-[#059669] text-[12px] font-bold uppercase tracking-[0.1em] mb-3">FAQ</div>
          <h2 className="text-[28px] font-bold text-[#111827] leading-tight mb-8">
            Questions you're probably asking
          </h2>
          
          <div className="space-y-0">
            {[
              { q: "Is this really free?", a: "Yes. InvoiceFlow is completely free. No hidden fees, no subscription, no credit card ever required." },
              { q: "Do my clients need to download anything?", a: "No. They receive a link via WhatsApp. They tap it. The invoice opens in their browser. That's it." },
              { q: "Is my data safe?", a: "Your invoices are stored on your device only — not on any server. Only you can see your data." },
              { q: "What if I'm not tech-savvy?", a: "If you can use WhatsApp, you can use InvoiceFlow. Most users send their first invoice within 5 minutes of opening the app." },
              { q: "What if my client doesn't pay?", a: "Send a professional payment reminder in one tap — without the awkward conversation. InvoiceFlow tracks exactly how many reminders you've sent and when." }
            ].map((faq, i) => (
              <div key={i} className="border-b border-[#E5E7EB]">
                <button 
                  className="w-full py-5 flex items-center justify-between text-left focus:outline-none"
                  onClick={() => toggleFAQ(i)}
                >
                  <span className="font-bold text-[15px] text-[#111827] pr-4">{faq.q}</span>
                  <span className={`text-[#6B7280] text-xl transition-transform duration-200 ${openFAQ === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${openFAQ === i ? 'max-h-40 opacity-100 pb-5' : 'max-h-0 opacity-0'}`}
                >
                  <p className="text-[14px] text-[#6B7280] leading-[1.7]">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 9 — FINAL CTA */}
      <section className="bg-[#059669] py-20 px-6 text-center fade-in-section opacity-0 translate-y-5 transition-all duration-500">
        <div className="max-w-[640px] mx-auto">
          <h2 className="text-[32px] font-bold text-white leading-tight mb-4">
            You have an invoice<br/>to send right now.
          </h2>
          <p className="text-[17px] text-white/80 mb-10 max-w-[400px] mx-auto">
            Every day you wait is a day your client thinks payment can wait too.
          </p>
          
          <button 
            onClick={() => navigate('/setup')}
            className="w-full max-w-[320px] h-14 bg-white text-[#059669] font-bold text-[17px] rounded-[14px] hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
          >
            Create My First Invoice
          </button>
          
          <p className="text-[13px] text-white/80 mt-4">
            Free · No signup · Ready in 60 seconds
          </p>
        </div>
      </section>

      {/* SECTION 10 — FOOTER */}
      <footer className="bg-[#030712] pt-10 pb-10 px-6 fade-in-section opacity-0 translate-y-5 transition-all duration-500">
        <div className="max-w-[640px] mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="font-bold text-[18px] text-[#059669]">InvoiceFlow</div>
          </div>
          
          <div className="h-[1px] bg-[#1F2937] w-full mb-8"></div>
          
          <div className="text-[13px] text-[#6B7280]">
            © 2026 InvoiceFlow.<br/>Built for Nigerian freelancers.
          </div>
        </div>
      </footer>

      {/* STICKY MOBILE CTA BAR */}
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] p-3 px-5 z-40 transition-transform duration-300 ease-out flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.05)]`}
        style={{ 
          paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
          transform: showStickyCTA ? 'translateY(0)' : 'translateY(100%)'
        }}
      >
        <span className="text-[13px] text-[#6B7280] font-medium">Ready to get paid faster?</span>
        <button 
          onClick={() => navigate('/setup')}
          className="h-9 px-4 bg-[#059669] text-white text-[14px] font-bold rounded-lg active:scale-95 transition-transform"
        >
          Get Started →
        </button>
      </div>
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
