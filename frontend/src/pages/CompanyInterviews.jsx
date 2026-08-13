import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Search,
  Filter,
  Star,
  Clock,
  Users,
  BookOpen,
  ExternalLink,
  X,
  TrendingUp,
  Building2,
  Tag,
} from "lucide-react";
import PageShell from "../components/PageShell.jsx";
import Breadcrumb from "../components/Breadcrumb.jsx";

const COMPANIES = [
  { id: "google", name: "Google", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg", color: "#4285F4", bg: "#EAF0FF", roles: ["SWE", "PM", "Data Analyst"], difficulty: "Hard", rounds: 5, desc: "Known for algorithmic DSA, system design and Googleyness behaviorals." },
  { id: "amazon", name: "Amazon", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg", color: "#FF9900", bg: "#FFF4E0", roles: ["SDE", "PM", "Data Engineer"], difficulty: "Hard", rounds: 5, desc: "16 Leadership Principles drive every behavioral. Bar Raiser interview is unique." },
  { id: "microsoft", name: "Microsoft", logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg", color: "#00A4EF", bg: "#E4F8F2", roles: ["SWE", "PM", "Analyst"], difficulty: "Medium", rounds: 4, desc: "Focus on problem solving, culture-fit, and collaborative coding." },
  { id: "meta", name: "Meta", logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg", color: "#0081FB", bg: "#EAF0FF", roles: ["SWE", "PM", "ML Engineer"], difficulty: "Hard", rounds: 5, desc: "Move fast, be bold. DSA + system design + product sense." },
  { id: "apple", name: "Apple", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg", color: "#555555", bg: "#F5F5F7", roles: ["SWE", "Hardware Eng", "Designer"], difficulty: "Hard", rounds: 6, desc: "Deep technical depth, design aesthetics and passion for craft." },
  { id: "netflix", name: "Netflix", logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg", color: "#E50914", bg: "#FFEDEA", roles: ["SWE", "Data Scientist", "PM"], difficulty: "Hard", rounds: 4, desc: "Freedom & responsibility culture; huge emphasis on judgment & impact." },
  { id: "tcs", name: "TCS", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg", color: "#1E90FF", bg: "#EAF0FF", roles: ["Developer", "Analyst", "QA"], difficulty: "Easy", rounds: 3, desc: "TCS NQT, technical round and HR. Focus on basics and communication." },
  { id: "infosys", name: "Infosys", logo: "https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg", color: "#005A8E", bg: "#EAF0FF", roles: ["Systems Engineer", "Analyst"], difficulty: "Easy", rounds: 3, desc: "Hackwithinfy / InfyTQ, then verbal ability, logical, and HR." },
  { id: "wipro", name: "Wipro", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Wipro_Primary_Logo_Color_RGB.svg", color: "#8B7BE0", bg: "#EFECFC", roles: ["Project Engineer", "Analyst"], difficulty: "Easy", rounds: 3, desc: "WILP/WASE aptitude, technical, and HR rounds." },
  { id: "goldman", name: "Goldman Sachs", logo: "https://upload.wikimedia.org/wikipedia/commons/6/61/Goldman_Sachs.svg", color: "#7D6608", bg: "#FFF4E0", roles: ["Engineering", "Analyst", "Quant"], difficulty: "Hard", rounds: 5, desc: "HackerRank OA + super day of back-to-back technical and behavioral rounds." },
];

const VIDEOS = [
  { id: "g1", company: "google", title: "Google SWE Interview – Full DSA Mock", youtubeId: "oBt53YbR9Kk", duration: "45:18", views: "2.3M", tags: ["DSA", "Arrays", "Graphs"], difficulty: "Hard", questions: ["Given an array of integers, find two numbers that add up to a target sum.", "Design a data structure for LRU Cache.", "Find the number of islands in a matrix.", "Serialize and Deserialize a binary tree.", "Minimum window substring problem."] },
  { id: "g2", company: "google", title: "Google System Design – Design YouTube", youtubeId: "jPKTo1iGQiE", duration: "32:04", views: "1.8M", tags: ["System Design", "Scalability"], difficulty: "Hard", questions: ["How would you design YouTube at scale?", "How do you handle video encoding and storage?", "Design the recommendation algorithm.", "How would you handle CDN and global delivery?"] },
  { id: "a1", company: "amazon", title: "Amazon SDE Interview – Leadership Principles", youtubeId: "6tNS--WetLI", duration: "51:30", views: "3.1M", tags: ["Behavioral", "Leadership Principles", "STAR"], difficulty: "Medium", questions: ["Tell me about a time you disagreed with your manager.", "Describe a situation where you delivered a project under a tight deadline.", "Give an example of a time you took ownership beyond your role.", "How have you handled a failing project?", "Describe a time you made a data-driven decision."] },
  { id: "a2", company: "amazon", title: "Amazon Coding Interview – Dynamic Programming", youtubeId: "Hdr3PKNsyA4", duration: "39:12", views: "1.4M", tags: ["DSA", "DP", "Strings"], difficulty: "Hard", questions: ["Longest Common Subsequence", "Coin Change (minimum coins)", "Word Break Problem", "Jump Game II – minimum jumps"] },
  { id: "m1", company: "microsoft", title: "Microsoft SWE Interview – Problem Solving Round", youtubeId: "n3Nq8w7UfYQ", duration: "28:50", views: "980K", tags: ["DSA", "Trees", "Recursion"], difficulty: "Medium", questions: ["Implement a stack using queues.", "Find the diameter of a binary tree.", "Clone a linked list with a random pointer.", "Check if a string is a valid palindrome."] },
  { id: "f1", company: "meta", title: "Meta SWE Mock Interview – Coding Round", youtubeId: "oYlW8s-6tYU", duration: "37:44", views: "1.2M", tags: ["DSA", "Sliding Window", "Hashing"], difficulty: "Hard", questions: ["Longest substring without repeating characters.", "Group Anagrams.", "Find all permutations in a string.", "Maximum product subarray.", "Trapping Rain Water."] },
  { id: "f2", company: "meta", title: "Meta Product Manager Interview", youtubeId: "2BdvSGULAkQ", duration: "42:10", views: "780K", tags: ["Product Sense", "Metrics", "PM"], difficulty: "Hard", questions: ["How would you improve Facebook Marketplace?", "Design a metrics dashboard for Instagram stories.", "How would you handle a sudden 20% drop in DAU?", "Prioritize features for WhatsApp for 2025."] },
  { id: "f3", company: "meta", title: "Meta Software Engineer Interview Guide", youtubeId: "6SWrbyI0F1Y", duration: "45:00", views: "500K", tags: ["SWE", "Preparation", "Meta"], difficulty: "Hard", questions: ["How to prepare for Meta SWE interviews?", "Coding round strategies", "System design overview"] },
  { id: "f4", company: "meta", title: "Meta Interview Process & Questions", youtubeId: "gtM1RoWudQQ", duration: "30:00", views: "300K", tags: ["Process", "Behavioral", "Tips"], difficulty: "Medium", questions: ["What does Meta look for in candidates?", "Behavioral round expectations", "General interview tips"] },
  { id: "t1", company: "tcs", title: "TCS NQT 2024 – Full Preparation", youtubeId: "fz2CFlOa7pk", duration: "55:20", views: "4.5M", tags: ["Aptitude", "Verbal", "Reasoning"], difficulty: "Easy", questions: ["What is polymorphism? Give a real-world example.", "Explain the difference between stack and queue.", "What is normalization in databases?", "Write a program to reverse a linked list.", "Explain OOPS concepts with examples."] },
  { id: "i1", company: "infosys", title: "Infosys InfyTQ Interview Experience 2024", youtubeId: "FZU3n1mZQ4I", duration: "29:40", views: "2.1M", tags: ["Technical", "HR", "Java"], difficulty: "Easy", questions: ["Tell me about yourself.", "What is the difference between abstract class and interface?", "Explain SOLID principles.", "Write code to check if a number is prime.", "What are your strengths and weaknesses?"] },
  { id: "gs1", company: "goldman", title: "Goldman Sachs Engineering Interview – Quant & Algo", youtubeId: "v4cd1O4zkGw", duration: "43:55", views: "650K", tags: ["Algorithms", "Probability", "Finance"], difficulty: "Hard", questions: ["Design a trading order matching engine.", "Implement a fast median-finding algorithm.", "Given N fair coins, probability of more heads than tails?", "Optimize portfolio allocation algorithm."] },
  { id: "ap1", company: "apple", title: "Apple SWE Interview – iOS & System Design", youtubeId: "7d_VBdMFl18", duration: "36:22", views: "890K", tags: ["iOS", "System Design", "Swift"], difficulty: "Hard", questions: ["Design the App Store backend.", "How does memory management work in Swift/ARC?", "Build a concurrent image downloader.", "Explain Grand Central Dispatch vs OperationQueue.", "Design push notification architecture."] },
  { id: "n1", company: "netflix", title: "Netflix SWE Interview – Distributed Systems", youtubeId: "BeNrVl2_nyI", duration: "41:00", views: "560K", tags: ["Distributed Systems", "Streaming", "System Design"], difficulty: "Hard", questions: ["How does Netflix handle millions of concurrent streams?", "Design a content recommendation engine.", "Explain chaos engineering and Netflix's use of Chaos Monkey.", "How would you scale a video transcoding pipeline?"] },
  { id: "w1", company: "wipro", title: "Wipro Elite NTH Interview Preparation 2024", youtubeId: "4s3lhFNZhw0", duration: "34:15", views: "1.3M", tags: ["Aptitude", "Coding", "HR"], difficulty: "Easy", questions: ["Explain the concept of inheritance with an example.", "What are access modifiers in Java?", "Write a program to find the factorial of a number.", "What is deadlock in OS and how to prevent it?", "Where do you see yourself in 5 years?"] },
];

const DIFF_COLOR = {
  Easy: { bg: "bg-mint-soft", text: "text-mint" },
  Medium: { bg: "bg-amber-soft", text: "text-amber" },
  Hard: { bg: "bg-coral-soft", text: "text-coral" },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const cardAnim = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

function VideoModal({ video, company, onClose }) {
  const [tab, setTab] = useState("video");
  if (!video) return null;
  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
        <motion.div className="relative z-10 w-full sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto bg-surface rounded-t-2xl sm:rounded-2xl shadow-card" initial={{ scale: 0.95, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 260, damping: 22 }}>
          {/* Modal header */}
          <div className="sticky top-0 z-20 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-border" style={{ background: company ? company.bg + "EE" : "#EAF0FFEE" }}>
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <img src={company?.logo} alt={company?.name} className="h-4 sm:h-5 w-auto max-w-[60px] sm:max-w-[80px] object-contain shrink-0" referrerPolicy="no-referrer" />
              <div className="min-w-0">
                <p className="font-display font-bold text-ink text-xs sm:text-sm">{company?.name}</p>
                <p className="text-[11px] sm:text-xs text-ink-soft truncate">{video.title}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/70 border border-border flex items-center justify-center text-ink-soft hover:text-ink transition-colors shrink-0 ml-2"><X size={15} /></button>
          </div>
          {/* Tab bar */}
          <div className="flex border-b border-border px-3 sm:px-6 overflow-x-auto">
            {["video", "questions"].map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold capitalize transition-colors border-b-2 -mb-px whitespace-nowrap ${tab === t ? "border-primary text-primary" : "border-transparent text-ink-soft hover:text-ink"}`}>
                {t === "video" ? "▶ Watch" : "📋 Questions"}
              </button>
            ))}
          </div>
          {/* Modal body */}
          <div className="p-3 sm:p-6">
            {tab === "video" ? (
              <div className="space-y-3 sm:space-y-4">
                <div className="relative w-full rounded-lg sm:rounded-xl overflow-hidden bg-ink" style={{ paddingBottom: "56.25%" }}>
                  <iframe className="absolute inset-0 w-full h-full" src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0&modestbranding=1`} title={video.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center">
                  <span className={`text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full ${DIFF_COLOR[video.difficulty]?.bg} ${DIFF_COLOR[video.difficulty]?.text}`}>{video.difficulty}</span>
                  {video.tags.map((t) => (<span key={t} className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-paper border border-border text-ink-soft">{t}</span>))}
                </div>
                <div className="flex items-center gap-3 text-[10px] sm:text-xs text-ink-faint">
                  <span className="flex items-center gap-1"><Clock size={11} /> {video.duration}</span>
                  <span className="flex items-center gap-1"><Users size={11} /> {video.views} views</span>
                </div>
                <a href={`https://www.youtube.com/watch?v=${video.youtubeId}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"><ExternalLink size={12} /> Open on YouTube</a>
              </div>
            ) : (
              <motion.ul className="space-y-2 sm:space-y-3" variants={stagger} initial="hidden" animate="show">
                {video.questions.map((q, idx) => (
                  <motion.li key={idx} variants={cardAnim} className="flex items-start gap-2 sm:gap-3 bg-paper border border-border rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary-soft text-primary flex items-center justify-center shrink-0 font-display font-bold text-[10px] sm:text-xs mt-0.5">{idx + 1}</div>
                    <p className="text-xs sm:text-sm text-ink">{q}</p>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function VideoCard({ video, company, onOpen }) {
  const [hovered, setHovered] = useState(false);
  const [thumbFailed, setThumbFailed] = useState(false);
  const diff = DIFF_COLOR[video.difficulty] || DIFF_COLOR.Medium;

  // YouTube thumbnail fallback chain: maxresdefault → hqdefault → mqdefault → CSS placeholder
  const thumbSrcs = [
    `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`,
    `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`,
    `https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`,
  ];
  const [thumbIdx, setThumbIdx] = useState(0);

  function handleThumbError() {
    if (thumbIdx < thumbSrcs.length - 1) {
      setThumbIdx((i) => i + 1);
    } else {
      setThumbFailed(true);
    }
  }

  // YouTube returns a 120x90 gray placeholder with HTTP 200 when no real thumbnail exists.
  // Detect it by checking naturalWidth after load.
  function handleThumbLoad(e) {
    const img = e.target;
    if (img.naturalWidth <= 120 && img.naturalHeight <= 90) {
      handleThumbError();
    }
  }

  return (
    <motion.div variants={cardAnim} whileHover={{ y: -4 }} onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)} className="card overflow-hidden cursor-pointer group transition-shadow hover:shadow-card" onClick={() => onOpen(video)}>
      <div className="relative overflow-hidden bg-ink" style={{ paddingBottom: "56%" }}>
        {thumbFailed ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: `linear-gradient(135deg, ${company?.color || '#3457D5'}22, ${company?.color || '#3457D5'}44)` }}>
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/15 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center mb-2">
              <Play size={20} className="text-white/80 ml-0.5 sm:ml-1" />
            </div>
            <p className="text-white/60 text-[10px] sm:text-xs font-semibold">{company?.name} Interview</p>
          </div>
        ) : (
          <img
            src={thumbSrcs[thumbIdx]}
            alt={video.title}
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 ${hovered ? "scale-105" : "scale-100"}`}
            onError={handleThumbError}
            onLoad={handleThumbLoad}
            referrerPolicy="no-referrer"
          />
        )}
        <div className={`absolute inset-0 bg-ink/40 flex items-center justify-center transition-opacity duration-300 ${hovered ? "opacity-100" : "opacity-0"}`}>
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/60 flex items-center justify-center"><Play size={18} className="text-white ml-0.5" /></div>
        </div>
        <span className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 bg-ink/80 text-white text-[10px] sm:text-xs font-mono px-1.5 sm:px-2 py-0.5 rounded">{video.duration}</span>
        <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 flex items-center gap-1 sm:gap-1.5 bg-white/90 backdrop-blur-sm text-ink text-[10px] sm:text-xs font-semibold px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full shadow-soft"><img src={company?.logo} alt={company?.name} className="h-3 sm:h-3.5 w-auto max-w-[40px] sm:max-w-[56px] object-contain" referrerPolicy="no-referrer" /></span>
      </div>
      <div className="p-3 sm:p-4">
        <p className="font-semibold text-ink text-xs sm:text-sm leading-tight line-clamp-2 mb-2 sm:mb-3">{video.title}</p>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <span className={`text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full ${diff.bg} ${diff.text}`}>{video.difficulty}</span>
          {video.tags.slice(0, 2).map((t) => (<span key={t} className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-paper border border-border text-ink-faint">{t}</span>))}
        </div>
        <div className="mt-2 sm:mt-3 flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-ink-faint">
          <span className="flex items-center gap-1"><Users size={10} /> {video.views}</span>
          <span className="flex items-center gap-1"><BookOpen size={10} /> {video.questions.length} Qs</span>
        </div>
      </div>
    </motion.div>
  );
}

function CompanyCard({ company, selected, onClick }) {
  const count = VIDEOS.filter((v) => v.company === company.id).length;
  return (
    <motion.button whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClick} className={`card p-3 sm:p-4 text-left transition-all w-full ${selected ? "ring-2 shadow-card -translate-y-0.5" : "hover:shadow-card"}`} style={selected ? { "--tw-ring-color": company.color } : {}}>
      <div className="flex items-center sm:items-start gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 p-2" style={{ background: company.bg }}><img src={company.logo} alt={company.name} className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" /></div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink text-sm sm:text-base truncate">{company.name}</p>
          <p className="text-xs text-ink-faint mt-0.5">{count} video{count !== 1 ? "s" : ""}</p>
        </div>
      </div>
      <div className="mt-2 sm:mt-3 flex flex-wrap gap-1">
        <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-semibold ${DIFF_COLOR[company.difficulty]?.bg} ${DIFF_COLOR[company.difficulty]?.text}`}>{company.difficulty}</span>
        <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-paper border border-border text-ink-faint">{company.rounds} rounds</span>
      </div>
    </motion.button>
  );
}

export default function CompanyInterviews() {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState("All");
  const [tagFilter, setTagFilter] = useState("All");
  const [activeVideo, setActiveVideo] = useState(null);
  const videoSectionRef = useRef(null);

  const allTags = ["All", ...Array.from(new Set(VIDEOS.flatMap((v) => v.tags)))];
  const diffs = ["All", "Easy", "Medium", "Hard"];

  const filteredVideos = VIDEOS.filter((v) => {
    const matchCompany = !selectedCompany || v.company === selectedCompany;
    const matchSearch = !search || v.title.toLowerCase().includes(search.toLowerCase()) || v.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())) || v.questions.some((q) => q.toLowerCase().includes(search.toLowerCase()));
    const matchDiff = diffFilter === "All" || v.difficulty === diffFilter;
    const matchTag = tagFilter === "All" || v.tags.includes(tagFilter);
    return matchCompany && matchSearch && matchDiff && matchTag;
  });

  const selectedCompanyData = COMPANIES.find((c) => c.id === selectedCompany);

  function handleCompanyClick(id) {
    setSelectedCompany((prev) => (prev === id ? null : id));
    setTimeout(() => { videoSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 100);
  }

  return (
    <PageShell>
      <Breadcrumb trail={[{ label: "Home", to: "/" }, { label: "Dashboard", to: "/dashboard" }, { label: "Company Interview Videos" }]} />

      <motion.div className="mb-6 sm:mb-10" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="inline-flex items-center gap-2 bg-lavender-soft border border-lavender/20 rounded-full px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold text-lavender mb-3 sm:mb-4">
          <TrendingUp size={12} /> Real Company Interview Videos
        </div>
        <h1 className="font-display text-xl sm:text-3xl md:text-4xl font-bold text-ink leading-tight">
          How companies actually <span className="text-primary">interview</span>
        </h1>
        <p className="text-sm sm:text-base text-ink-soft mt-2 max-w-xl">Watch real mock interviews, learn the questions asked at top companies, and prepare smarter with curated video resources.</p>
        <div className="flex flex-wrap gap-3 sm:gap-6 mt-4 sm:mt-6">
          {[{ icon: Building2, val: COMPANIES.length, label: "Companies" }, { icon: Play, val: VIDEOS.length, label: "Videos" }, { icon: BookOpen, val: VIDEOS.reduce((s, v) => s + v.questions.length, 0), label: "Questions" }].map(({ icon: Icon, val, label }) => (
            <div key={label} className="flex items-center gap-2 bg-white/50 backdrop-blur-sm border border-border/50 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-border flex items-center justify-center text-primary shadow-soft shrink-0"><Icon size={14} className="sm:w-4 sm:h-4" /></div>
              <div><p className="font-display font-bold text-ink text-sm sm:text-base leading-none">{val}+</p><p className="text-[10px] sm:text-xs text-ink-soft mt-0.5">{label}</p></div>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="mb-6 sm:mb-10">
        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-ink-faint mb-3 sm:mb-4 flex items-center gap-1.5"><Building2 size={12} /> Select a company</p>
        <motion.div className="grid grid-cols-1 min-[480px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4" variants={stagger} initial="hidden" animate="show">
          {COMPANIES.map((c) => (<CompanyCard key={c.id} company={c} selected={selectedCompany === c.id} onClick={() => handleCompanyClick(c.id)} />))}
        </motion.div>
        <AnimatePresence>
          {selectedCompanyData && (
            <motion.div key={selectedCompanyData.id} initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: "auto", marginTop: 12 }} exit={{ opacity: 0, height: 0, marginTop: 0 }} className="overflow-hidden">
              <div className="rounded-xl border p-3 sm:p-4 flex flex-col sm:flex-row items-start gap-2 sm:gap-3" style={{ background: selectedCompanyData.bg, borderColor: selectedCompanyData.color + "30" }}>
                <div className="flex items-center gap-2 sm:block">
                  <img src={selectedCompanyData.logo} alt={selectedCompanyData.name} className="h-5 sm:h-6 w-auto max-w-[70px] sm:max-w-[90px] object-contain" referrerPolicy="no-referrer" />
                  <button onClick={() => setSelectedCompany(null)} className="sm:hidden ml-auto text-ink-faint hover:text-ink"><X size={14} /></button>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink text-sm sm:text-base">{selectedCompanyData.name} Interview</p>
                  <p className="text-xs sm:text-sm text-ink-soft mt-0.5">{selectedCompanyData.desc}</p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
                    {selectedCompanyData.roles.map((r) => (<span key={r} className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-white/70 border border-border text-ink-soft">{r}</span>))}
                  </div>
                </div>
                <button onClick={() => setSelectedCompany(null)} className="hidden sm:block ml-auto text-ink-faint hover:text-ink shrink-0"><X size={14} /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div ref={videoSectionRef} className="mb-4 sm:mb-6 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
        {/* Search bar */}
        <div className="relative w-full lg:max-w-sm shrink-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search videos, tags, questions..." className="w-full bg-white border border-border rounded-full pl-9 pr-4 py-2 sm:py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-soft" />
          {search && (<button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"><X size={13} /></button>)}
        </div>
        {/* Difficulty filter + Tag filter */}
        <div className="flex items-center gap-2 overflow-x-auto lg:flex-wrap pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 scrollbar-hide lg:overflow-visible">
          <div className="flex items-center gap-1 sm:gap-1.5 bg-white border border-border rounded-full px-2.5 sm:px-3 py-1.5 sm:py-2 shadow-soft shrink-0">
            <Filter size={12} className="text-ink-faint" />
            {diffs.map((d) => (<button key={d} onClick={() => setDiffFilter(d)} className={`text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full transition-colors whitespace-nowrap ${diffFilter === d ? "bg-primary text-white" : "text-ink-soft hover:text-ink"}`}>{d}</button>))}
          </div>
          {allTags.slice(0, 7).map((t) => (
            <button key={t} onClick={() => setTagFilter(t)} className={`shrink-0 lg:shrink flex items-center gap-1 text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border transition-all whitespace-nowrap ${tagFilter === t ? "bg-primary-soft border-primary/20 text-primary" : "bg-white border-border text-ink-soft hover:text-ink"}`}>
              {t !== "All" && <Tag size={9} />} {t}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-ink-faint mb-5">Showing <span className="font-semibold text-ink">{filteredVideos.length}</span> video{filteredVideos.length !== 1 ? "s" : ""}{selectedCompany && ` for ${selectedCompanyData?.name}`}</p>

      {filteredVideos.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-border flex items-center justify-center mx-auto mb-4"><Search size={22} className="text-ink-faint" /></div>
          <p className="font-semibold text-ink">No videos found</p>
          <p className="text-sm text-ink-soft mt-1">Try adjusting your filters or search query.</p>
          <button onClick={() => { setSearch(""); setDiffFilter("All"); setTagFilter("All"); setSelectedCompany(null); }} className="btn-secondary mt-6 text-sm">Clear all filters</button>
        </motion.div>
      ) : (
        <motion.div className="grid grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" variants={stagger} initial="hidden" animate="show" key={`${selectedCompany}-${search}-${diffFilter}-${tagFilter}`}>
          {filteredVideos.map((v) => (<VideoCard key={v.id} video={v} company={COMPANIES.find((c) => c.id === v.company)} onOpen={setActiveVideo} />))}
        </motion.div>
      )}

      {activeVideo && <VideoModal video={activeVideo} company={COMPANIES.find((c) => c.id === activeVideo.company)} onClose={() => setActiveVideo(null)} />}
    </PageShell>
  );
}
