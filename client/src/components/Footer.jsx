import {
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL,
  CONTACT_PHONE_DISPLAY_2,
  CONTACT_PHONE_TEL_2,
} from '../lib/contact';

export default function Footer() {
  return (
    <footer className="border-t border-[#261f17]/10 py-10 mt-20 bg-[#faf3e7]">
      <div className="max-w-6xl mx-auto px-6">
        <p className="font-display text-lg tracking-tight text-[#261f17]">
          Nestora<span className="text-[#d97f2e]">.</span> by Akash Khatri
        </p>
        <p className="text-xs tracking-[0.2em] uppercase text-[#d97f2e] font-medium mt-1">
          Your Trusted Real Estate Partner
        </p>
        <p className="text-sm text-[#261f17]/60 mt-3 max-w-md">
          Nestora represents finding your perfect nest — a home where you feel safe, comfortable, and happy.
        </p>
      </div>
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#261f17]/70 mt-6 pt-6 border-t border-[#261f17]/10">
        <p>&copy; {new Date().getFullYear()} Nestora by Akash Khatri. All rights reserved.</p>
        <div className="flex flex-wrap justify-center gap-6">
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          <a href={`tel:${CONTACT_PHONE_TEL}`}>{CONTACT_PHONE_DISPLAY}</a>
          <a href={`tel:${CONTACT_PHONE_TEL_2}`}>{CONTACT_PHONE_DISPLAY_2}</a>
        </div>
      </div>
      <p className="max-w-6xl mx-auto px-6 mt-4 text-xs text-[#261f17]/40">
        RERA registration details available on request. Properties listed are subject to availability.
      </p>
    </footer>
  );
}
