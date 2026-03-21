# Website Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the personal website with a dark theme, Hero with visual effects, and Bento Grid projects section.

**Architecture:** Single-page Vite + React app with anchor navigation. Hero uses layered effects (Shader background + WavyBackground + VaporizeText). Projects displayed in Bento Grid layout.

**Tech Stack:** Vite, React, Tailwind CSS, shadcn/ui, Three.js (for shader), Framer Motion

---

## Prerequisites

Existing components that can be reused:
- `src/components/ui/shader-animation.tsx` - Shader background
- `src/components/ui/text-shimmer.tsx` - Text shimmer effect

Components to add from 21st.dev:
- WavyBackground (glowy waves effect)
- VaporizeTextCycle (text vaporize animation)
- BentoGridWithFeatures (projects grid)

---

## Task 1: Setup Dark Theme CSS Variables

**Files:**
- Modify: `src/index.css:29-46`

**Step 1: Update CSS variables for dark theme**

Replace the existing `:root` section with dark theme variables:

```css
:root {
  --bg: #0a0a0a;
  --surface: #141414;
  --surface-soft: #1a1a1a;
  --text: #fafafa;
  --muted: #a1a1aa;
  --muted-strong: #d4d4d8;
  --line: #27272a;
  --primary: #3b82f6;
  --primary-strong: #60a5fa;

  --radius-md: 0.85rem;
  --radius-lg: 1.2rem;
  --radius-xl: 1.6rem;

  --shadow-soft: 0 10px 25px rgba(0, 0, 0, 0.3);

  --container: 1120px;
}
```

**Step 2: Update body styles**

Change body background and text color to use dark theme:

```css
body {
  margin: 0;
  font-family: 'Cartograph CF', Georgia, serif;
  color: var(--text);
  background: var(--bg);
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

**Step 3: Commit**

```bash
git add src/index.css
git commit -m "style: switch to dark theme CSS variables"
```

---

## Task 2: Install Missing Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install simplex-noise for WavyBackground**

Run: `npm install simplex-noise`

**Step 2: Verify installation**

Run: `npm ls simplex-noise`

Expected: `simplex-noise@x.x.x`

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add simplex-noise dependency"
```

---

## Task 3: Add WavyBackground Component

**Files:**
- Create: `src/components/ui/wavy-background.tsx`

**Step 1: Create the component**

```tsx
'use client';
import { cn } from '@/lib/utils';
import React, { useEffect, useRef, useState } from 'react';
import { createNoise3D } from 'simplex-noise';

export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981'],
  waveWidth = 50,
  backgroundFill = 'transparent',
  blur = 10,
  speed = 'fast',
  waveOpacity = 0.5,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  colors?: string[];
  waveWidth?: number;
  backgroundFill?: string;
  blur?: number;
  speed?: 'slow' | 'fast';
  waveOpacity?: number;
}) => {
  const noise = createNoise3D();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    setIsSafari(
      typeof window !== 'undefined' &&
        navigator.userAgent.includes('Safari') &&
        !navigator.userAgent.includes('Chrome')
    );
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w: number, h: number, nt: number;
    let animationId: number;

    const init = () => {
      w = ctx.canvas.width = window.innerWidth;
      h = ctx.canvas.height = window.innerHeight;
      ctx.filter = `blur(${blur}px)`;
      nt = 0;
    };

    const getSpeed = () => {
      switch (speed) {
        case 'slow':
          return 0.001;
        case 'fast':
          return 0.002;
        default:
          return 0.001;
      }
    };

    const drawWave = (n: number) => {
      nt += getSpeed();
      for (let i = 0; i < n; i++) {
        ctx.beginPath();
        ctx.lineWidth = waveWidth;
        ctx.strokeStyle = colors[i % colors.length];
        for (let x = 0; x < w; x += 5) {
          const y = noise(x / 800, 0.3 * i, nt) * 100;
          ctx.lineTo(x, y + h * 0.5);
        }
        ctx.stroke();
        ctx.closePath();
      }
    };

    const render = () => {
      ctx.fillStyle = backgroundFill;
      ctx.globalAlpha = waveOpacity;
      ctx.fillRect(0, 0, w, h);
      drawWave(5);
      animationId = requestAnimationFrame(render);
    };

    init();
    render();

    const handleResize = () => {
      w = ctx.canvas.width = window.innerWidth;
      h = ctx.canvas.height = window.innerHeight;
      ctx.filter = `blur(${blur}px)`;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [blur, speed, waveWidth, colors, backgroundFill, waveOpacity]);

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center',
        containerClassName
      )}
    >
      <canvas
        className="absolute inset-0 z-0"
        ref={canvasRef}
        style={{
          ...(isSafari ? { filter: `blur(${blur}px)` } : {}),
        }}
      />
      <div className={cn('relative z-10', className)}>{children}</div>
    </div>
  );
};
```

