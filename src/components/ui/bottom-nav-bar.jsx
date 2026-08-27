"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Home,
  LineChart,
  CreditCard,
  MessageCircle,
  Trophy,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_NAV_ITEMS = [
  { label: "Home", icon: Home },
  { label: "Portfolio", icon: LineChart },
  { label: "Transactions", icon: CreditCard },
  { label: "Messages", icon: MessageCircle },
  { label: "Rewards", icon: Trophy },
  { label: "Profile", icon: User },
];

const MOBILE_LABEL_WIDTH = 80;

export function BottomNavBar({
  className,
  items = DEFAULT_NAV_ITEMS,
  defaultIndex = 0,
  activeIndex: controlledIndex,
  onItemSelect,
  stickyBottom = false,
  ariaLabel = "Bottom Navigation",
}) {
  const [uncontrolledIndex, setUncontrolledIndex] = useState(defaultIndex);
  const activeIndex = controlledIndex ?? uncontrolledIndex;

  const handleSelect = (idx, item) => {
    if (controlledIndex === undefined) setUncontrolledIndex(idx);
    onItemSelect?.(idx, item);
  };

  return (
    <motion.nav
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      role="navigation"
      aria-label={ariaLabel}
      className={cn(
        "flex h-[56px] min-w-[320px] max-w-[95vw] items-center space-x-1 rounded-full border border-white/12 bg-[rgb(var(--surface)/0.55)] p-2 shadow-nav-float [backdrop-filter:blur(24px)_saturate(170%)] [-webkit-backdrop-filter:blur(24px)_saturate(170%)]",
        stickyBottom && "fixed inset-x-0 bottom-4 z-20 mx-auto w-fit",
        className,
      )}
    >
      {items.map((item, idx) => {
        const Icon = item.icon;
        const isActive = activeIndex === idx;
        const isPrimary = Boolean(item.primary);

        return (
          <motion.button
            key={item.label}
            whileTap={{ scale: 0.97 }}
            className={cn(
              "relative flex h-10 min-h-[40px] max-h-[44px] min-w-[44px] items-center gap-0 rounded-full px-3 py-2 transition-colors duration-200",
              isPrimary && isActive && "gap-2 bg-primary-600 text-white",
              isPrimary && !isActive && "bg-primary-600 text-white hover:bg-primary-700",
              !isPrimary && isActive && "gap-2 bg-primary-600/10 text-primary-600",
              !isPrimary &&
                !isActive &&
                "bg-transparent text-muted hover:bg-surface-2",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-glow/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
            )}
            onClick={() => handleSelect(idx, item)}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
            type="button"
          >
            <Icon
              size={22}
              strokeWidth={isActive || isPrimary ? 2.2 : 2}
              aria-hidden
              className="transition-colors duration-200"
            />
            <motion.div
              initial={false}
              animate={{
                width: isActive ? `${MOBILE_LABEL_WIDTH}px` : "0px",
                opacity: isActive ? 1 : 0,
                marginLeft: isActive ? "8px" : "0px",
              }}
              transition={{
                width: { type: "spring", stiffness: 350, damping: 32 },
                opacity: { duration: 0.19 },
                marginLeft: { duration: 0.19 },
              }}
              className="flex max-w-[80px] items-center overflow-hidden"
            >
              <span
                className={cn(
                  "select-none overflow-hidden text-ellipsis whitespace-nowrap text-[clamp(0.625rem,0.5263rem+0.5263vw,1rem)] text-xs font-medium leading-[1.9] transition-opacity duration-200",
                  isActive ? (isPrimary ? "text-white" : "text-primary-600") : "opacity-0",
                )}
                title={item.label}
              >
                {item.label}
              </span>
            </motion.div>
          </motion.button>
        );
      })}
    </motion.nav>
  );
}

export default BottomNavBar;
