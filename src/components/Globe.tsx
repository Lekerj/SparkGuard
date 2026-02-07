import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface GlobeProps {
  size?: number
}

export default function Globe({ size = 420 }: GlobeProps) {
  const [rotation, setRotation] = useState({ x: -18, y: 24 })
  const [isDragging, setIsDragging] = useState(false)
  const lastPosition = useRef<{ x: number; y: number } | null>(null)

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true)
    lastPosition.current = { x: e.clientX, y: e.clientY }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !lastPosition.current) return
    const dx = e.clientX - lastPosition.current.x
    const dy = e.clientY - lastPosition.current.y
    setRotation((prev) => ({
      x: Math.max(-45, Math.min(45, prev.x - dy * 0.3)),
      y: prev.y + dx * 0.4,
    }))
    lastPosition.current = { x: e.clientX, y: e.clientY }
  }

  const handlePointerUp = () => {
    setIsDragging(false)
    lastPosition.current = null
  }

  return (
    <div className="flex items-center justify-center">
      <motion.div
        className="relative"
        style={{ width: size, height: size }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        role="img"
        aria-label="Interactive Earth globe"
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transformStyle: 'preserve-3d',
            background:
              'radial-gradient(circle at 30% 30%, #4aa3ff 0%, #1a3b7a 40%, #0b1a3a 70%, #050915 100%)',
            boxShadow:
              '0 30px 80px rgba(14, 165, 233, 0.25), inset -20px -40px 60px rgba(0,0,0,0.45)',
          }}
        >
          <div
            className="absolute inset-[8%] rounded-full"
            style={{
              background:
                'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.22), rgba(255,255,255,0) 60%),\
                 repeating-linear-gradient(0deg, rgba(80,220,255,0.12), rgba(80,220,255,0.12) 1px, transparent 1px, transparent 12px),\
                 repeating-linear-gradient(90deg, rgba(80,220,255,0.12), rgba(80,220,255,0.12) 1px, transparent 1px, transparent 12px)',
              filter: 'blur(0.2px)',
              opacity: 0.8,
            }}
          />
          <div
            className="absolute inset-[14%] rounded-full"
            style={{
              background:
                'conic-gradient(from 120deg, rgba(34,197,94,0.55), rgba(34,197,94,0.15), rgba(34,197,94,0.45), rgba(34,197,94,0.08), rgba(34,197,94,0.35))',
              mixBlendMode: 'screen',
              opacity: 0.5,
            }}
          />
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'radial-gradient(circle at 70% 40%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 45%)',
            }}
          />
        </div>

        <div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: '0 0 35px rgba(56, 189, 248, 0.35)',
            border: '1px solid rgba(125, 211, 252, 0.35)',
          }}
        />

        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-xs text-neutral-400">
          Drag to rotate
        </div>
      </motion.div>
    </div>
  )
}
