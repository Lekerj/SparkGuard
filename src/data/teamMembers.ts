export interface TeamMember {
  id: string
  name: string
  role: string
  bio: string
  placeholder: boolean
}

export const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: '[TEAM_MEMBER_1]',
    role: 'Software Developer',
    bio: 'Experienced in building scalable systems and real-time data processing pipelines. Passionate about applying technology to public safety challenges.',
    placeholder: true,
  },
  {
    id: '2',
    name: '[TEAM_MEMBER_2]',
    role: 'Data Scientist',
    bio: 'Specializes in geospatial analytics and machine learning for environmental monitoring. Background in satellite imagery analysis.',
    placeholder: true,
  },
  {
    id: '3',
    name: '[TEAM_MEMBER_3]',
    role: 'Product Designer',
    bio: 'Focused on creating intuitive interfaces for high-stakes decision-making environments. Experience in emergency services UX.',
    placeholder: true,
  },
]