**Step 2: Commit**

```bash
git add src/components/ui/wavy-background.tsx
git commit -m "feat: add WavyBackground component"
```

---

## Task 4: Add VaporizeTextCycle Component

**Files:**
- Create: `src/components/ui/vaporize-text.tsx`

**Step 1: Create the component**

Create a simplified version based on the 21st.dev component. Due to length, use the component code from the search results above (VapourTextEffect).

Key configuration:
- texts: ["I Build AI", "I Share AI", "I Love AI"]
- font: Inter, 70px, weight 600
- color: white
- vaporizeDuration: 2s
- fadeInDuration: 1s
- waitDuration: 0.5s

**Step 2: Commit**

```bash
git add src/components/ui/vaporize-text.tsx
git commit -m "feat: add VaporizeTextCycle component"
```

---

## Task 5: Add BentoGrid Component

**Files:**
- Create: `src/components/ui/bento-grid.tsx`

**Step 1: Create the component**

```tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

interface BentoCardProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
}

interface BentoTitleProps {
  children?: React.ReactNode;
  className?: string;
}

interface BentoDescriptionProps {
  children?: React.ReactNode;
  className?: string;
}

interface BentoContentProps {
  children: React.ReactNode;
  className?: string;
}

interface BentoFeature {
  id: string;
  title?: string;
  description?: string;
  content: React.ReactNode;
  className?: string;
}

interface BentoGridWithFeaturesProps {
  features: BentoFeature[];
  className?: string;
}

const BentoGrid = ({ children, className }: BentoGridProps) => {
  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-6 lg:grid-cols-6 gap-4 rounded-3xl border border-zinc-800',
        className
      )}
    >
      {children}
    </div>
  );
};

const BentoCard = ({ id, children, className }: BentoCardProps) => {
  return (
    <div
      id={id}
      className={cn(
        'relative overflow-hidden p-6 sm:p-8 bg-zinc-900/50 rounded-2xl border border-zinc-800',
        className
      )}
    >
      {children}
    </div>
  );
};

const BentoTitle = ({ children, className }: BentoTitleProps) => {
  if (!children) return null;
  return (
    <h3
      className={cn(
        'text-left text-xl tracking-tight text-white md:text-2xl',
        className
      )}
    >
      {children}
    </h3>
  );
};

const BentoDescription = ({ children, className }: BentoDescriptionProps) => {
  if (!children) return null;
  return (
    <p
      className={cn(
        'text-left text-sm md:text-base font-normal text-zinc-400 mx-0 my-2 max-w-sm',
        className
      )}
    >
      {children}
    </p>
  );
};

const BentoContent = ({ children, className }: BentoContentProps) => {
  return <div className={cn('h-full w-full mt-4', className)}>{children}</div>;
};

const BentoGridWithFeatures = ({
  features,
  className,
}: BentoGridWithFeaturesProps) => {
  return (
    <div className="relative mb-6">
      <BentoGrid className={className}>
        {features.map((feature) => (
          <BentoCard key={feature.id} id={feature.id} className={feature.className}>
            <BentoTitle>{feature.title}</BentoTitle>
            <BentoDescription>{feature.description}</BentoDescription>
            <BentoContent>{feature.content}</BentoContent>
          </BentoCard>
        ))}
      </BentoGrid>
    </div>
  );
};

export {
  BentoGrid,
  BentoCard,
  BentoTitle,
  BentoDescription,
  BentoContent,
  BentoGridWithFeatures,
  type BentoFeature,
};
```

