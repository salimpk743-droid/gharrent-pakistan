import { Link } from "@tanstack/react-router";
import { Brand } from "./brand";

export function Footer() {
  return (
    <footer className="mt-auto bg-[#f6f8f5] pb-20 pt-12 md:pb-0">
      <div className="mx-auto grid w-[min(1120px,calc(100%-32px))] gap-8 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <Brand />
          <p className="mt-3 max-w-xs text-xs leading-relaxed text-muted">
            A property marketplace that helps people discover homes to rent or buy across Pakistan. Listings are
            posted by advertisers. Always inspect a property before you pay.
          </p>
        </div>
        <div>
          <b className="mb-3 block text-[11px]">Explore</b>
          <FooterLink to="/rent">Rent</FooterLink>
          <FooterLink to="/sale">Buy</FooterLink>
          <FooterLink to="/locations">Locations</FooterLink>
          <FooterLink to="/post">Post a property</FooterLink>
          <FooterLink to="/account/listings">My listings</FooterLink>
        </div>
        <div>
          <b className="mb-3 block text-[11px]">Help</b>
          <FooterLink to="/safety">Safer buying & renting</FooterLink>
          <FooterLink to="/contact">Contact us</FooterLink>
          <FooterLink to="/report">Report a problem</FooterLink>
        </div>
        <div>
          <b className="mb-3 block text-[11px]">Legal</b>
          <FooterLink to="/privacy">Privacy policy</FooterLink>
          <FooterLink to="/terms">Terms of use</FooterLink>
          <FooterLink to="/disclaimer">Marketplace disclaimer</FooterLink>
        </div>
      </div>
      <div className="mx-auto mt-10 flex w-[min(1120px,calc(100%-32px))] flex-col justify-between gap-2 border-t border-line py-4 text-[11px] text-[#87938e] sm:flex-row">
        <span>© 2026 Apna Ghar Pakistan. All rights reserved.</span>
        <span>A marketplace — not a landlord, estate agent or party to your contract.</span>
      </div>
    </footer>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="mb-2 block text-[12px] text-muted no-underline hover:text-forest">
      {children}
    </Link>
  );
}
