import { useMemo, useState } from 'react'
import { Search, Filter, ArrowUpDown, MapPin, Calendar, Flame } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { WildfireRecord, WildfireSeverity } from '@/data/wildfires'

const severityOrder: Record<WildfireSeverity, number> = {
  Low: 1,
  Moderate: 2,
  High: 3,
  Extreme: 4,
}

const severityStyles: Record<WildfireSeverity, string> = {
  Low: 'success',
  Moderate: 'warning',
  High: 'danger',
  Extreme: 'danger',
}

interface WildfirePanelProps {
  records: WildfireRecord[]
  onSelect: (record: WildfireRecord) => void
  selectedId?: string
}

export default function WildfirePanel({ records, onSelect, selectedId }: WildfirePanelProps) {
  const [query, setQuery] = useState('')
  const [severity, setSeverity] = useState<'All' | WildfireSeverity>('All')
  const [sortBy, setSortBy] = useState<'updated' | 'severity' | 'area'>('updated')

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase().trim()
    const filteredRecords = records.filter((record) => {
      const matchesQuery =
        !normalized ||
        record.name.toLowerCase().includes(normalized) ||
        record.region.toLowerCase().includes(normalized)
      const matchesSeverity = severity === 'All' || record.severity === severity
      return matchesQuery && matchesSeverity
    })

    return filteredRecords.sort((a, b) => {
      if (sortBy === 'severity') {
        return severityOrder[b.severity] - severityOrder[a.severity]
      }
      if (sortBy === 'area') {
        return (b.areaBurnedHa || 0) - (a.areaBurnedHa || 0)
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
  }, [query, severity, sortBy, records])

  const selected = records.find((record) => record.id === selectedId) || filtered[0]

  return (
    <Card className="bg-neutral-900/70 border-neutral-700 text-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Recent Wildfires</h3>
        <Badge variant="demo" size="sm">Mock data</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute top-1/2 left-3 -translate-y-1/2" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search region or incident"
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="relative">
          <Filter className="w-4 h-4 text-neutral-400 absolute top-1/2 left-3 -translate-y-1/2" />
          <select
            value={severity}
            onChange={(event) => setSeverity(event.target.value as WildfireSeverity | 'All')}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="All">All Severities</option>
            <option value="Low">Low</option>
            <option value="Moderate">Moderate</option>
            <option value="High">High</option>
            <option value="Extreme">Extreme</option>
          </select>
        </div>
        <div className="relative">
          <ArrowUpDown className="w-4 h-4 text-neutral-400 absolute top-1/2 left-3 -translate-y-1/2" />
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="updated">Most Recent</option>
            <option value="severity">Highest Severity</option>
            <option value="area">Largest Area</option>
          </select>
        </div>
      </div>

      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {filtered.map((record) => (
          <button
            key={record.id}
            onClick={() => onSelect(record)}
            className={`w-full text-left p-3 rounded-lg border transition-colors ${
              record.id === selected?.id
                ? 'bg-primary-500/15 border-primary-400'
                : 'bg-neutral-800/70 border-neutral-700 hover:border-neutral-500'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-medium text-white">{record.name}</p>
                <p className="text-xs text-neutral-400">{record.region}</p>
              </div>
              <Badge variant={severityStyles[record.severity] as never} size="sm">
                {record.severity}
              </Badge>
            </div>
            <div className="mt-2 text-xs text-neutral-400 flex flex-wrap gap-3">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(record.updatedAt).toLocaleString()}
              </span>
              {record.areaBurnedHa && (
                <span className="flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  {record.areaBurnedHa.toLocaleString()} ha
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="mt-5 border-t border-neutral-700 pt-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-neutral-400">Selected Incident</p>
              <h4 className="text-lg font-semibold text-white">{selected.name}</h4>
            </div>
            <Badge variant={severityStyles[selected.severity] as never}>
              {selected.severity}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-neutral-800/70 rounded-lg p-3">
              <p className="text-neutral-400">Region</p>
              <p className="font-medium">{selected.region}</p>
            </div>
            <div className="bg-neutral-800/70 rounded-lg p-3">
              <p className="text-neutral-400">Confidence</p>
              <p className="font-medium">{selected.confidence}%</p>
            </div>
            <div className="bg-neutral-800/70 rounded-lg p-3">
              <p className="text-neutral-400">Coordinates</p>
              <p className="font-medium">
                {selected.coordinates.lat.toFixed(3)}, {selected.coordinates.lon.toFixed(3)}
              </p>
            </div>
            <div className="bg-neutral-800/70 rounded-lg p-3">
              <p className="text-neutral-400">Last Update</p>
              <p className="font-medium">{new Date(selected.updatedAt).toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-4 bg-neutral-800/70 rounded-lg p-3 text-sm">
            <p className="text-neutral-400">Source</p>
            <p className="font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-secondary-400" />
              {selected.source}
            </p>
          </div>

          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" className="border-neutral-600 text-white hover:bg-neutral-800">
              View Timeline
            </Button>
            <Button variant="primary" size="sm">
              Focus on Globe
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
