import { motion } from 'framer-motion'
import { LucideIcon, Check } from 'lucide-react'

interface PipelineStep {
  id: string
  title: string
  description: string
  icon: LucideIcon
  artifact?: object
}

interface PipelineProps {
  steps: PipelineStep[]
  activeStep?: number
  onStepClick?: (index: number) => void
  orientation?: 'horizontal' | 'vertical'
}

export default function Pipeline({
  steps,
  activeStep = -1,
  onStepClick,
  orientation = 'horizontal',
}: PipelineProps) {
  const isHorizontal = orientation === 'horizontal'

  return (
    <div
      className={`
        ${isHorizontal ? 'flex flex-col lg:flex-row gap-4' : 'flex flex-col gap-4'}
      `}
      role="list"
      aria-label="Pipeline steps"
    >
      {steps.map((step, index) => {
        const Icon = step.icon
        const isActive = index === activeStep
        const isCompleted = index < activeStep

        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className={`
              relative flex-1
              ${isHorizontal ? 'min-w-0' : ''}
            `}
            role="listitem"
          >
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={`
                  absolute bg-neutral-200
                  ${isHorizontal
                    ? 'hidden lg:block top-6 left-1/2 w-full h-0.5 translate-x-1/2'
                    : 'left-6 top-12 w-0.5 h-full -translate-x-1/2'
                  }
                `}
                aria-hidden="true"
              >
                {isCompleted && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    className="h-full bg-primary-500 origin-left"
                  />
                )}
              </div>
            )}

            <button
              onClick={() => onStepClick?.(index)}
              className={`
                relative w-full text-left p-4 rounded-xl border-2 transition-all
                ${isActive
                  ? 'border-primary-500 bg-primary-50'
                  : isCompleted
                    ? 'border-primary-200 bg-primary-50/50'
                    : 'border-neutral-200 bg-white hover:border-neutral-300'
                }
                ${onStepClick ? 'cursor-pointer' : 'cursor-default'}
              `}
              aria-current={isActive ? 'step' : undefined}
            >
              {/* Step number / icon */}
              <div className="flex items-start gap-4">
                <div
                  className={`
                    flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
                    ${isActive
                      ? 'bg-primary-500 text-white'
                      : isCompleted
                        ? 'bg-primary-500 text-white'
                        : 'bg-neutral-100 text-neutral-600'
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Step {index + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-neutral-600 line-clamp-2">
                    {step.description}
                  </p>
                </div>
              </div>
            </button>
          </motion.div>
        )
      })}
    </div>
  )
}
