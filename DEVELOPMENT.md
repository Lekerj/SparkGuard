# SparkGuard Development Guide

This document provides technical instructions for running and developing the SparkGuard marketing website.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

## 🛠 Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **TailwindCSS** - Utility-first styling
- **React Router** - Client-side routing
- **Framer Motion** - Animations
- **Lucide React** - Icons

## 📁 Project Structure

```
sparkguard/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── layout/           # Header, Footer, Layout, Container
│   │   ├── ui/               # Button, Badge, Card, etc.
│   │   ├── BeforeAfterSlider.tsx
│   │   ├── IncidentPackagePanel.tsx
│   │   └── Pipeline.tsx
│   ├── data/
│   │   ├── mockIncidents.ts  # Demo scenario data
│   │   └── teamMembers.ts    # Team information
│   ├── pages/
│   │   ├── Contact.tsx
│   │   ├── Data.tsx
│   │   ├── Demo.tsx
│   │   ├── Home.tsx
│   │   ├── Product.tsx
│   │   └── Team.tsx
│   ├── App.tsx               # Router setup
│   ├── index.css             # Global styles
│   ├── main.tsx              # Entry point
│   └── vite-env.d.ts
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 📄 Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Hero, problem/solution, key features |
| `/product` | Product | Pipeline visualization, AI decision support |
| `/data` | Data Sources | Compatible data types, integrations |
| `/demo` | Interactive Demo | Two scenario demonstration |
| `/team` | Team | Team member cards |
| `/contact` | Contact | Contact form |

## 🎨 Customization

### Team Members
Edit `src/data/teamMembers.ts`:

```typescript
export const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Your Name',      // Replace placeholder
    role: 'Your Role',
    bio: 'Your bio...',
    placeholder: false,     // Set to false when updated
  },
]
```

### Color Theme
Customize in `tailwind.config.js`:

```javascript
colors: {
  primary: { /* fire/emergency red tones */ },
  secondary: { /* trust/safety blue tones */ },
}
```

### Mock Data / Demo Scenarios
Update `src/data/mockIncidents.ts` to modify:
- Hotspot detections
- Weather conditions
- Incident details
- Alert log entries

### Adding New Pages
1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add nav link in `src/components/layout/Header.tsx`
4. Update page title in `src/App.tsx` pageTitles object

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 🔧 Path Aliases

The project uses `@/` as an alias for `src/`:

```typescript
import Button from '@/components/ui/Button'
import { mockIncidents } from '@/data/mockIncidents'
```

Configured in both `tsconfig.json` and `vite.config.ts`.

## ⚠️ Important Notes

### Demo Mode
- All data is simulated
- No real satellite data is processed
- No backend required
- No API keys needed

### Images
- Satellite imagery shown are placeholders
- Replace with properly licensed assets for production
- SVG placeholders are used where possible

### Accessibility
- Semantic HTML throughout
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators styled

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Collapsible mobile navigation

## 🔒 Security

- No external API calls
- No data collection
- Client-side only
- Safe for public deployment

## 📝 Code Style

- TypeScript strict mode enabled
- Functional components with hooks
- TailwindCSS for all styling
- Framer Motion for animations

---

For questions about the SparkGuard project concept, see the main [README.md](./README.md).
