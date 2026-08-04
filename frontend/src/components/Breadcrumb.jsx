import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function Breadcrumb({ trail = [] }) {
  // trail: [{ label, to }] — last item is the current page (no link)
  return (
    <div className="flex items-center gap-1.5 text-sm text-ink-soft mb-6 flex-wrap">
      {trail.map((item, i) => {
        const isLast = i === trail.length - 1;
        return (
          <span key={item.label} className="flex items-center gap-1.5">
            {isLast ? (
              <span className="text-ink font-semibold">{item.label}</span>
            ) : (
              <Link to={item.to} className="hover:text-primary transition-colors">
                {item.label}
              </Link>
            )}
            {!isLast && <ChevronRight size={14} className="text-ink-faint" />}
          </span>
        );
      })}
    </div>
  );
}
