"use client";

import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const flow = [
  '/', 
  '/flow', 
  '/hospitals', 
  '/ward-selection', 
  '/reports', 
  '/appointments', 
  '/ai-assistant', 
  '/settings', 
  '/emergency'
];

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [navDirection, setNavDirection] = useState(1);
  const [prevPath, setPrevPath] = useState(pathname);

  useEffect(() => {
    if (prevPath !== pathname) {
      const currentIndex = flow.indexOf(prevPath);
      const newIndex = flow.indexOf(pathname);
      
      if (currentIndex !== -1 && newIndex !== -1) {
        setNavDirection(newIndex > currentIndex ? 1 : -1);
      } else {
        setNavDirection(1);
      }
      setPrevPath(pathname);
    }
  }, [pathname, prevPath]);

  return (
    <motion.div
      key={pathname}
      custom={navDirection}
      initial={{ opacity: 0, y: navDirection > 0 ? 80 : -80 }}
      animate={{ opacity: 1, y: 0, transitionEnd: { transform: "none" } }}
      exit={{ opacity: 0, y: navDirection > 0 ? -80 : 80 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as any }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}
