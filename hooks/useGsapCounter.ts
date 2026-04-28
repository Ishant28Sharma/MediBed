"use client";

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export function useGsapCounter(targetValue: number, duration: number = 1.5) {
  const [value, setValue] = useState(0);
  const targetRef = useRef({ val: 0 });

  useEffect(() => {
    gsap.to(targetRef.current, {
      val: targetValue,
      duration,
      ease: "power2.out",
      onUpdate: () => {
        setValue(Math.round(targetRef.current.val));
      }
    });

    return () => {
      gsap.killTweensOf(targetRef.current);
    };
  }, [targetValue, duration]);

  return value;
}
