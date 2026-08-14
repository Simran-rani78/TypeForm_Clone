"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check } from "lucide-react"

export function PublishSuccessAnimation({ onComplete }: { onComplete: () => void }) {
  const [showText, setShowText] = useState(false)

  useEffect(() => {
    const textTimer = setTimeout(() => {
      setShowText(true)
    }, 800)

    const completeTimer = setTimeout(() => {
      onComplete()
    }, 2500)

    return () => {
      clearTimeout(textTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  return (
    <motion.div 
      className="fixed inset-0 z-[100] bg-[#fafafa] flex flex-col items-center justify-center font-sans"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col items-center justify-center -mt-16">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 25,
            duration: 0.6 
          }}
          className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center text-white mb-8"
        >
          <Check className="w-10 h-10" strokeWidth={3} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: showText ? 1 : 0, y: showText ? 0 : 10 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <h1 className="text-[28px] font-normal text-zinc-900 mb-3 tracking-tight">Your form is live</h1>
          <p className="text-zinc-500 text-[15px]">Your form has been published</p>
        </motion.div>
      </div>
    </motion.div>
  )
}
