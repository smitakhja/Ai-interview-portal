import { FileText, Bot, ListChecks, BrainCircuit, Users, LineChart, UserCircle, Video } from "lucide-react";

export const modules = [
  {
    key: "resumeAnalyzer",
    label: "Resume Analyzer",
    to: "/resume-analyzer",
    icon: FileText,
    color: "primary",
    desc: "Get instant, AI-driven feedback on your resume's strengths and gaps.",
  },
  {
    key: "videoInterview",
    label: "Premium Video Interview",
    to: "/video-interview",
    icon: Video,
    color: "amber",
    desc: "A highly realistic AI-powered video interview with live feedback and scoring.",
  },
  {
    key: "mockInterview",
    label: "AI Mock Interview",
    to: "/mock-interview",
    icon: Bot,
    color: "lavender",
    desc: "Practice role-specific questions and get scored on your answers.",
  },
  {
    key: "technicalQuiz",
    label: "Technical Quiz",
    to: "/technical-quiz",
    icon: ListChecks,
    color: "mint",
    desc: "Sharpen your coding and CS fundamentals with timed quizzes.",
  },
  {
    key: "aptitudeTest",
    label: "Aptitude Test",
    to: "/aptitude-test",
    icon: BrainCircuit,
    color: "amber",
    desc: "Test quantitative, logical, and verbal reasoning skills.",
  },
  {
    key: "hrInterview",
    label: "HR Interview",
    to: "/hr-interview",
    icon: Users,
    color: "coral",
    desc: "Rehearse behavioral questions with instant answer feedback.",
  },
  {
    key: "progressTracker",
    label: "Progress Tracker",
    to: "/progress",
    icon: LineChart,
    color: "primary",
    desc: "Track your readiness score and improvement across every module.",
  },
  {
    key: "companyInterviews",
    label: "Company Interviews",
    to: "/company-interviews",
    icon: Video,
    color: "lavender",
    desc: "Watch real interview videos and see exactly what questions companies ask.",
  },
  {
    key: "profile",
    label: "Profile",
    to: "/profile",
    icon: UserCircle,
    color: "lavender",
    desc: "Manage your target role, skills, and personal details.",
  },
];

export const COMPANY_LOGOS = [
  { name: "Google", url: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
  { name: "Amazon", url: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
  { name: "Microsoft", url: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg" },
  { name: "Meta", url: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg" },
  { name: "Apple", url: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" },
  { name: "Netflix", url: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" },
  { name: "TCS", url: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg" },
  { name: "Infosys", url: "https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg" },
  { name: "Wipro", url: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Wipro_Primary_Logo_Color_RGB.svg" },
  { name: "Goldman Sachs", url: "https://upload.wikimedia.org/wikipedia/commons/6/61/Goldman_Sachs.svg" },
];

export const colorMap = {
  primary: { bg: "bg-primary-soft", text: "text-primary", ring: "ring-primary/20", solid: "bg-primary" },
  mint: { bg: "bg-mint-soft", text: "text-mint", ring: "ring-mint/20", solid: "bg-mint" },
  coral: { bg: "bg-coral-soft", text: "text-coral", ring: "ring-coral/20", solid: "bg-coral" },
  amber: { bg: "bg-amber-soft", text: "text-amber", ring: "ring-amber/20", solid: "bg-amber" },
  lavender: { bg: "bg-lavender-soft", text: "text-lavender", ring: "ring-lavender/20", solid: "bg-lavender" },
};
