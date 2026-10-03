# Identity bible

The corresponding `concept-contract.json` is authoritative for each study. These inspection notes turn those contracts into visual checks for the six native poses in each generated atlas. Read cells left to right across the top row, then left to right across the bottom row.

## Shared anchors

- Use the same object identity, materials, light direction, camera, canvas size, and intended framing in every cell.
- Generate real transparent pixels around the subject; do not paint a checkerboard or studio backdrop into the sheet.
- Keep all parts inside their own cells with enough padding for the motion. No labels, grid lines, cell borders, extra props, or disconnected duplicate subjects.
- Verify changes against the specified action. A different silhouette caused by a turn or opening is expected; unexplained rescaling, new parts, or changing material is not.
- Inspect the returned source before deriving a runtime manifest. The requested grid and pixel dimensions are a plan until measured.

## Porcelain Observer

One pearl-white ceramic robotic head, a dark ink visor, two circular orange optics, and one round ear disc on each side. The ceramic shell shape, optic styling, and ear construction remain consistent. Perspective can hide an optic or an ear when it turns; it must not add a third optic or another ear.

Six poses move monotonically from approximately −30° to +30° yaw around the same vertical axis. Head size, center, tilt, and lighting stay fixed. This is horizontal turning, not a complete 360° rotation or a two-dimensional gaze grid. The rest state is the near-front pose recorded by the brief.

Check the pair order, stable optic color, matching shell contours, and plausible visibility of the far ear in every pose. Reflection changes may follow the turn, while the light source itself remains fixed.

## Silver Bloom

One brushed silver mechanical bud with eight broad, rounded petals and a warm vermilion inner hub. The same petals open around the same hub; the action must not turn the object into a different flower or spawn extra petals.

The six poses progress from a compact bud to a radial bloom. Increasing visible area and changing outer silhouette are part of the action. Preserve the hub's center and material while checking that the petal hinges and overlap stay plausible. Some petals may be partly occluded in compact poses.

Check that successive poses increase the opening, that no petal unexpectedly disappears, and that the fully opened state still belongs to the closed bud. Reversing the frame order should read as closing those same petals.

## Amber Assembly

Six amber translucent rounded glass blocks, each with a graphite inset core. Keep block dimensions, rounded corners, tint, and core construction consistent. Do not change the block count between poses or replace transparent glass with an opaque material.

Six poses progress from a loose cluster to a precise structure with two columns and three rows. Lock the camera and overall composition while the blocks move. Preserve enough separation or visible edges to inspect the six blocks; any occlusion must match their apparent positions.

Check the final two-by-three structure, six corresponding cores, stable block scale, and coherent ordering of intermediate poses. Rendering more codec frames from this sequence would repeat these poses, not establish the physical trajectories between them.

## Acceptance evidence

Keep the original generated image, its hash, measured grid and cell dimensions, and a contact view of the published frame order. Record identity or alignment deviations honestly. Automatic alpha and geometry measurements support the visual inspection; they do not by themselves prove component continuity.
