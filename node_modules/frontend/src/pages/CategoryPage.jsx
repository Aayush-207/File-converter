import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Add useEffect for scroll to top
import { useEffect } from "react";

const categoryFormats = {
  images: ["JPG", "PNG", "WEBP", "GIF", "BMP", "TIFF"],
  videos: ["MP4", "MOV", "AVI", "MKV"],
  documents: ["PDF", "DOCX", "TXT", "XLSX"],
  audio: ["MP3", "WAV", "AAC", "OGG"],
  zip: ["ZIP", "RAR", "7Z"],
};

const categoryLabels = {
  images: "Images Converter",
  videos: "Videos Converter",
  documents: "Documents Converter",
  audio: "Audio Converter",
  zip: "ZIP Converter",
};

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.09, ease: "easeInOut" } }),
};
const stagger = {
  visible: { transition: { staggerChildren: 0.13 } },
};

// Set your backend API URL here for deployment or local development
// const API_URL = "http://localhost:5000"; // Uncomment for local development
const API_URL = "https://file-converter-azdm.onrender.com"; // Use your actual Render backend URL

export default function CategoryPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null); // single file for most, array for multi
  const [format, setFormat] = useState("");
  const [convertedUrl, setConvertedUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bugText, setBugText] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [category]);

  const handleFileChange = (e) => {
    if (allowsMultiple) {
      let files = Array.from(e.target.files);
      // For folder selection, flatten files
      setFile(files);
    } else {
      setFile(e.target.files[0]);
    }
    setConvertedUrl("");
    setError("");
  };

  const handleConvert = async () => {
    if (!file || !format) return;
    // For multi, require at least one file
    if (allowsMultiple && (!Array.isArray(file) || file.length === 0)) return;
    setLoading(true);
    setError("");
    const formData = new FormData();
    if (allowsMultiple) {
      file.forEach(f => formData.append("file", f));
    } else {
      formData.append("file", file);
    }
    formData.append("format", format);
    try {
      const res = await fetch(`${API_URL}/api/convert`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        // Try to get the most specific error message from backend
        let reason = "Conversion failed.";
        try {
          const data = await res.clone().json();
          if (data && data.error) reason = data.error;
        } catch (e) {
          try {
            const text = await res.clone().text();
            if (text) reason = text;
          } catch {}
        }
        setError(reason);
        throw new Error(reason);
      }
      const blob = await res.blob();
      setConvertedUrl(URL.createObjectURL(blob));
    } catch (err) {
      // Only show a generic message if no specific error is set
      if (!error) setError("Conversion failed. Please try again.");
    }
    setLoading(false);
  };

  // Helper to get file type label and icon
  const getFileTypeInfo = (file) => {
    if (!file) return { label: '', icon: null };
    const type = file.type;
    const name = file.name.toLowerCase();
    if (type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|bmp|tiff)$/.test(name)) {
      return { label: 'Image uploaded!', icon: <span className="text-green-500 text-xl mr-2">🖼️</span> };
    }
    if (type.startsWith('audio/') || /\.(mp3|wav|aac|ogg)$/.test(name)) {
      return { label: 'Audio uploaded!', icon: <span className="text-green-500 text-xl mr-2">🎵</span> };
    }
    if (type.startsWith('video/') || /\.(mp4|mov|avi|mkv)$/.test(name)) {
      return { label: 'Video uploaded!', icon: <span className="text-green-500 text-xl mr-2">🎬</span> };
    }
    if (type === 'application/pdf' || /\.(pdf|docx|txt|xlsx)$/.test(name)) {
      return { label: 'Document uploaded!', icon: <span className="text-green-500 text-xl mr-2">📄</span> };
    }
    if (type === 'application/zip' || /\.(zip|rar|7z)$/.test(name)) {
      return { label: 'Archive uploaded!', icon: <span className="text-green-500 text-xl mr-2">🗜️</span> };
    }
    return { label: 'File uploaded!', icon: <span className="text-green-500 text-xl mr-2">✅</span> };
  };

  // Helper to determine if current category allows multiple files
  const allowsMultiple = category === 'documents' || category === 'zip';

  const formats = categoryFormats[category] || [];
  const label = categoryLabels[category] || "Converter";

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col font-sans">
      <motion.header
        className="w-full flex items-center justify-between px-8 py-6 border-b bg-white"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={0}
      >
        <div className="font-bold text-2xl flex items-center gap-2 cursor-pointer text-[#000000]" onClick={() => navigate("/")}>ConvertEase</div>
        <nav className="space-x-6 text-gray-600 font-medium">
          <button onClick={() => navigate("/")} className="hover:text-[#f25c54] focus:outline-none bg-transparent border-none cursor-pointer">Home</button>
        </nav>
      </motion.header>
      <main className="flex-1 flex flex-col items-center justify-center py-12">
        <motion.div
          className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.7 }}
        >
          <motion.button
            className="self-start text-[#f25c54] mb-4 hover:underline font-semibold"
            onClick={() => navigate("/")}
            variants={fadeUp}
            custom={1}
            whileHover={{ scale: 1.06 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          >{"<- Back to Home"}</motion.button>
          <motion.h1
            className="text-3xl font-bold text-[#000000] mb-2"
            variants={fadeUp}
            custom={2}
          >{label}</motion.h1>
          <motion.p
            className="text-gray-500 mb-6"
            variants={fadeUp}
            custom={3}
          >Upload your {category} file and convert it instantly to your desired format.</motion.p>
          <motion.div
            className="w-full flex flex-col items-center mb-6"
            variants={stagger}
          >
            <motion.label
              htmlFor="file-upload"
              className="w-full cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-[#f25c54]/30 rounded-xl py-8 bg-[#f7f8fa] hover:bg-[#f1f3f6] transition mb-4"
              variants={fadeUp}
              custom={4}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 120, damping: 22 }}
            >
              <span className="text-4xl mb-2">{category === 'images' ? '🖼️' : category === 'videos' ? '🎬' : category === 'documents' ? '📄' : category === 'audio' ? '🎵' : '🗜️'}</span>
              <span className="text-gray-600">Drag & Drop your file here or <span className="text-[#f25c54] underline font-semibold">Browse Files</span></span>
              <input
                id="file-upload"
                type="file"
                accept={category === 'documents' ? '.pdf,.docx,.txt,.xlsx,image/*' : category === 'zip' ? '.zip,.rar,.7z,application/zip,application/x-zip-compressed,application/x-rar-compressed,application/x-7z-compressed' : '*'}
                className="hidden"
                onChange={handleFileChange}
                multiple={allowsMultiple}
                {...(category === 'zip' ? { webkitdirectory: 'true', directory: 'true' } : {})}
              />
            </motion.label>
            {/* Show selected files for multi, or single for others */}
            {allowsMultiple && Array.isArray(file) && file.length > 0 && (
              <motion.div
                className="flex flex-col items-start text-sm text-green-600 font-semibold mb-2 w-full"
                variants={fadeUp}
                custom={5}
                initial="hidden"
                animate="visible"
                key={file.map(f => f.name).join(',')}
              >
                {file.map((f, idx) => (
                  <div key={f.name + idx} className="flex items-center mb-1">
                    {getFileTypeInfo(f).icon}
                    {f.name}
                  </div>
                ))}
              </motion.div>
            )}
            {!allowsMultiple && file && (
              <motion.div
                className="flex items-center text-sm text-green-600 font-semibold mb-2"
                variants={fadeUp}
                custom={5}
                initial="hidden"
                animate="visible"
                key={file.name}
              >
                {getFileTypeInfo(file).icon}
                {getFileTypeInfo(file).label}
              </motion.div>
            )}
            <motion.select
              className="w-full mt-2 px-4 py-3 rounded-lg border border-[#f25c54]/30 focus:ring-2 focus:ring-[#f25c54] outline-none bg-[#f7f8fa] text-[#000000] font-semibold"
              value={format}
              onChange={e => { setFormat(e.target.value); setError(""); }}
              variants={fadeUp}
              custom={6}
            >
              <option value="">Choose format...</option>
              {formats.map(fmt => (
                <option key={fmt} value={fmt.toLowerCase()}>{fmt}</option>
              ))}
            </motion.select>
            {/* Always show Convert button, regardless of state */}
            <motion.button
              className="w-full mt-6 bg-[#f25c54] text-white py-3 rounded-xl font-bold text-lg shadow hover:bg-[#e57373] transition disabled:opacity-50"
              disabled={!file || !format || loading}
              onClick={handleConvert}
              variants={fadeUp}
              custom={7}
              whileHover={{ scale: (!file || !format || loading) ? 1 : 1.03 }}
              transition={{ type: "spring", stiffness: 120, damping: 22 }}
            >
              {loading ? "Converting..." : "Convert File"}
            </motion.button>
            {/* Show error message only after a failed conversion attempt, below the button */}
            {file && format && !convertedUrl && error && (
              <motion.div
                className="flex items-center text-sm text-gray-500 font-semibold mt-2"
                variants={fadeUp}
                custom={7.5}
                initial="hidden"
                animate="visible"
                key={error}
              >
                <span className="text-gray-400 text-xl mr-2">❌</span>
                {error}
              </motion.div>
            )}
            {convertedUrl && (
              <motion.a
                href={convertedUrl}
                download={`converted.${format}`}
                className="w-full mt-4 bg-white border-2 border-[#f25c54] text-[#000000] py-3 rounded-xl font-bold text-lg shadow text-center block hover:bg-[#f7f8fa] transition"
                variants={fadeUp}
                custom={8}
                initial="hidden"
                animate="visible"
              >
                Download Converted File
              </motion.a>
            )}
          </motion.div>
        </motion.div>
      </main>
      {/* Bug report box */}
      <motion.div
        className="w-full flex justify-center mb-8"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.7 }}
        custom={8.5}
      >
        <div className="w-full max-w-xl bg-white rounded-2xl shadow p-6 flex flex-col items-center border border-[#f25c54]/20">
          <div className="font-semibold text-lg mb-2 text-[#f25c54]">Found any bug? Let us know!</div>
          <textarea
            className="w-full min-h-[60px] max-h-[120px] border border-gray-300 rounded-lg p-2 mb-3 resize-y focus:ring-2 focus:ring-[#f25c54] outline-none"
            placeholder="Describe the bug here..."
            value={bugText}
            onChange={e => setBugText(e.target.value)}
          />
          <button
            className="bg-[#f25c54] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#e57373] transition disabled:opacity-50"
            disabled={!bugText.trim()}
            onClick={() => {
              const subject = encodeURIComponent('Bug Report from ConvertEase');
              const body = encodeURIComponent(bugText);
              window.location.href = `mailto:aayushraut2006@gmail.com?subject=${subject}&body=${body}`;
            }}
          >
            Send Bug Report
          </button>
        </div>
      </motion.div>
    </div>
  );
}