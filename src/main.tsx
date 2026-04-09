import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

document.documentElement.style.backgroundColor = '#030712';
document.body.style.backgroundColor = '#030712';

// ─── INSTANT SPLASH INJECTION ───
// Runs immediately when JS loads
// Shows branded screen before React mounts
;(function() {
  // Don't show splash if returning user
  const hasBusiness = (() => {
    try {
      const biz = localStorage.getItem('invoiceflow_business')
      if (!biz) return false
      const parsed = JSON.parse(biz)
      return !!(parsed && parsed.business_name)
    } catch(e) {
      return false
    }
  })()
  
  // Don't show splash if opening 
  // a shared invoice link
  const hasInvoiceParam = 
    window.location.search.includes('?invoice=') ||
    window.location.search.includes('invoice=')
  
  // Only show splash for new visitors 
  // on landing page
  if (hasBusiness || hasInvoiceParam) return
  
  // Create splash element
  const splash = document.createElement('div')
  splash.id = 'invoiceflow-splash'
  splash.innerHTML = `
    <div style="
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: #030712;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      transition: opacity 0.4s ease;
    ">
      <div style="text-align: center;">
        
        <!-- Logo mark -->
        <div style="
          width: 64px;
          height: 64px;
          background: #059669;
          border-radius: 16px;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 40px rgba(5,150,105,0.4);
        ">
          <svg width="32" height="32" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="white" 
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10,9 9,9 8,9"/>
          </svg>
        </div>
        
        <!-- App name -->
        <div style="
          font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
          font-size: 28px;
          font-weight: 700;
          color: #FFFFFF;
          letter-spacing: -0.5px;
          margin-bottom: 8px;
        ">InvoiceFlow</div>
        
        <!-- Tagline -->
        <div style="
          font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
          font-size: 14px;
          color: #059669;
          letter-spacing: 0.05em;
          margin-bottom: 48px;
        ">Get paid faster</div>
        
        <!-- Loading dots -->
        <div style="
          display: flex;
          gap: 6px;
          justify-content: center;
          align-items: center;
        ">
          <div class="splash-dot" style="
            width: 6px; height: 6px;
            background: #059669;
            border-radius: 50%;
            opacity: 0.3;
            animation: splashPulse 1.2s ease-in-out infinite;
            animation-delay: 0s;
          "></div>
          <div class="splash-dot" style="
            width: 6px; height: 6px;
            background: #059669;
            border-radius: 50%;
            opacity: 0.3;
            animation: splashPulse 1.2s ease-in-out infinite;
            animation-delay: 0.2s;
          "></div>
          <div class="splash-dot" style="
            width: 6px; height: 6px;
            background: #059669;
            border-radius: 50%;
            opacity: 0.3;
            animation: splashPulse 1.2s ease-in-out infinite;
            animation-delay: 0.4s;
          "></div>
        </div>
        
      </div>
    </div>
    
    <style>
      @keyframes splashPulse {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.3); }
      }
    </style>
  `
  
  // Add to page immediately
  document.body.appendChild(splash)
  
  // Store reference for removal
  ;(window as any).__invoiceFlowSplash = splash
  ;(window as any).__splashStartTime = Date.now()
})()

// Preload Inter font
const fontLink = document.createElement('link')
fontLink.rel = 'preload'
fontLink.as = 'font'
fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
fontLink.crossOrigin = 'anonymous'
document.head.appendChild(fontLink)

// Also add the actual stylesheet
const fontStyle = document.createElement('link')
fontStyle.rel = 'stylesheet'
fontStyle.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
document.head.appendChild(fontStyle)

document.title = "InvoiceFlow — Get Paid Faster";

const setMeta = (name: string, content: string) => {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    document.head.appendChild(el);
  }
  el.setAttribute('name', name);
  el.setAttribute('content', content);
};

const setOG = (property: string, content: string) => {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    document.head.appendChild(el);
  }
  el.setAttribute('property', property);
  el.setAttribute('content', content);
};

setMeta('description', 'Create professional invoices in 60 seconds, send via WhatsApp, and track payments — free for Nigerian freelancers.');
setMeta('theme-color', '#059669');

setOG('og:title', 'InvoiceFlow — Get Paid Faster');
setOG('og:description', 'Send professional invoices via WhatsApp and track every payment from your phone.');
setOG('og:type', 'website');

const setVH = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

setVH();
window.addEventListener('resize', setVH);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
