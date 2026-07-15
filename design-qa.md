# Design QA

- Source visual truth: `/Users/conquer/.codex/generated_images/019f6512-7764-7520-a14b-971112086e0d/exec-1dd8f01e-8846-4858-adb0-0051f9a3b010.png`
- Desktop implementation screenshot: `/tmp/mc-redesign-final-desktop.png`
- Mobile implementation screenshot: `/tmp/mc-redesign-mobile-hero-fixed.png`
- Viewports: desktop `1440 × 1000`; mobile `390 × 844`
- State: page loaded, loader complete, hero entrance complete; representative scroll scenes captured after their reveal timelines.
- Full-view comparison evidence: `/tmp/mc-redesign-full-comparison.png`
- Focused hero comparison evidence: `/tmp/mc-redesign-hero-comparison.png`

## Findings

No actionable P0, P1, or P2 issues remain.

- Fonts and typography: Barlow Condensed and Manrope reproduce the target's narrow editorial display voice and readable utility/body hierarchy. The hero, manifesto, conversion, process, and work titles maintain the intended aggressive scale without desktop or mobile overflow.
- Spacing and layout rhythm: desktop preserves the mock's alternating dark/light sections, wide gutters, asymmetric hierarchy, and large cinematic pauses. Mobile converts pinned/horizontal scenes into readable vertical or touch-scroll compositions without horizontal page overflow.
- Colors and tokens: deep ink, warm paper, white, and signal red consistently match the selected direction. Red is used for conversion, progress, active states, and scene transitions rather than decorative noise.
- Image quality and asset fidelity: all visible photography and portfolio imagery comes from Media Components source assets. No image placeholders, CSS illustrations, fake client imagery, or handcrafted SVG artwork were introduced.
- Copy and content: headline, service proposition, metrics, benefits, process, case-study names, FAQs, contact links, and phone number are grounded in the supplied live page. Unsupported testimonials and awards from the concept image were intentionally omitted.
- Interaction states: loader, hero reveal, scroll progress, menu open/close, magnetic CTAs, project hover, FAQ single-open behavior, custom cursor, horizontal reels, and tilt states were tested. Browser console returned no warnings or errors.
- 3D brand system: the supplied `media-components-logo-professional.glb` is rendered as the real GLB asset with its clearcoat materials intact. Eleven scroll-directed poses were checked across hero, manifesto, benefits, conversion, process, work, FAQ, final CTA, and footer; no cursor-driven motion was added.
- Accessibility and resilience: semantic headings, skip link, visible focus, native details/summary, keyboard/Escape menu close, reduced-motion CSS and JavaScript fallbacks, and usable no-JavaScript content are present.

## Comparison history

### Iteration 1

- P2: The auto-hiding desktop header left the menu control unavailable at deep scroll positions.
  - Fix: removed directional header hiding and retained a stable high-contrast sticky header.
  - Post-fix evidence: full-screen menu opens from both top and deep-page states; `/tmp/mc-redesign-menu-final.png`.
- P2: The navigation overlay was initially constrained by the fixed header containing block.
  - Fix: moved the fixed navigation layer outside the header and assigned a dedicated overlay stacking level.
  - Post-fix evidence: `/tmp/mc-redesign-menu-final.png` shows the complete viewport overlay and visible close control.
- P2: “Development” wrapped mid-word at the 390 px breakpoint.
  - Fix: recalibrated the mobile display scale and disabled long desktop pinning on mobile.
  - Post-fix evidence: `/tmp/mc-redesign-mobile-hero-fixed.png`; document scroll width equals client width.
- P2: The `$` prefix was missing from the animated `$100M` metric.
  - Fix: added a source-backed data prefix preserved through the counter animation.

### Iteration 2

- Rechecked desktop and mobile overflow, stable hero state, menu, FAQ, scroll scenes, and console output.
- No further P0/P1/P2 findings.

### Iteration 3 — scroll-linked 3D logo

- P2: The fixed WebGL layer was initially hidden beneath the opaque process and selected-work reels, breaking the intended continuous brand presence.
  - Fix: moved those two reel surfaces below the 3D layer while retaining headings and conversion content above it; repositioned the process pose into the cards' negative space.
  - Post-fix evidence: browser captures at desktop process and mobile process show the mark clearly without covering card titles or body copy.
- P2: The selected-work pose overlapped a subject's face in one horizontal gallery state.
  - Fix: reduced its scale and moved the pose into the lower dark negative space on desktop and mobile.
