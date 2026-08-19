# Accessibility

KeySmith targets WCAG-oriented desktop accessibility.

Implemented baseline:

- semantic labels and fieldsets,
- keyboard-operable tabs with arrow-key navigation,
- explicit tab-to-panel `aria-controls` relationships and roving tab focus,
- visible `:focus-visible` outlines,
- skip link,
- `aria-live` status and generated-secret output,
- status not communicated by color alone,
- scalable typography and responsive layout,
- reduced-motion media query,
- touch-friendly minimum control sizes,
- light/dark contrast-aware design tokens,
- localized visible copy and accessible names drawn from the same frontend catalog discipline.

Automated static regression checks in `src/accessibility.test.ts` load the real `index.html` and verify:

- unique element IDs,
- explicit label targets,
- tab-to-tabpanel relationships,
- button text/ARIA-name presence,
- dialog `aria-labelledby` targets.

These checks catch structural regressions but are not a substitute for assistive-technology testing.

Release review must manually test keyboard-only navigation, focus order, screen-reader labels, 200% zoom/scaling, dark/light themes, text expansion, and reduced motion. Accessibility bugs are treated as product defects.
