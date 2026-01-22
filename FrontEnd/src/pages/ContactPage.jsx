import React, { useState } from 'react';
import MainLayout from '../layout/MainLayout';
import Footer from '../layout/Footer';
import { 
    MapPin, Phone, Envelope, Clock, PaperPlaneRight, 
    FacebookLogo, InstagramLogo, YoutubeLogo, ChatCircleText, Car,
    SealCheck, HeartStraight, Tag // Thêm icon mới
} from '@phosphor-icons/react';

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTimeout(() => {
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', message: '' });
    }, 1000);
  };

  return (
    <MainLayout>
      {/* 1. HERO BANNER CINEMATIC (Giữ nguyên) */}
      <div className="relative h-[60vh] md:h-[70vh] bg-neutral-900 flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 z-0">
            <img 
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop" 
                alt="Contact Hero" 
                className="w-full h-full object-cover opacity-50 animate-scale-slow"
            />
            <div className="absolute inset-0 bg-linear-to-t from-neutral-900 via-neutral-900/40 to-transparent"></div>
        </div>
        <div className="relative z-10 px-6 max-w-4xl mt-10">
            <div className="flex justify-center mb-6 text-amber-400 opacity-80 animate-fadeIn">
                <ChatCircleText size={40} weight="thin" />
            </div>
            <p className="text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-white/70 mb-4 animate-fadeIn">
                Khách sạn Thanh Thảo
            </p>
            <h1 className="text-4xl md:text-6xl font-playfair italic font-medium text-white mb-6 leading-tight animate-fadeIn">
                Liên hệ với chúng tôi
            </h1>
            <div className="w-20 h-px bg-white/50 mx-auto mb-8"></div>
            <p className="text-white/80 font-light text-lg max-w-2xl mx-auto font-serif italic">
                "Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ để kỳ nghỉ của bạn tại Đà Lạt trở nên hoàn hảo nhất."
            </p>
        </div>
      </div>

      {/* 2. CONTACT INFO CARDS (Giữ nguyên) */}
      <div className="relative z-20 container mx-auto px-6 -mt-20 mb-24">
        <div className="bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] p-8 md:p-12 max-w-6xl mx-auto border-t-4 border-amber-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 divide-y md:divide-y-0 md:divide-x divide-neutral-100">
                {/* Địa chỉ */}
                <div className="flex flex-col items-center text-center p-4">
                    <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center text-amber-700 mb-6">
                        <MapPin size={32} weight="light" />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-[0.15em] mb-4 text-neutral-900">Địa Chỉ</h3>
                    <p className="text-neutral-500 font-serif text-lg leading-relaxed">
                        12 Nguyễn Tri Phương,<br/> Phường 2, Thành phố Đà Lạt,<br/> Lâm Đồng, Việt Nam
                    </p>
                </div>
                {/* Liên hệ */}
                <div className="flex flex-col items-center text-center p-4 pt-8 md:pt-4">
                    <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center text-amber-700 mb-6">
                        <Phone size={32} weight="light" />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-[0.15em] mb-4 text-neutral-900">Đặt Phòng & Hỗ Trợ</h3>
                    <div className="space-y-2">
                        <p className="text-neutral-600 font-medium text-lg">0942.819.936</p>
                        <p className="text-neutral-400 text-sm font-light italic">info@thanhthaohotel.com</p>
                    </div>
                </div>
                {/* Giờ làm việc & MXH */}
                <div className="flex flex-col items-center text-center p-4 pt-8 md:pt-4">
                    <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center text-amber-700 mb-6">
                        <Clock size={32} weight="light" />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-[0.15em] mb-4 text-neutral-900">Kết Nối</h3>
                    <p className="text-neutral-500 text-sm mb-4">Lễ tân trực 24/7</p>
                    <div className="flex gap-4">
                        {/* Social Icons... */}
                        <a href="#" className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-400 hover:bg-black hover:text-white hover:border-black transition-all"><FacebookLogo size={20} weight="fill"/></a>
                        <a href="#" className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-400 hover:bg-black hover:text-white hover:border-black transition-all"><InstagramLogo size={20} weight="fill"/></a>
                        <a href="#" className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-400 hover:bg-black hover:text-white hover:border-black transition-all"><YoutubeLogo size={20} weight="fill"/></a>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* 3. FORM & MAP SECTION (Giữ nguyên) */}
      <div className="bg-stone-50 py-24">
        <div className="container mx-auto px-6 max-w-7xl">
            <div className="flex flex-col lg:flex-row gap-16">
                {/* LEFT: MESSAGE FORM */}
                <div className="w-full lg:w-5/12">
                    {/* ... (Phần form giữ nguyên như code trước) ... */}
                    <div className="mb-10">
                        <span className="text-amber-700 text-xs font-bold uppercase tracking-widest mb-2 block">Gửi Tin Nhắn</span>
                        <h2 className="text-3xl md:text-4xl font-playfair font-medium text-neutral-900 mb-4">Chúng tôi có thể giúp gì cho bạn?</h2>
                        <p className="text-neutral-500 font-light leading-relaxed">Mọi thắc mắc về đặt phòng, dịch vụ hoặc hợp tác, vui lòng để lại thông tin. Đội ngũ Thanh Thảo sẽ phản hồi trong vòng 24 giờ.</p>
                    </div>
                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="space-y-8">
                             <div className="group relative"><input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full bg-transparent border-b border-neutral-300 py-3 text-neutral-900 outline-none focus:border-black transition-colors peer" placeholder=" "/><label className="absolute left-0 top-3 text-neutral-400 text-sm transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-black peer-not-placeholder-shown:-top-4 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-black pointer-events-none">Họ và tên *</label></div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="group relative"><input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full bg-transparent border-b border-neutral-300 py-3 text-neutral-900 outline-none focus:border-black transition-colors peer" placeholder=" "/><label className="absolute left-0 top-3 text-neutral-400 text-sm transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-black peer-not-placeholder-shown:-top-4 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-black pointer-events-none">Email *</label></div>
                                <div className="group relative"><input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full bg-transparent border-b border-neutral-300 py-3 text-neutral-900 outline-none focus:border-black transition-colors peer" placeholder=" "/><label className="absolute left-0 top-3 text-neutral-400 text-sm transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-black peer-not-placeholder-shown:-top-4 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-black pointer-events-none">Số điện thoại *</label></div>
                            </div>
                            <div className="group relative"><textarea name="message" rows="4" required value={formData.message} onChange={handleChange} className="w-full bg-transparent border-b border-neutral-300 py-3 text-neutral-900 outline-none focus:border-black transition-colors resize-none peer" placeholder=" "></textarea><label className="absolute left-0 top-3 text-neutral-400 text-sm transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-black peer-not-placeholder-shown:-top-4 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-black pointer-events-none">Nội dung tin nhắn</label></div>
                            <button type="submit" className="bg-black text-white px-10 py-4 rounded-none uppercase tracking-[0.2em] text-xs font-bold cursor-pointer hover:bg-amber-700 transition-all duration-300 flex items-center gap-2 group"><span>Gửi Tin Nhắn</span><PaperPlaneRight size={16} weight="fill" className="group-hover:translate-x-1 transition-transform"/></button>
                        </form>
                    ) : (
                        <div className="bg-white p-8 border border-neutral-200 text-center animate-fadeIn"><div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600 mx-auto mb-4"><PaperPlaneRight size={32} weight="fill" /></div><h3 className="text-xl font-serif font-bold text-neutral-900 mb-2">Cảm ơn bạn!</h3><p className="text-neutral-500 font-light text-sm">Tin nhắn đã được gửi thành công. Chúng tôi sẽ phản hồi sớm nhất.</p><button onClick={() => setSubmitted(false)} className="mt-6 text-xs font-bold uppercase underline hover:text-amber-700">Gửi tin nhắn khác</button></div>
                    )}
                </div>

                {/* RIGHT: MAP & DIRECTIONS */}
                <div className="w-full lg:w-7/12 h-[500px] lg:h-auto relative bg-neutral-200">
                    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3903.2877902405393!2d108.44192461099688!3d11.95456563630656!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317112d959588667%3A0x629555c4d6232d36!2zMTIgTmd1eeG7hW4gVHJpIFBoQcawbmcsIFBoxrDhu51uZyA0LCBUaMOgbmggcGjhu5EgxJDDoCBMYXZ0LCBMw6JtIMSQ4buTbmcgNjcwMDAsIFZpZXRuYW0!5e0!3m2!1sen!2s!4v1705340000000!5m2!1sen!2s" width="100%" height="100%" style={{ border: 0, filter: 'grayscale(100%) contrast(1.1) opacity(0.85)' }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="absolute inset-0 w-full h-full grayscale hover:grayscale-0 transition-all duration-700"></iframe>
                    <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-6 shadow-lg border border-neutral-100 hidden md:block">
                         <div className="flex items-start gap-4">
                            <div className="shrink-0 p-3 bg-neutral-900 text-white rounded-full"><Car size={24}/></div>
                            <div><h4 className="text-sm font-bold uppercase tracking-widest text-neutral-900 mb-2">Chỉ dẫn đường đi</h4><p className="text-xs text-neutral-600 leading-relaxed font-light">Cách chợ Đà Lạt khoảng 5 phút đi xe. Từ bùng binh nước (Hồ Xuân Hương), đi theo hướng đường Nguyễn Văn Cừ, rẽ vào đường Nguyễn Tri Phương. Khách sạn nằm bên tay phải, số 12.</p></div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="bg-white py-24 pb-30 relative z-10">
        <div className="container mx-auto px-0 md:px-6 max-w-7xl">
            
            {/* Header */}
            <div className="text-center mb-20 px-6">
                <span className="text-amber-700 text-xs font-bold uppercase tracking-[0.2em] mb-3 block">Tại sao chọn Thanh Thảo?</span>
                <h2 className="text-3xl md:text-5xl font-playfair font-medium text-neutral-900">Trải nghiệm sự khác biệt</h2>
                <div className="w-12 h-0.5 bg-neutral-200 mx-auto mt-6"></div>
            </div>

            {/* ZIG-ZAG LIST */}
            <div className="flex flex-col gap-16 md:gap-32">
                        
                        {/* ITEM 1: CHẤT LƯỢNG PHÒNG */}
                        {/* [FIX] Dùng min-h-[500px] thay vì h-[500px] để tránh tràn text */}
                        <div className="flex flex-col md:flex-row min-h-[500px] group">
                            {/* Image Side */}
                            <div className="w-full md:w-1/2 min-h-[300px] md:min-h-full relative overflow-hidden">
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10"></div>
                                <img 
                                    src="https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2070&auto=format&fit=crop" 
                                    alt="Room Quality" 
                                    className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                                />
                            </div>
                            {/* Content Side */}
                            <div className="w-full md:w-1/2 bg-stone-50 p-10 md:p-16 flex flex-col justify-center relative">
                                <span className="absolute top-6 right-6 text-6xl font-playfair font-black text-neutral-200 opacity-50 select-none">01</span>
                                
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-amber-700 mb-6 shadow-sm">
                                    <SealCheck size={24} weight="fill" />
                                </div>
                                <h3 className="text-2xl md:text-3xl font-playfair font-bold text-neutral-900 mb-4 leading-tight">
                                    Không gian nghỉ dưỡng <br/> hoàn hảo
                                </h3>
                                <p className="text-neutral-500 font-light leading-relaxed text-sm md:text-base mb-8">
                                    Chúng tôi hiểu rằng giấc ngủ là điều xa xỉ nhất. Từng căn phòng tại Thanh Thảo được thiết kế tinh tế với nội thất gỗ ấm cúng, nệm tiêu chuẩn 5 sao và hệ thống cách âm tuyệt đối.
                                </p>
                                <div className="w-20 h-px bg-amber-700"></div>
                            </div>
                        </div>

                        {/* ITEM 2: CHẤT LƯỢNG DỊCH VỤ */}
                        <div className="flex flex-col md:flex-row-reverse min-h-[500px] group">
                            <div className="w-full md:w-1/2 min-h-[300px] md:min-h-full relative overflow-hidden">
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10"></div>
                                <img 
                                    src="https://cdn.eva.vn//upload/2-2015/images/2015-06-02/1433212119-cq3a2969.jpg" 
                                    alt="Service" 
                                    className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                                />
                            </div>
                            <div className="w-full md:w-1/2 bg-neutral-900 text-white p-10 md:p-16 flex flex-col justify-center relative">
                                <span className="absolute top-6 left-6 text-6xl font-playfair font-black text-white opacity-5 select-none">02</span>

                                <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center text-amber-400 mb-6 shadow-sm border border-neutral-700">
                                    <HeartStraight size={24} weight="fill" />
                                </div>
                                <h3 className="text-2xl md:text-3xl font-playfair font-bold text-white mb-4 leading-tight">
                                    Phục vụ tận tâm <br/> từ trái tim
                                </h3>
                                <p className="text-neutral-400 font-light leading-relaxed text-sm md:text-base mb-8">
                                    Đội ngũ nhân viên bản địa am hiểu Đà Lạt luôn sẵn sàng hỗ trợ 24/7. Từ việc đặt bàn tại nhà hàng hot nhất đến tư vấn lịch trình săn mây, chúng tôi chăm chút từng trải nghiệm nhỏ nhất của bạn.
                                </p>
                                <div className="w-20 h-px bg-amber-400"></div>
                            </div>
                        </div>

                        {/* ITEM 3: KHUYẾN MÃI */}
                        <div className="flex flex-col md:flex-row min-h-[500px] group">
                            <div className="w-full md:w-1/2 min-h-[300px] md:min-h-full relative overflow-hidden">
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10"></div>
                                <img 
                                    src="https://cdn2.fptshop.com.vn/unsafe/Uploads/images/tin-tuc/169262/Originals/cach-tao-dang-chup-anh-o-bien-cho-nu-3.jpg" 
                                    alt="Offer" 
                                    className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                                />
                            </div>
                            <div className="w-full md:w-1/2 bg-stone-50 p-10 md:p-16 flex flex-col justify-center relative">
                                <span className="absolute top-6 right-6 text-6xl font-playfair font-black text-neutral-200 opacity-50 select-none">03</span>

                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-amber-700 mb-6 shadow-sm">
                                    <Tag size={24} weight="fill" />
                                </div>
                                <h3 className="text-2xl md:text-3xl font-playfair font-bold text-neutral-900 mb-4 leading-tight">
                                    Đặc quyền ưu đãi <br/> hấp dẫn
                                </h3>
                                <p className="text-neutral-500 font-light leading-relaxed text-sm md:text-base mb-8">
                                    Đặt phòng trực tiếp chưa bao giờ hời đến thế. Tặng ngay set trà chiều, ưu đãi đưa đón sân bay và chính sách linh hoạt đổi ngày. Luôn có quà tặng bất ngờ chờ đón bạn khi check-in.
                                </p>
                                <div className="w-20 h-px bg-amber-700"></div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <Footer />
    </MainLayout>
  );
};

export default ContactPage;