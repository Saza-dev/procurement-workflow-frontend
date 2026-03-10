"use client";

import { motion } from "framer-motion";
import { useState } from "react";

function LetterDesign(l: { letter: string }) {
  const [pos, setPos] = useState({ x: 0, y: 0, rotate: 0 });

  const handleMove = (e:any) => {
    const rect = e.currentTarget.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;

    const strength = 0.15; 

    setPos({
      x: -dx * strength,
      y: -dy * strength,
      rotate: dx * 0.1, 
    });
  };

  const handleLeave = () => {
    setPos({ x: 0, y: 0, rotate: 0 });
  };
  return (
    <div>
      <motion.div
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        animate={pos}
        transition={{
          type: "spring",
          stiffness: 120,
          damping: 20,
          mass: 0.5,
        }}
        className="md:text-[100px] lg:text-[150px] xl:text-[250px] inline-block text-white text-shadow-lg "
      >
        {l.letter}
      </motion.div>
    </div>
  );
}

export default LetterDesign;
