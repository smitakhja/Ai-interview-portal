import { motion } from "framer-motion";

export default function PageShell({ children, className = "" }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`max-w-7xl mx-auto px-6 py-10 relative ${className}`}
    >
      {children}
    </motion.main>
  );
}
