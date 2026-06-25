# Continuous Agent OS Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Make the homepage middle read as one continuous Agent OS experience with a coherent hierarchy and scroll motion.

**Architecture:** Keep the existing React, Tailwind v4, Framer Motion, and section components. Introduce a shared sequence rail at the App composition level, simplify nested surfaces inside each section, and tune the existing scroll transform instead of adding a second motion system.

**Tech Stack:** React 19, Vite 6, Tailwind CSS v4, Framer Motion 12, GSAP only where already isolated in Hero.

---

### Task 1: Establish the continuous section frame

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/index.css`

**Steps:**
1. Add a semantic wrapper for the four middle sections with a desktop sequence rail.
2. Move the sequence labels into the rail on desktop and preserve inline labels on mobile.
3. Replace the center accent line with an offset rail aligned to the content grid.
4. Add only the CSS utilities needed for rail positioning and shared surface depth.
5. Run `npm run lint`.

### Task 2: Merge capabilities and control surface hierarchy

**Files:**
- Modify: `src/components/sections/Capabilities.jsx`
- Modify: `src/components/sections/SystemShowcase.jsx`
- Modify: `src/components/ui/container-scroll.tsx`

**Steps:**
1. Keep Capabilities as the only large heading in the middle flow.
2. Convert System Showcase title into a compact continuation header.
3. Remove redundant nested shell styling and excess glow.
4. Tune scroll offsets so rotation reaches zero in the upper half of the viewport and remains zero.
5. Replace repeated pulsing rows with a staggered reveal or one restrained active signal.
6. Verify reduced-motion behavior.
7. Run `npm run lint`.

### Task 3: Attach work objects and writing to the same system

**Files:**
- Modify: `src/components/sections/Work.jsx`
- Modify: `src/components/ui/project-carousel.jsx`
- Modify: `src/components/sections/Journal.jsx`

**Steps:**
1. Remove the extra Work device frame and use dividers to connect it to the shared flow.
2. Reduce project card radius and nested borders while preserving the modal interaction.
3. Keep one meaningful animated preview per object and reduce simultaneous effects.
4. Turn Journal into a compact event-log style continuation without a standalone card shell.
5. Run `npm run lint`.

### Task 4: Visual and motion verification

**Files:**
- Modify if needed: `tools/record-motion-audit.mjs`

**Steps:**
1. Make the audit script scroll to named sections instead of relying only on fixed wheel distances.
2. Capture desktop motion video and a contact sheet.
3. Capture mobile screenshots at the section boundaries.
4. Run `npm run build`.
5. Submit artifacts to an independent visual reviewer.
6. Fix every Critical and Important finding, then repeat the review.

