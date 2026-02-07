import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { GripVertical } from 'lucide-react'

interface BeforeAfterSliderProps {
  beforeContent: React.ReactNode
  afterContent: React.ReactNode
  beforeLabel?: string
  afterLabel?: string
  className?: string
}

export default function BeforeAfterSlider({
  beforeContent,
  afterContent,
  beforeLabel = 'Before',
  afterLabel = 'After',
  className = '',
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPosition(percentage)
  }, [])

  const handleMouseDown = () => setIsDragging(true)
  const handleMouseUp = () => setIsDragging(false)

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX)
      }
    },
    [isDragging, handleMove]
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (isDragging && e.touches[0]) {
        handleMove(e.touches[0].clientX)
      }
    },
    [isDragging, handleMove]
  )

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleMouseUp)
    }
  }, [handleMouseMove, handleTouchMove])

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-xl select-none ${className}`}
      role="slider"
      aria-label="Before and after comparison slider"
      aria-valuenow={Math.round(sliderPosition)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* Before (left side) */}
      <div className="absolute inset-0">
        {beforeContent}
        <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
          {beforeLabel}
        </div>
      </div>

      {/* After (right side, clipped) */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
      >
        {afterContent}
        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
          {afterLabel}
        </div>
      </div>

      {/* Slider handle */}
      <motion.div
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        whileHover={{ scale: 1.1 }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
          <GripVertical className="w-5 h-5 text-neutral-600" />
        </div>
        {/* Vertical line shadow */}
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-white shadow-lg" />
      </motion.div>
    </div>
  )
}