- Rechecked desktop hero, manifesto, benefits, conversion, process, selected work, FAQ, final CTA, and mobile hero/manifesto/conversion/process. Mobile document width equals viewport width and the browser console has no warnings or errors.

### Iteration 4 — logo proportion and material fidelity

- P2: The supplied GLB appeared wider and flatter than the provided 2D brand mark, while strong white/cool lighting pushed the hero face toward pale pink.
  - Fix: applied a restrained vertical proportion correction, switched to neutral tone mapping, reduced light intensity, and established the supplied brand red as the shared base color for every mesh material.
- P2: The dedicated edge material produced a visibly different hue from the front/back surfaces.
  - Fix: unified face and edge albedo, metalness, roughness, clearcoat, and red emissive fill. Depth is now communicated by physically coherent light and shadow rather than mismatched material colors.
- Post-fix evidence: desktop hero and large angled scroll states were recaptured against dark, red, and warm-white sections. The mark stays saturated, keeps readable edge depth, and the browser console remains clear.

### Iteration 5 — premium studio finish and header origin

- P2: Point-style lighting and limited reflections made the object read as inexpensive plastic in large scroll states.
  - Fix: introduced a PMREM studio environment, broad rectangular key/rim/fill sources, and a restrained lacquered physical material with controlled metalness, full clearcoat, low clearcoat roughness, calibrated IOR, and warm specular response. No decorative image texture was added.
- P2: A tiny WebGL object could not reproduce the exact saturated header-logo color without antialiasing and highlight contamination.
  - Fix: the original SVG remains the exact zero-scroll state. The 3D object now originates from the measured center and width of its red mark, fades in during the first 44 px of scroll, then gains its full studio material as it separates into the hero trajectory.
- Post-fix evidence: desktop and mobile zero-scroll states, departure states, and the large manifesto angle were recaptured. Header alignment is responsive, mobile page width remains equal to viewport width, and no console warnings or errors were reported.

### Iteration 6 — satin red, opaque rendering, and header-safe departure

- P2: The studio lacquer was still lighter and more magenta than the SVG mark, with highlights that read as low-quality game plastic.
  - Fix: shifted the material to a deeper oxblood brand red, reduced metalness, environment contribution, specular strength, and clearcoat, increased satin roughness, and used a red emissive fill instead of white light to preserve visibility on dark backgrounds.
- P2: The first trajectory descended below the header and crossed the eyebrow; on mobile it could also overlap the logo wordmark.
  - Fix: added responsive header-level waypoints. After the SVG origin, the object appears in the free header gap, travels horizontally, and only then descends into the hero.
- P2: Scroll poses used interpolated canvas opacity.
  - Fix: removed visual opacity interpolation. The 3D canvas switches from hidden at the exact SVG origin to fully opaque after 30 px and stays fully opaque through every subsequent pose.
- Post-fix evidence: desktop and 390 × 844 mobile early-scroll states were recaptured; the mark is opaque, the header wordmark and menu remain unobstructed, and mobile document width still equals viewport width.

### Iteration 7 — persistent header stacking

- P2: After the initial header phase, the WebGL layer returned below the fixed header while the object could still intersect its lower boundary.
  - Fix: made the fixed 3D stage permanently higher than the header (`101` versus `100`) instead of changing stacking level by scroll position.
- Post-fix evidence: the desktop boundary-crossing state at approximately 175 px scroll was recaptured. The full object remains consistently rendered above the header with opacity `1`.

### Iteration 8 — slower departure from the brand mark

- P2: The object separated from the static header mark too quickly, making the first scroll response feel abrupt.
  - Fix: extended the origin hold, added a restrained micro-scale/rotation phase, delayed the lateral departure, and distributed the first hero descent across a longer scroll range. Scroll-velocity rotation now ramps in only after the object has begun leaving the origin.
- Post-fix evidence: desktop states at 0, 80, 200, and 520 px plus 390 × 844 mobile states were recaptured. The object stays registered to the header mark during the initial scroll, then moves progressively into the hero; mobile document width remains within the viewport.

### Iteration 9 — sales docking and lead-generation modal

