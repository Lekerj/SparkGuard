import { motion } from 'framer-motion'
import { Github, Linkedin, User } from 'lucide-react'
import Container from '@/components/layout/Container'
import Card from '@/components/ui/Card'
import SectionTitle from '@/components/ui/SectionTitle'
import { teamMembers } from '@/data/teamMembers'

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
}

export default function Team() {
  return (
    <motion.div initial="initial" animate="animate">
      <section className="bg-neutral-950 text-white py-16 lg:py-20">
        <Container>
          <motion.div variants={fadeInUp} className="max-w-3xl">
            <p className="text-sm text-neutral-400 mb-3">Team</p>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Meet the SafeGuard Team</h1>
            <p className="text-lg text-neutral-300">
              The people building wildfire intelligence tooling for mission-critical response.
            </p>
          </motion.div>
        </Container>
      </section>

      <section className="py-16 lg:py-24 bg-neutral-50">
        <Container>
          <SectionTitle
            title="Profiles"
            subtitle="Connect with the people behind SafeGuard"
            align="left"
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member) => (
              <motion.div key={member.id} variants={fadeInUp}>
                <Card hover className="h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-neutral-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900">{member.name}</h3>
                      {member.role && (
                        <p className="text-sm text-neutral-500">{member.role}</p>
                      )}
                    </div>
                  </div>

                  {member.bio && (
                    <p className="text-sm text-neutral-600 mb-4">{member.bio}</p>
                  )}

                  <div className="flex gap-3">
                    <a
                      href={member.linkedinUrl}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border border-neutral-200 rounded-lg text-neutral-700 hover:bg-neutral-100"
                      aria-label={`${member.name} on LinkedIn`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </a>
                    <a
                      href={member.githubUrl}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border border-neutral-200 rounded-lg text-neutral-700 hover:bg-neutral-100"
                      aria-label={`${member.name} on GitHub`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Github className="w-4 h-4" />
                      GitHub
                    </a>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>
    </motion.div>
  )
}
