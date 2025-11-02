import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface StepIndicatorProps {
  currentStep: number
}

const steps = [
  { number: 1, title: 'Create File' },
  { number: 2, title: 'Add Columns' },
  { number: 3, title: 'Enter Data' }
]

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  // Clamp currentStep to valid range
  const validStep = Math.max(1, Math.min(currentStep, 3));
  
  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center justify-between max-w-xs sm:max-w-md mx-auto px-4">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <motion.div
              className={`
                w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold
                ${validStep > step.number 
                  ? 'bg-excel-green text-white' 
                  : validStep === step.number 
                    ? 'bg-excel-green text-white' 
                    : 'bg-gray-700 text-gray-400'
                }
              `}
              initial={false}
              animate={{
                scale: validStep === step.number ? 1.1 : 1,
                backgroundColor: validStep > step.number ? '#107C41' : validStep === step.number ? '#107C41' : '#374151'
              }}
              transition={{ duration: 0.2 }}
            >
              {validStep > step.number ? (
                <Check className="w-5 h-5" />
              ) : (
                step.number
              )}
            </motion.div>
            
            <div className="ml-1 sm:ml-2 text-xs sm:text-sm">
              <div className={`font-medium ${validStep >= step.number ? 'text-white' : 'text-gray-400'}`}>
                <span className="hidden sm:inline">{step.title}</span>
                <span className="sm:hidden">{step.title.split(' ')[0]}</span>
              </div>
            </div>
            
            {index < steps.length - 1 && (
              <div className={`w-4 sm:w-8 h-0.5 mx-2 sm:mx-4 ${validStep > step.number ? 'bg-excel-green' : 'bg-gray-700'}`} />
            )}
          </div>
        ))}
      </div>
      
      {/* Debug info for invalid steps */}
      {currentStep > 3 && (
        <div className="text-center mt-2">
          <span className="text-red-400 text-sm">Invalid step: {currentStep} (showing step 3)</span>
        </div>
      )}
    </div>
  )
}