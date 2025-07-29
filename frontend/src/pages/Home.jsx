import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaRegImage, FaRegFileVideo, FaRegFileAlt, FaRegFileAudio, FaRegFileArchive, FaGithub, FaInstagram, FaLinkedin, FaFacebook } from "react-icons/fa";
import heroImg from "../assets/hero.png";
// Removed imageIcon, videoIcon, docIcon, audioIcon, zipIcon imports

const categories = [
  { name: "Images", path: "/images", desc: "Convert between JPG, PNG, WEBP, and more", icon: <FaRegImage className="w-8 h-8 text-primary" /> },
  { name: "Videos", path: "/videos", desc: "Convert between MP4, MOV, AVI, and more", icon: <FaRegFileVideo className="w-8 h-8 text-primary" /> },
  { name: "Documents", path: "/documents", desc: "Convert between PDF, DOCX, TXT, and more", icon: <FaRegFileAlt className="w-8 h-8 text-primary" /> },
  { name: "Audio", path: "/audio", desc: "Convert between MP3, WAV, AAC, and more", icon: <FaRegFileAudio className="w-8 h-8 text-primary" /> },
  { name: "ZIP", path: "/zip", desc: "Convert between ZIP, RAR, 7Z, and more", icon: <FaRegFileArchive className="w-8 h-8 text-primary" /> },
];

const conversions = [
  { title: "JPG to PNG", desc: "Convert JPG images to PNG format", category: "images", icon: <FaRegImage className="w-6 h-6 text-primary" /> },
  { title: "PDF to DOCX", desc: "Convert PDF documents to DOCX format", category: "documents", icon: <FaRegFileAlt className="w-6 h-6 text-primary" /> },
  { title: "MP4 to MP3", desc: "Extract audio from MP4 videos.", category: "audio", icon: <FaRegFileAudio className="w-6 h-6 text-primary" /> },
  { title: "WEBP to JPG", desc: "Convert WEBP images to JPG format", category: "images", icon: <FaRegImage className="w-6 h-6 text-primary" /> },
  { title: "ZIP to RAR", desc: "Convert ZIP archives to RAR format", category: "zip", icon: <FaRegFileArchive className="w-6 h-6 text-primary" /> },
  { title: "MOV to MP4", desc: "Convert MOV videos to MP4 format", category: "videos", icon: <FaRegFileVideo className="w-6 h-6 text-primary" /> },
];

const fadeLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeInOut" } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay: i * 0.09, ease: "easeInOut" } }),
};
const fadeRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeInOut", delay: 0.5 } },
};
const stagger = {
  visible: { transition: { staggerChildren: 0.13 } },
};

