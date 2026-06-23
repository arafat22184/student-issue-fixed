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
  if (pathname.includes('dashboard')){
    return null;
  }
  return (
    <footer className="bg-[#670D2F] text-pink-100 border-t border-white/10 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.webp" alt="Wisperia Logo" width={40} height={40} />
              <span className="text-2xl font-bold text-white">Wisperia</span>
            </Link>
            <p className="text-sm text-pink-200 leading-relaxed">
              Preserve your personal wisdom, reflect on your journey, and grow with a community that values deep insights.
            </p>
            <div className="flex items-center gap-4">
              {[FaFacebook, BsInstagram, FaXTwitter, LiaLinkedin].map((Icon, i) => (
                <Link key={i} href="#" className="p-2.5 rounded-full bg-white/10 hover:bg-white hover:text-[#670D2F] transition-all">
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
              <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-white">{section.title}</h3>
              <ul className="space-y-4 text-sm text-pink-200">
                {section.links.map((link) => (
                  <li key={link}>
                    <Link href={`/${link.toLowerCase().replace(" ", "-")}`} className="hover:text-white transition">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Section */}
          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-white">Contact</h3>
            <div className="space-y-4 text-sm text-pink-200">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-pink-300" />
                <span>Brahmanbaria, Chittagong, <br /> Bangladesh</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-pink-300" />
                <span>+880 1XXXXXXXXXX</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-pink-300" />
                <span>support@wisperia.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 py-8 text-center text-sm text-pink-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Wisperia. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}