import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

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
