import { Github, Linkedin, User } from 'lucide-react'
import { teamMembers } from '@/data/teamMembers'

export default function Team() {
  return (
    <div className="h-full overflow-y-auto bg-neutral-950 text-white">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <p className="text-sm text-neutral-500 mb-2">Team</p>
        <h1 className="text-3xl font-bold mb-3">Meet the SparkGuard Team</h1>
        <p className="text-neutral-400">
          The people building wildfire intelligence tooling for mission-critical response.
        </p>
      </div>

      {/* Cards */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center">
                  <User className="w-5 h-5 text-neutral-500" />
                </div>
                <div>
                  <h3 className="font-semibold">{member.name}</h3>
                  {member.role && <p className="text-xs text-neutral-500">{member.role}</p>}
                </div>
              </div>
              {member.bio && <p className="text-sm text-neutral-400 mb-4">{member.bio}</p>}
              <div className="flex gap-2">
                <a
                  href={member.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-neutral-700 rounded-lg text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors"
                >
                  <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                </a>
                <a
                  href={member.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-neutral-700 rounded-lg text-neutral-400 hover:text-white hover:border-neutral-600 transition-colors"
                >
                  <Github className="w-3.5 h-3.5" /> GitHub
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
