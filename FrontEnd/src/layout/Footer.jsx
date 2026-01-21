import React from "react";
import { assets } from "../assets/assets.js";

const Footer = () => {
  return (
    <footer className="bg-neutral-900 text-white pt-24 pb-12 border-t border-white/10">
      <div className="max-w-full mx-auto px-6 md:px-12 lg:px-20">
        
        {/* --- Top Section: Main Content --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 mb-20">
          
          {/* 1. Brand & Newsletter (Occupies 4 columns) */}
          <div className="lg:col-span-4 flex flex-col items-center">
            <a href="/" className="mb-8 block w-40">
              <img 
                src={assets.whiteLogo} 
                alt="Four Seasons Logo" 
                className="w-full h-auto object-contain opacity-90 hover:opacity-100 transition-opacity duration-300" 
              />
            </a>
            <p className="text-neutral-400 text-sm font-light leading-7 mb-8 max-w-sm">
              Trải nghiệm đỉnh cao của sự sang trọng và hiếu khách.
              Đăng ký nhận bản tin của chúng tôi để nhận ưu đãi độc quyền và tin tức mới nhất.
            </p>
            
            {/* Minimal Input Field */}
            <form className="w-full max-w-sm flex items-end gap-4 border-b border-white/20 pb-2 transition-colors focus-within:border-white">
              <input 
                type="email" 
                placeholder="Nhập email của bạn" 
                className="bg-transparent flex-1 outline-none text-sm placeholder-neutral-500 font-light tracking-wide pb-1"
              />
              <button type="button" className="text-xs uppercase tracking-[0.2em] font-bold hover:text-neutral-300 transition-colors pb-1">
                Đăng ký
              </button>
            </form>
          </div>

          {/* 2. Navigation Links (Occupies 5 columns) */}
          <div className="lg:col-span-5 grid grid-cols-2 md:grid-cols-3 gap-10 items-center">
            {/* Column 1 */}
            <div>
              <h4 className="font-playfair italic font-bold text-xl mb-6 text-white/90">Thanh Thảo</h4>
              <ul className="space-y-4 text-xs tracking-widest uppercase text-neutral-400 font-light">
                <li><a href="/" className="hover:text-white transition-colors duration-300">Về chúng tôi</a></li>
                <li><a href="/" className="hover:text-white transition-colors duration-300">Xem phòng</a></li>
                <li><a href="/" className="hover:text-white transition-colors duration-300">Dịch vụ</a></li>
              </ul>
            </div>
            
            {/* Column 2 */}
            <div>
              <h4 className="font-playfair italic font-bold text-xl mb-6 text-white/90">Trải nghiệm</h4>
              <ul className="space-y-4 text-xs tracking-widest uppercase text-neutral-400 font-light">
                <li><a href="/" className="hover:text-white transition-colors duration-300">Spa && Massage</a></li>
                <li><a href="/" className="hover:text-white transition-colors duration-300">Coffe</a></li>
                <li><a href="/" className="hover:text-white transition-colors duration-300">Festival</a></li>
              </ul>
            </div>

             {/* Column 3 */}
             <div>
              <h4 className="font-playfair italic font-bold text-xl mb-6 text-white/90">Chính sách</h4>
              <ul className="space-y-4 text-xs tracking-widest uppercase text-neutral-400 font-light">
                <li><a href="/" className="hover:text-white transition-colors duration-300">Điều khoản</a></li>
                <li><a href="/" className="hover:text-white transition-colors duration-300">Hỗ trợ</a></li>
                <li><a href="/" className="hover:text-white transition-colors duration-300">Cam kết</a></li>
              </ul>
            </div>
          </div>

          {/* 3. Contact & Social (Occupies 3 columns) */}
          <div className="lg:col-span-3 lg:pl-10 mt-27">
            <h4 className="font-playfair italic font-bold text-xl mb-6 text-white/90">Liên hệ</h4>
            <div className="space-y-6 text-sm font-light text-neutral-400 leading-relaxed">
              <p>
                12 Nguyễn Tri Phương,<br />
                Đà Lạt, Lâm Đồng, Việt Nam
              </p>
              <p>
                <a href="tel:+842353940000" className="block hover:text-white transition-colors">+84 942 819 936</a>
                <a href="mailto:reservations.hoian@fourseasons.com" className="block hover:text-white transition-colors mt-1">duyminh1773@gmail.com</a>
              </p>
            </div>

            {/* Social Icons - Minimal Outline Style */}
            <div className="flex gap-4 mt-8">
              {[
                {
                  name: 'facebook',
                  href: 'https://facebook.com',
                  // SVG Path cho Facebook
                  path: (
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  ),
                },
                {
                  name: 'instagram',
                  href: 'https://instagram.com',
                  // SVG Path cho Instagram
                  path: (
                    <>
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </>
                  ),
                },
                {
                  name: 'twitter',
                  href: 'https://twitter.com',
                  // SVG Path cho Twitter (X)
                  path: (
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  ),
                },
                {
                  name: 'youtube',
                  href: 'https://youtube.com',
                  // SVG Path cho Youtube
                  path: (
                    <>
                      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                      <path d="m10 15 5-3-5-3z" />
                    </>
                  ),
                },
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white transition-all duration-300 group"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"  // Kích thước icon
                    height="18" // Kích thước icon
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5" // Độ mảnh của nét vẽ (càng nhỏ càng sang)
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-transform duration-300 group-hover:scale-110" // Hiệu ứng zoom nhẹ khi hover
                  >
                    {social.path}
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* --- Bottom Section: Copyright --- */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-neutral-500 uppercase tracking-widest">
          <p>© 2025 Thanhthao Hotels Limited. All Rights Reserved.</p>
          <div className="flex gap-6">
             <a href="#" className="hover:text-white transition-colors">Sitemap</a>
             <a href="#" className="hover:text-white transition-colors">Cookie Preferences</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
