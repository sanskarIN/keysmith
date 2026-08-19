# Accessibility

KeySmith targets WCAG-oriented desktop accessibility.

Implemented baseline:

- semantic labels and fieldsets,
- keyboard-operable tabs with arrow-key navigation,
- visible `:focus-visible` outlines,
- skip link,
- `aria-live` status and generated-secret output,
- status not communicated by color alone,
- scalable typography and responsive layout,
- reduced-motion media query,
- touch-friendly minimum control sizes,
- light/dark contrast-aware design tokens.

Release review must manually test keyboard-only navigation, focus order, screen-reader labels, 200% zoom/scaling, dark/light themes, and reduced motion. Accessibility bugs are treated as product defects.
