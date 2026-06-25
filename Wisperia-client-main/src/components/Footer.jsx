'use client'
import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";
import { FaFacebook, FaXTwitter } from "react-icons/fa6"; // Updated to X logo
import { BsInstagram } from "react-icons/bs";
import { LiaLinkedin } from "react-icons/lia";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  // console.log(pathname , "footer");
  if (pathname.includes('dashboard')) {
    return null;
  }
  return (
    <footer className="bg-theme border-t border-theme/20 mt-16 transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center">
              <Image src="/favicon.png" alt="Wisperia Logo" width={100} height={100} className="overflow-hidden" />
              <span className="text-2xl font-extrabold text-theme">Wisperia</span>
            </Link>
            <p className="text-sm text-muted leading-relaxed">
              Preserve your personal wisdom, reflect on your journey, and grow with a community that values deep insights.
            </p>
            <div className="flex items-center gap-4">
              {[FaFacebook, BsInstagram, FaXTwitter, LiaLinkedin].map((Icon, i) => (
                <Link key={i} href="#" className="p-2.5 rounded-full bg-theme/10 text-theme border border-theme/15 hover:bg-primary hover:text-[var(--background)] transition-all">
                  <Icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Links Sections (Reusable Grid) */}
          {[
            { title: "Platform", links: ["Home", "Public Lessons", "Dashboard", "Pricing"] },
            { title: "Support", links: ["Contact Us", "FAQ", "Privacy Policy", "Terms & Conditions"] }
          ].map((section, idx) => (
            <div key={idx}>
              <h3 className="mb-6 text-xs font-bold uppercase tracking-widest text-theme">{section.title}</h3>
              <ul className="space-y-4 text-sm text-muted">
                {section.links.map((link) => (
                  <li key={link}>
                    <Link href={`/${link.toLowerCase().replace(" ", "-")}`} className="hover:text-theme transition">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Section */}
          <div>
            <h3 className="mb-6 text-xs font-bold uppercase tracking-widest text-theme">Contact</h3>
            <div className="space-y-4 text-sm text-muted">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-theme/80" />
                <span>Brahmanbaria, Chittagong, <br /> Bangladesh</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-theme/80" />
                <span>+880 1XXXXXXXXXX</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-theme/80" />
                <span>support@wisperia.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-theme/15 py-8 text-center text-sm text-muted flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Wisperia. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-theme transition">Privacy</Link>
            <Link href="/terms" className="hover:text-theme transition">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}