- Added a composed landing arc that settles the 3D mark into a persistent bottom-right dock during the process section, with stable desktop and mobile poses through the remaining page.
- Added a delayed contextual sales prompt and a transparent interaction target aligned to the 3D mark. The prompt reflows above the object on mobile and respects the device safe area.
- Added an accessible GSAP modal containing the supplied LeadConnector Request a Quote form. The external form and embed helper load only on first interaction; background content becomes inert, smooth scrolling pauses, focus moves into the dialog, and returns to the trigger on close.
- Post-fix evidence: desktop and 390 × 844 docking states, popup states, form loading, close/focus restoration, and menu-open states were recaptured. Menu stacking remains above both the 3D stage and trigger, no horizontal overflow was introduced, and the browser console reports no warnings or errors.

### Iteration 10 — form spacing, faster departure, and dock rotation

- Added a responsive white-space frame around the cross-origin LeadConnector iframe (24 px desktop, 12 px mobile) so fields and consent copy no longer touch the modal edges.
- Compressed the first hero keyframes and moved the first free-header waypoint earlier. At 80 px scroll the 3D mark has already cleared the header wordmark on desktop and mobile while retaining damped motion.
- Kept the dock position and scale stable but increased the Y-axis angle across Work, FAQ, Final CTA, and Footer keyframes. The mark now continues rotating in direct response to scroll after landing.
- Post-fix evidence: clean-load desktop/mobile departure states, the padded live form, and Process/Work/FAQ dock orientations were recaptured without console errors or horizontal overflow.

### Iteration 11 — exact dock-ring alignment

- Shifted the desktop dock pose to the visual centroid of the rotated 3D silhouette and moved the final landing waypoint ahead of the sales-trigger reveal.
- Delayed the prompt activation until after the object has settled, preventing the large in-flight mark from overlapping the dock UI.
- Increased the red outer and inner ring contrast so the target remains legible on both light and dark content surfaces.
- Post-fix evidence: settled desktop and 390 × 844 mobile dock states were recaptured. The mark is centered inside both rings, remains scroll-rotatable, and introduces no horizontal overflow.

### Iteration 12 — landing/reveal synchronization

- P2: During fast scrolling, the sales UI could reveal while the damped 3D rig was still converging on its dock pose, exposing a temporarily oversized and vertically offset mark inside the ring.
  - Fix: decoupled the ScrollTrigger threshold from the visible prompt state. The dock UI now waits 850 ms on desktop and 650 ms on mobile after crossing the landing threshold, while reverse scrolling hides it immediately.
- Post-fix evidence: a forced fast-jump capture shows the ring hidden during convergence and visible only after the mark is centered over the target point. Scroll-linked dock rotation remains active.

### Iteration 13 — compact mark inside the dock rings

- Reduced the final desktop dock scale from `0.07` to `0.035` and the mobile dock scale from `0.15` to `0.11`, keeping every downstream rotation keyframe consistent.
- Recalibrated the responsive Y positions after scaling so the visible mark center—not only its motion rig pivot—aligns with the target dot.
- Post-fix evidence: desktop and 390 × 844 mobile captures show the full mark contained inside the inner ring with balanced clearance and no horizontal overflow.

### Iteration 14 — viewport-independent projected centering

- Root cause: the fixed canvas used `window.innerWidth` (including the scrollbar) while its CSS box used `clientWidth`, and a rotated concave 3D silhouette does not share the projected center of its rectangular bounding box.
- Fix: renderer sizing and DOM-to-WebGL conversion now use the actual stage client box. Dock position and scale are measured from the live ring on every resize/refresh.
- Added a dock-only projection pass that samples the model's real geometry vertices, calculates the visible 2D silhouette bounds at the current rotation, and offsets the motion rig so that visible center matches the ring point every frame.
- Post-fix evidence: 1280 × 720, 1024 × 600, and 390 × 844 states were recaptured without overflow or console errors; correction remains active while the mark rotates.

## Primary interactions tested

- Full-screen menu open/close and Escape-ready state.
- Native FAQ single-open behavior and answer visibility.
- Desktop pinned hero, conversion section, process reel, and selected-work reel.
- Sticky benefits narrative and scroll-linked progress.
- Mobile non-pinned hero/transition behavior and touch-scroll galleries.
- Final CTA and source-backed external links.
- Scroll-linked GLB position, scale, rotation, lighting, reverse-scroll continuity, and responsive keyframes.

## Follow-up polish

- P3: Additional device testing on low-power Android hardware would help tune animation density, although reduced-motion and mobile simplification are already implemented.

final result: passed
