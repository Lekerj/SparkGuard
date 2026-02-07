import { motion } from 'framer-motion'
import { User, Linkedin, Github, Mail } from 'lucide-react'
import Container from '@/components/layout/Container'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import SectionTitle from '@/components/ui/SectionTitle'
import { teamMembers } from '@/data/teamMembers'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

export default function Team() {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
    >
      {/* Hero */}
      <section className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white py-20 lg:py-28">
        <Container>
          <motion.div variants={fadeInUp} className="max-w-3xl mx-auto text-center">
            <Badge variant="demo" className="mb-4">Our Team</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Meet the SparkGuard Team
            </h1>
            <p className="text-xl text-neutral-300">
              Passionate professionals working to improve fire prevention and 
              emergency response through technology.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* Team Members */}
      <section className="py-20 lg:py-28 bg-neutral-50">
        <Container>
          <SectionTitle
            title="Team Members"
            subtitle="The people building SparkGuard"
            badge={<Badge variant="info">Placeholder names - edit in code</Badge>}
          />

          <motion.div
            variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {teamMembers.map((member) => (
              <motion.div key={member.id} variants={fadeInUp}>
                <Card hover className="h-full text-center">
                  {/* Avatar Placeholder */}
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center mx-auto mb-4">
                    <User className="w-12 h-12 text-neutral-400" />
                  </div>

                  {/* Name */}
                  <h3 className="text-xl font-semibold text-neutral-900 mb-1">
                    {member.name}
                  </h3>

                  {/* Role */}
                  <p className="text-primary-600 font-medium mb-4">
                    {member.role}
                  </p>

                  {/* Bio */}
                  <p className="text-neutral-600 text-sm mb-6">
                    {member.bio}
                  </p>

                  {/* Placeholder Badge */}
                  {member.placeholder && (
                    <Badge variant="default" size="sm" className="mb-4">
                      Placeholder - Edit in teamMembers.ts
                    </Badge>
                  )}

                  {/* Social Links (Placeholder) */}
                  <div className="flex justify-center gap-4">
                    <a
                      href="#"
                      className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                      aria-label={`${member.name}'s LinkedIn (Placeholder)`}
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                    <a
                      href="#"
                      className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                      aria-label={`${member.name}'s GitHub (Placeholder)`}
                    >
                      <Github className="w-5 h-5" />
                    </a>
                    <a
                      href="#"
                      className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                      aria-label={`Email ${member.name} (Placeholder)`}
                    >
                      <Mail className="w-5 h-5" />
                    </a>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* Join the Team */}
      <section className="py-20 lg:py-28 bg-white">
        <Container>
          <motion.div variants={fadeInUp} className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Interested in Joining?
            </h2>
            <p className="text-lg text-neutral-600 mb-8">
              We're always looking for passionate people who want to make a 
              difference in emergency response technology.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Mail className="w-5 h-5" />
              Get in Touch
            </a>
          </motion.div>
        </Container>
      </section>

      {/* Note Section */}
      <section className="py-12 bg-neutral-100">
        <Container>
          <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl border border-neutral-200">
            <h3 className="font-semibold text-neutral-900 mb-2">
              📝 Developer Note
            </h3>
            <p className="text-sm text-neutral-600">
              Team member information is stored in <code className="bg-neutral-100 px-1 rounded">src/data/teamMembers.ts</code>. 
              Update this file with real team member names, roles, and bios. 
              Replace the placeholder avatar with actual team photos.
            </p>
          </div>
        </Container>
      </section>
    </motion.div>
  )
}
