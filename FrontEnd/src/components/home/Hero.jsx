// src/components/home/Hero.jsx
import React, { useState, useEffect } from "react";
import { assets } from "../../assets/assets";

const Hero = () => {
  const slides = [assets.BG01, assets.BG02, assets.BG03, assets.BG04];
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Auto slide 10s
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Background slideshow */}
      <div className="absolute inset-0 z-0">
        {slides.map((bg, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-out ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
            style={{ backgroundImage: `url(${bg})` }}
          />
        ))}
      </div>

      {/* Overlay làm tối để chữ nổi */}
      <div className="absolute inset-0 z-10 bg-linear-to-t from-black/80 via-black/40 to-black/10 pointer-events-none" />

      {/* Nội dung chữ góc trái dưới */}
      <div className="relative z-20 flex items-end h-full">
        <div className="w-full max-w-6xl ml-[100px] mr-auto pr-4 sm:pr-6 lg:pr-8 pb-10 md:pb-14 lg:pb-16">
          <p className="font-playfair mb-2 text-xs md:text-sm lg:text-xl tracking-[0.25em] uppercase text-white/70">
            Khách sạn thanh thảo
          </p>

          <h1 className="font-playfair text-2xl md:text-4xl lg:text-5xl tracking-[0.20em] uppercase text-white mb-4 drop-shadow-[0_8px_18px_rgba(0,0,0,0.85)] max-w-4xl">
            12 NGUYỄN TRI PHƯƠNG, THÀNH PHỐ ĐÀ LẠT, VIỆT NAM
          </h1>

          <p className="text-[10px] sm:text-xs md:text-sm lg:text-sm uppercase text-white/75 tracking-[0.18em] mb-5 max-w-3xl">
            Tận hưởng không gian nghỉ dưỡng sang trọng, cao cấp bậc nhất tại thành phố
            sương mù.
          </p>

          {/* Hàng nút liên hệ */}
          <div className="flex flex-wrap items-center gap-3 text-[10px] sm:text-xs md:text-sm tracking-[0.16em] uppercase">
            {/* Phone */}
            <a
              href="tel:+84942819936"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/40 text-white/90 hover:text-black hover:bg-white hover:border-white transition-all backdrop-blur-sm"
            >
              <span className="w-3.5 h-3.5 md:w-4 md:h-4 inline-flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="w-full h-full"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.5 3.75L5.25 6.75C5.25 6.75 6 9 8.25 11.25C10.5 13.5 12.75 14.25 12.75 14.25L15.75 12L18 13.5V18.75C18 19.1642 17.835 19.5605 17.5394 19.8561C17.2437 20.1518 16.8474 20.3168 16.4333 20.3168C13.8187 20.1684 11.3061 19.2736 9.18709 17.749C7.16676 16.3044 5.56559 14.3247 4.55433 12.0084C3.54307 9.69205 3.15847 7.12937 3.44152 4.60167C3.48305 4.22936 3.66008 3.88496 3.93665 3.6309C4.21323 3.37684 4.5715 3.23102 4.9455 3.21825H7.5Z"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span>+84 942819936</span>
            </a>

            {/* Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/30 text-white/80 hover:text-black hover:bg-white hover:border-white transition-all backdrop-blur-sm"
            >
              <span className="w-3.5 h-3.5 md:w-4 md:h-4 inline-flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="w-full h-full"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M13.5 10.5H15.75L15.25 13.5H13.5V21H10.5V13.5H8.25V10.5H10.5V8.8125C10.5 7.785 10.79 6.5925 11.4375 5.8575C12.085 5.1225 13.0225 4.75 14.25 4.75C15.165 4.75 15.9375 4.92 16.5 5.055V7.875H15.0625C14.4625 7.875 14.25 8.175 14.25 8.6475V10.5H13.5Z" />
                </svg>
              </span>
              <span>Facebook</span>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/30 text-white/80 hover:text-black hover:bg-white hover:border-white transition-all backdrop-blur-sm"
            >
              <span className="w-3.5 h-3.5 md:w-4 md:h-4 inline-flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="w-full h-full"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="4"
                    y="4"
                    width="16"
                    height="16"
                    rx="5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <circle cx="16.5" cy="7.5" r="0.8" fill="currentColor" />
                </svg>
              </span>
              <span>Instagram</span>
            </a>
          </div>
        </div>
      </div>

      {/* Nút mũi tên – đặt SAU content + z-30 cho chắc chắn */}
      <button
        type="button"
        onClick={prevSlide}
        className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-30 inline-flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full bg-black/40 backdrop-blur hover:bg-black/70 transition-all border border-white/20"
      >
        <span className="text-white text-lg md:text-xl">&#8249;</span>
      </button>

      <button
        type="button"
        onClick={nextSlide}
        className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-30 inline-flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full bg-black/40 backdrop-blur hover:bg-black/70 transition-all border border-white/20"
      >
        <span className="text-white text-lg md:text-xl">&#8250;</span>
      </button>
    </section>
  );
};

export default Hero;
