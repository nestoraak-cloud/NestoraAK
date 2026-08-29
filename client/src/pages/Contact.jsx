import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY, CONTACT_PHONE_DISPLAY_2 } from '../lib/contact';

const FORMSPREE_ID = import.meta.env.VITE_FORMSPREE_ID;

export default function Contact() {
  const location = useLocation();
  const propertyTitle = location.state?.propertyTitle || '';
  const [status, setStatus] = useState('idle');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('sending');
    const form = e.target;
    const data = new FormData(form);

    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        setStatus('sent');
        form.reset();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <p className="text-xs tracking-[0.3em] uppercase text-[#d97f2e] font-medium mb-2">
        Delhi NCR
      </p>
      <h1 className="font-display text-3xl text-[#261f17] mb-2">Get in Touch</h1>
      <p className="text-[#261f17]/60 mb-10">
        Have a question about a property or want to schedule a viewing? Send a message below.
      </p>

      <div className="mb-10 text-sm text-[#261f17]/70 space-y-1">
        <p>Email: {CONTACT_EMAIL}</p>
        <p>Phone: {CONTACT_PHONE_DISPLAY} / {CONTACT_PHONE_DISPLAY_2}</p>
      </div>

      {status === 'sent' ? (
        <p className="text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          Thanks — your message has been sent. We'll be in touch soon.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            placeholder="Your name"
            required
            className="w-full border border-[#261f17]/15 rounded-lg px-4 py-3 text-sm"
          />
          <input
            type="email"
            name="email"
            placeholder="Your email"
            required
            className="w-full border border-[#261f17]/15 rounded-lg px-4 py-3 text-sm"
          />
          <input
            name="phone"
            placeholder="Phone (optional)"
            className="w-full border border-[#261f17]/15 rounded-lg px-4 py-3 text-sm"
          />
          <textarea
            name="message"
            placeholder="Message"
            required
            rows={5}
            defaultValue={propertyTitle ? `I'm interested in: ${propertyTitle}\n\n` : ''}
            className="w-full border border-[#261f17]/15 rounded-lg px-4 py-3 text-sm"
          />
          <button
            type="submit"
            disabled={status === 'sending'}
            className="px-6 py-3 bg-[#261f17] text-[#faf3e7] rounded-full text-sm hover:bg-[#1b1610] transition-colors disabled:opacity-50"
          >
            {status === 'sending' ? 'Sending…' : 'Send Message'}
          </button>
          {status === 'error' && (
            <p className="text-red-600 text-sm">Something went wrong — please try again.</p>
          )}
        </form>
      )}
    </div>
  );
}
