# Continuous Agent OS Design

## Goal

Turn the homepage middle from a sequence of component demos into one continuous
operating narrative: runtime, control surface, work objects, then field notes.

## Direction

Use a single visual system named "Agent OS":

- One shared background field and one restrained accent.
- One persistent section rail for sequence and progress.
- One primary device surface at a time.
- Runtime transitions directly into the control surface.
- Work objects reuse the same internal panel grammar without another device shell.
- Writing becomes a quiet log attached to the system, not a new card section.

The result should feel editorial and technical, not like a dashboard template or
a library showcase.

## Hierarchy

1. Capabilities introduces the operating system and owns the largest heading.
2. System Showcase is a continuation label and the main scroll interaction.
3. Work uses a smaller heading and a denser object rail.
4. Journal is a compact log strip with no oversized section reset.
5. Contact remains the only deliberate hard transition after the continuous flow.

## Motion

- The control surface starts with a restrained 8-10 degree tilt.
- It reaches zero rotation while moving through the upper half of the viewport.
- Once flat, it stays flat. Translation is limited to the heading, not the device.
- Repeated perpetual animation is reduced: one scanning signal per major surface,
  with secondary rows using staggered entry instead of simultaneous pulsing.
- All transform motion respects `prefers-reduced-motion`.

## Surface Rules

- Major shell radius: 24-28px.
- Inner panel radius: 10-16px.
- Avoid more than two nested borders.
- Remove accent glow shadows; use tinted depth and inner highlights.
- Use dividers and negative space for secondary content instead of new cards.
- Keep Cartograph CF for display and monospace for system metadata.

## Responsive Behavior

- Desktop uses a narrow persistent rail and an asymmetric content column.
- Mobile collapses the rail into an inline sequence label.
- Device tilt is reduced on mobile and the content remains fully readable.
- Horizontal work objects remain touch-scrollable with stable snap widths.

## Acceptance Criteria

- No viewport shows two competing large section headings.
- Capabilities, control surface, work, and writing visibly share one grammar.
- The control surface is flat before its center crosses the viewport center.
- No clipped device content at 1440x900 or mobile.
- Motion audit shows intentional change rather than continuous ambient noise.
- Lint and production build pass.

