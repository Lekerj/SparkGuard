/**
 * Placeholder section for future content.
 * Drop it anywhere in the page layout — fully modular.
 */

import { Layers } from 'lucide-react'
import Card from '@/components/ui/Card'
import SectionTitle from '@/components/ui/SectionTitle'

export default function FutureSection() {
  return (
    <section className="py-16 lg:py-24 bg-neutral-950 text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          title="Coming Soon"
          subtitle="A new module is being developed for this section"
          align="left"
          titleClassName="text-white"
          subtitleClassName="text-neutral-400"
        />
        <Card className="bg-neutral-900 border-neutral-800 text-neutral-200">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5 text-secondary-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Future Section Placeholder</h3>
              <p className="text-sm text-neutral-400">
                This section is intentionally modular. Add your next content block here
                without needing to refactor the home layout. Simply replace this component
                or add children alongside it.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}