**Step 2: Commit**

```bash
git add src/components/ui/bento-grid.tsx
git commit -m "feat: add BentoGrid component"
```

---

## Task 6: Create Projects Data

**Files:**
- Create: `src/data/projects.js`

**Step 1: Create project data file**

```js
export const projects = [
  {
    id: '1',
    title: 'AI Assistant',
    description: 'A powerful AI assistant for productivity workflows.',
    className: 'col-span-1 md:col-span-3 lg:col-span-2',
  },
  {
    id: '2',
    title: 'Content Platform',
    description: 'Platform for creating and sharing AI-powered content.',
    className: 'col-span-1 md:col-span-3 lg:col-span-2',
  },
  {
    id: '3',
    title: 'Workflow Tools',
    description: 'Tools for automating repetitive tasks with AI.',
    className: 'col-span-1 md:col-span-3 lg:col-span-2',
  },
  {
    id: '4',
    title: 'Newsletter',
    description: 'Weekly insights on AI, productivity, and building online.',
    className: 'col-span-1 md:col-span-6 lg:col-span-3',
  },
  {
    id: '5',
    title: 'YouTube Channel',
    description: 'Tutorials and deep dives on AI tools and workflows.',
    className: 'col-span-1 md:col-span-6 lg:col-span-3',
  },
];
```

**Step 2: Commit**

```bash
git add src/data/projects.js
git commit -m "feat: add projects data"
```

---

## Task 7: Rebuild Hero Section

**Files:**
- Modify: `src/components/Hero.jsx`

**Step 1: Rewrite Hero with new effects**

```jsx
import { ShaderAnimation } from './ui/shader-animation';
import { WavyBackground } from './ui/wavy-background';
import { TextShimmer } from './ui/text-shimmer';
import { VaporizeTextCycle } from './ui/vaporize-text';

export default function Hero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden" id="home">
      {/* Layer 1: Shader Background */}
      <div className="absolute inset-0 z-0 opacity-30">
        <ShaderAnimation />
      </div>

      {/* Layer 2: Wavy Background */}
      <div className="absolute inset-0 z-[1]">
        <WavyBackground
          colors={['#3b82f6', '#8b5cf6', '#06b6d4']}
          waveWidth={60}
          blur={15}
          speed="slow"
          waveOpacity={0.3}
        />
      </div>

      {/* Layer 3: Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        <div className="mx-auto max-w-4xl text-center">
          {/* Eyebrow */}
          <p className="mb-6 inline-block rounded-full border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-sm text-zinc-400">
            Hi, I'm Damon
          </p>

          {/* Main Title with Vaporize Effect */}
          <div className="mb-6 h-24 md:h-32">
            <VaporizeTextCycle
              texts={['I Build AI', 'I Share AI', 'I Love AI']}
              font={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '48px',
                fontWeight: 700,
              }}
              color="rgb(255, 255, 255)"
            />
          </div>

          {/* Subtitle */}
          <TextShimmer
            as="p"
            duration={3}
            className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10"
          >
            Product builder, writer, and creator. I share practical ideas about
            productivity, AI workflows, and online business.
          </TextShimmer>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#projects"
              className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-medium text-black transition-all hover:bg-zinc-200"
            >
              View Projects
            </a>
            <a
              href="#about"
              className="inline-flex items-center justify-center rounded-full border border-zinc-700 bg-transparent px-8 py-3 text-sm font-medium text-white transition-all hover:bg-zinc-800"
            >
              About Me
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/Hero.jsx
git commit -m "feat: rebuild Hero with shader, waves, and vaporize text"
```

---

## Task 8: Rebuild About Section

**Files:**
- Modify: `src/components/About.jsx`

**Step 1: Simplify About for dark theme**

```jsx
export default function About() {
  return (
    <section className="section bg-zinc-950" id="about">
      <div className="container">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            About Me
          </h2>
          <p className="text-lg text-zinc-400 leading-relaxed mb-6">
            I'm a product builder with 10+ years of experience creating digital
            products. Currently focused on AI systems that help people work
            better and smarter.
          </p>
          <p className="text-lg text-zinc-400 leading-relaxed">
            Every week, I share practical insights about productivity, AI
            workflows, and building online businesses. My goal is to help you
            become better, not busier.
          </p>
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/About.jsx
git commit -m "feat: rebuild About section for dark theme"
```

