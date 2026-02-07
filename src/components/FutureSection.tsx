import Card from '@/components/ui/Card'
import SectionTitle from '@/components/ui/SectionTitle'

export default function FutureSection() {
  return (
    <section className="py-16 lg:py-24 bg-neutral-950 text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          title="Future Section"
          subtitle="Placeholder for upcoming content"
          align="left"
          titleClassName="text-white"
          subtitleClassName="text-neutral-400"
        />
        <Card className="bg-neutral-900 border-neutral-800 text-neutral-200">
          <p className="text-sm text-neutral-300">
            TODO: Add the next content block here. This section is intentionally modular
            to support quick expansion without refactoring the home layout.
          </p>
        </Card>
      </div>
    </section>
  )
}