export default function Home() {
  const navigate = useNavigate();
  const categoryRef = useRef(null);
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-12 py-6 border-b bg-white">
        <div className="font-bold text-2xl flex items-center gap-2">
          <span className="text-[#000000]">ConvertEase</span>
        </div>
        <nav className="flex gap-8 text-[15px] font-medium text-gray-700">
          <button onClick={() => navigate('/images')} className="hover:text-[#F25C54] focus:outline-none bg-transparent border-none cursor-pointer">Images</button>
          <button onClick={() => navigate('/videos')} className="hover:text-[#F25C54] focus:outline-none bg-transparent border-none cursor-pointer">Videos</button>
          <button onClick={() => navigate('/documents')} className="hover:text-[#F25C54] focus:outline-none bg-transparent border-none cursor-pointer">Documents</button>
          <button onClick={() => navigate('/audio')} className="hover:text-[#F25C54] focus:outline-none bg-transparent border-none cursor-pointer">Audio</button>
          <button onClick={() => navigate('/zip')} className="hover:text-[#F25C54] focus:outline-none bg-transparent border-none cursor-pointer">ZIP</button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="w-full flex flex-col md:flex-row items-center justify-between px-12 bg-[#FFECEC] border-b min-h-[420px]" style={{minHeight: 420}}>
        <div className="flex-1 flex flex-col justify-center gap-6 pr-0 md:pr-12 py-20">
          <motion.h1
            className="text-[40px] leading-[1.1] font-bold text-[#000000] mb-2 tracking-wide"
            variants={fadeLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.7 }}
          >
            Convert any file <br />
            <span className="text-[#F25C54]">quickly</span>{" "}
            <span className="text-[#000000]">and</span>{" "}
            <span className="text-[#F25C54]">easily</span>
          </motion.h1>
          <motion.p
            className="text-[17px] text-gray-500 max-w-lg mb-2"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.7 }}
            custom={2}
          >
            Free online file converter. No registration required. Convert images, videos, documents, audio, and ZIP files in seconds.
          </motion.p>
          <motion.div
            className="flex gap-4 mt-2"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.7 }}
          >
            <motion.button
              className="bg-[#F25C54] text-white px-7 py-3 rounded-full font-semibold shadow-md hover:bg-[#e57373] transition text-[15px]"
              variants={fadeUp}
              custom={3}
              onClick={() => {
                if (categoryRef.current) {
                  categoryRef.current.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >Upload Files</motion.button>
            <motion.button
              className="bg-white border border-[#F25C54] text-[#F25C54] px-7 py-3 rounded-full font-semibold shadow-md hover:bg-[#F1F3F6] transition text-[15px]"
              variants={fadeUp}
              custom={4}
              onClick={() => {
                if (categoryRef.current) {
                  categoryRef.current.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >Explore Categories</motion.button>
          </motion.div>
        </div>
        <motion.div
          className="flex-1 flex items-center justify-end w-full mt-10 md:mt-0"
          variants={fadeRight}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.7 }}
        >
          {/* Hero Image - responsive, right-aligned, no shadow or padding */}
          <img
            src={heroImg}
            alt="File conversion illustration"
            className="max-w-[540px] w-full h-auto object-contain m-0 p-0"
          />
        </motion.div>
      </section>

      {/* Category Section */}
      <motion.section ref={categoryRef} className="py-20 bg-[#F7F8FA]" variants={stagger} initial="hidden" whileInView="visible">
        <h2 className="text-[22px] font-bold text-[#000000] text-center mb-12">Choose a Category</h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-8">
          {categories.map((cat, i) => (
            <motion.button
              key={cat.name}
              onClick={() => navigate(cat.path)}
              className="flex flex-col justify-between items-center bg-white border border-primary/10 rounded-[20px] p-8 hover:bg-[#F1F3F6] transition shadow-lg group min-h-[220px] h-full"
              style={{ minHeight: 220 }}
              variants={fadeUp}
              custom={i}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 120, damping: 24 }}
            >
              <div className="flex flex-col items-center">
                <div className="w-[56px] h-[56px] rounded-full bg-primary/20 flex items-center justify-center mb-3">
                  {cat.icon}
                </div>
                <span className="text-[17px] font-bold text-[#000000] mb-1">{cat.name}</span>
                <span className="text-[13px] text-gray-500 text-center mb-1">{cat.desc}</span>
              </div>
              <span className="text-base font-extrabold text-[#f25c54] mt-1" style={{ textShadow: '0 1px 4px #f25c5440' }}>View Converters →</span>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section className="py-20 bg-white border-t" variants={stagger} initial="hidden" whileInView="visible">
        <h2 className="text-[22px] font-bold text-[#000000] text-center mb-10">How It Works</h2>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          {[1, 2, 3].map((step, i) => (
            <motion.div
              key={step}
              className="bg-[#F7F8FA] rounded-[20px] shadow-lg p-10 flex flex-col items-center"
              variants={fadeUp}
              custom={i}
            >
              <div className="w-[56px] h-[56px] rounded-full bg-primary/20 flex items-center justify-center text-[22px] font-bold text-primary mb-4">{step}</div>
              <div className="font-bold text-[17px] mb-2 text-[#000000]">{["Upload", "Convert", "Download"][i]}</div>
              <div className="text-gray-500 text-center text-[15px]">
                {[
                  "Drag and drop your files or use the file picker to upload your files",
                  "Select your desired output format and click the convert button",
                  "Download your converted files instantly to your device",
                ][i]}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Popular Conversions Section */}
      <motion.section className="py-20 bg-[#F7F8FA] border-t" variants={stagger} initial="hidden" whileInView="visible">
        <h2 className="text-[22px] font-bold text-[#000000] text-center mb-10">Popular Conversions</h2>
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {conversions.map((conv, i) => (
            <motion.div
              key={conv.title}
              className="bg-white border border-primary/10 rounded-[20px] p-8 flex flex-col gap-2 shadow-lg min-h-[150px]"
              variants={fadeUp}
              custom={i}
              whileHover={{ scale: 1.04 }}
              transition={{ type: "spring", stiffness: 120, damping: 24 }}
            >
              <div className="w-[44px] h-[44px] rounded-full bg-primary/20 flex items-center justify-center mb-2">
                {conv.icon}
              </div>
              <div className="font-bold text-[#000000] text-[18px]">{conv.title}</div>
              <div className="text-[13px] text-gray-500 mb-2">{conv.desc}</div>
              <motion.button
                className="bg-primary text-white rounded-full px-4 py-2 text-[14px] font-semibold hover:bg-[#e57373] transition self-start shadow-md"
                whileHover={{ scale: 1.08 }}
                transition={{ type: "spring", stiffness: 120, damping: 24 }}
                onClick={() => navigate(`/${conv.category}`)}
              >
                Convert Now
              </motion.button>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Ready to Convert Section */}
      <section className="py-20 bg-[#FFECEC] border-t flex flex-col items-center">
        <div className="text-[22px] font-bold mb-4 text-center text-[#000000]">Ready to Convert Your Files?</div>
        <div className="text-gray-500 mb-7 text-center max-w-xl text-[15px]">Start converting your files for free. No registration required. Fast, secure, and easy to use.</div>
        <button
          className="bg-primary text-white px-8 py-4 rounded-full font-semibold shadow-md hover:bg-[#e57373] transition text-lg"
          onClick={() => {
            if (categoryRef.current) {
              categoryRef.current.scrollIntoView({ behavior: "smooth" });
            }
          }}
        >
          Upload Files Now
        </button>
      </section>

      {/* Footer */}
      <footer className="w-full bg-white border-t py-12 mt-0">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center text-gray-500 text-[15px] gap-4 px-4">
          <div className="font-bold text-[#000000] text-[17px] mb-2 md:mb-0">ConvertEase</div>
          <div className="flex gap-12">
            <div>
              <div className="font-bold text-[#000000] mb-1 text-[15px]">Categories</div>
              <div>Images<br />Videos<br />Documents<br />Audio<br />ZIP</div>
            </div>
            <div>
              <div className="font-bold text-[#000000] mb-1 text-[15px]">Company</div>
              <div>About Us<br />Privacy Policy<br />Terms of Service<br />Contact Us</div>
            </div>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a
              aria-label="GitHub"
              href="https://github.com/Aayush-207"
              className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-primary/20 transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaGithub className="w-6 h-6 text-primary" />
            </a>
            <a
              aria-label="Instagram"
              href="https://www.instagram.com/aayush_raut_207/"
              className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-primary/20 transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram className="w-6 h-6 text-primary" />
            </a>
            <button aria-label="LinkedIn" className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-primary/20 transition" onClick={() => {}}>
              <FaLinkedin className="w-6 h-6 text-primary" />
            </button>
            <button aria-label="Facebook" className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-primary/20 transition" onClick={() => {}}>
              <FaFacebook className="w-6 h-6 text-primary" />
            </button>
          </div>
        </div>
        <div className="text-center text-xs text-gray-400 mt-6">© 2023 ConvertEase. All rights reserved.</div>
      </footer>
    </div>
  );
} 