---

## Task 9: Create Projects Section

**Files:**
- Create: `src/components/sections/Projects.jsx`
- Or modify existing: `src/components/Topics.jsx` (rename to Projects)

**Step 1: Create Projects component**

```jsx
import { BentoGridWithFeatures } from './ui/bento-grid';
import { projects } from '../data/projects';

export default function Projects() {
  const features = projects.map((project) => ({
    ...project,
    content: (
      <div className="h-32 rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700" />
    ),
  }));

  return (
    <section className="section bg-zinc-900" id="projects">
      <div className="container">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Projects
        </h2>
        <p className="text-lg text-zinc-400 mb-10 max-w-2xl">
          Things I've built and am currently working on.
        </p>
        <BentoGridWithFeatures features={features} />
      </div>
    </section>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/sections/Projects.jsx src/data/projects.js
git commit -m "feat: add Projects section with Bento Grid"
```

---

## Task 10: Update Footer

**Files:**
- Modify: `src/components/Footer.jsx`

**Step 1: Update Footer for dark theme**

```jsx
export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 py-12">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-zinc-500 text-sm">
            © 2026 Damon. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-white transition-colors"
            >
              Twitter
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-white transition-colors"
            >
              YouTube
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-white transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/Footer.jsx
git commit -m "feat: update Footer for dark theme"
```

---

## Task 11: Update Layout and App

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/Layout.jsx`
- Modify: `src/components/Navbar.jsx`

**Step 1: Simplify App.jsx to use new sections**

```jsx
import Layout from './components/Layout';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/sections/Projects';

function App() {
  return (
    <Layout>
      <Navbar />
      <Hero />
      <About />
      <Projects />
      <Footer />
    </Layout>
  );
}

export default App;
```

**Step 2: Update Navbar for dark theme with anchor links**

```jsx
export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          <a href="#home" className="text-xl font-bold text-white">
            Damon
          </a>
          <div className="flex gap-6">
            <a href="#about" className="text-zinc-400 hover:text-white transition-colors">
              About
            </a>
            <a href="#projects" className="text-zinc-400 hover:text-white transition-colors">
              Projects
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
```

**Step 3: Commit**

```bash
git add src/App.jsx src/components/Layout.jsx src/components/Navbar.jsx
git commit -m "feat: update Layout and App with new sections"
```

---

## Task 12: Clean Up Unused Components

**Files:**
- Delete: `src/components/Topics.jsx`
- Delete: `src/components/TopicCard.jsx`
- Delete: `src/components/Blog.jsx`
- Delete: `src/components/Contact.jsx`

**Step 1: Remove unused components**

```bash
rm src/components/Topics.jsx src/components/TopicCard.jsx src/components/Blog.jsx src/components/Contact.jsx
```

**Step 2: Commit**

```bash
git add -A
git commit -m "chore: remove unused components"
```

---

## Task 13: Test and Verify

**Step 1: Run development server**

Run: `npm run dev`

**Step 2: Verify in browser**

- [ ] Hero section renders with all effects
- [ ] VaporizeText cycles through texts
- [ ] WavyBackground shows wave animation
- [ ] About section displays correctly
- [ ] Projects Bento Grid renders
- [ ] Footer shows social links
- [ ] Dark theme is consistent
- [ ] Anchor navigation works

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete website redesign with dark theme"
```

---

## Summary

| Task | Description | Status |
|------|-------------|--------|
| 1 | Dark theme CSS variables | Pending |
| 2 | Install simplex-noise | Pending |
| 3 | WavyBackground component | Pending |
| 4 | VaporizeTextCycle component | Pending |
| 5 | BentoGrid component | Pending |
| 6 | Projects data | Pending |
| 7 | Rebuild Hero section | Pending |
| 8 | Rebuild About section | Pending |
| 9 | Create Projects section | Pending |
| 10 | Update Footer | Pending |
| 11 | Update Layout and App | Pending |
| 12 | Clean up unused components | Pending |
| 13 | Test and verify | Pending |
