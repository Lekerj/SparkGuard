export interface TeamMember {
  id: string
  name: string
  role?: string
  bio?: string
  linkedinUrl: string
  githubUrl: string
}

export const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: '[TEAM_MEMBER_1]',
    role: 'Full-Stack Engineer',
    bio: 'Builds interactive mission-control interfaces and data pipelines for wildfire response.',
    linkedinUrl: 'https://www.linkedin.com/in/your-profile',
    githubUrl: 'https://github.com/your-profile',
  },
  {
    id: '2',
    name: '[TEAM_MEMBER_2]',
    role: 'Geospatial Analyst',
    bio: 'Focuses on wildfire detection signals, confidence scoring, and geospatial data quality.',
    linkedinUrl: 'https://www.linkedin.com/in/your-profile',
    githubUrl: 'https://github.com/your-profile',
  },
  {
    id: '3',
    name: '[TEAM_MEMBER_3]',
    role: 'Product & UX',
    bio: 'Designs clean, high-trust interfaces for emergency response teams.',
    linkedinUrl: 'https://www.linkedin.com/in/your-profile',
    githubUrl: 'https://github.com/your-profile',
  },
]
