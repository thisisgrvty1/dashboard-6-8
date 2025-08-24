import React from 'react';
import { motion, Variants } from 'framer-motion';
import { BotMessageSquare } from 'lucide-react';

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.4,
    },
  },
};

const logoVariants: Variants = {
  hidden: { opacity: 0, scale: 0.5, rotate: -90 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      duration: 1.0,
      ease: [0.22, 1, 0.36, 1], // easeOutCirc
    },
  },
};

const textVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.0, ease: [0.22, 1, 0.36, 1] },
  },
};


const SplashScreen: React.FC<SplashScreenProps> = ({ onAnimationComplete }) => {
  return (
    <motion.div
      className="w-full h-screen flex flex-col items-center justify-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onAnimationComplete={onAnimationComplete}
    >
      <motion.div variants={logoVariants}>
        <div className="w-24 h-24 rounded-2xl bg-mesh-gradient bg-[200%_auto] animate-gradient-pan flex items-center justify-center">
          <BotMessageSquare size={64} className="text-white" />
        </div>
      </motion.div>
      <motion.h1
        variants={textVariants}
        className="mt-6 font-display text-4xl font-bold text-transparent bg-clip-text bg-mesh-gradient bg-[200%_auto] animate-gradient-pan tracking-wide"
      >
        AI Dashboard
      </motion.h1>
    </motion.div>
  );
};

export default SplashScreen;
