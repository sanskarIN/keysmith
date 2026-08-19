# Accessibility

KeySmith targets WCAG-oriented desktop accessibility while acknowledging that packaged native verification is still required before release.

## Implemented baseline

- semantic labels and fieldsets,
- keyboard-operable generator tabs with Left/Right arrow navigation,
- explicit tab-to-panel `aria-controls` relationships and roving tab focus,
- semantic `hidden` state synchronized with visual panel visibility,
- visible `:focus-visible` outlines,
- skip link,
- `aria-live` status and generated-secret output,
- status meaning not communicated by color alone,
- scalable typography and responsive layout,
- reduced-motion media query,
- touch-friendly minimum control sizes,
- light/dark contrast-aware design tokens,
- localized visible copy and accessible names drawn from the same frontend catalog discipline,
- native save dialog for batch export rather than a custom inaccessible file-picker widget,
- standard operating-system browser/mail handlers for explicit About/contact links.

## Automated regression coverage

`src/accessibility.test.ts` loads the real `index.html` and verifies:

- unique element IDs,
- explicit label targets,
- tab-to-tabpanel relationships,
- button text/ARIA-name presence,
- dialog `aria-labelledby` targets.

`src/contrast.test.ts` checks the primary-button foreground/background design tokens against the WCAG AA 4.5:1 normal-text contrast target in both themes.

`src/app.integration.test.ts` exercises keyboard mode switching and semantic panel visibility against the real markup. `src/version-consistency.test.ts` prevents visible version metadata from drifting from application manifests.

These automated checks catch structural regressions but are not a substitute for assistive-technology testing.

## Packaged release review

On Windows, macOS, and Linux manually verify:

- keyboard-only navigation from launch through generation, Settings, About, clipboard controls, Batch export, and dialogs,
- logical focus order and visible focus indication,
- focus behavior when native/dialog surfaces open and close,
- screen-reader names/roles/states for generator controls, generated output, status region, dialogs, and actions,
- 200% text/display scaling without clipped controls or inaccessible output,
- light and dark theme readability,
- text expansion for user-facing strings,
- reduced-motion behavior,
- native batch save-dialog usability with keyboard/assistive technology,
- clear saved/cancelled/error feedback after export,
- system browser/mail handoff for About/contact links,
- non-color cues for success/error/strength information.

Accessibility bugs are product defects and can block a release.

## Localization and accessibility

A new locale must preserve accessible names, form labels, dialog labels, and understandable status messages. Test text expansion rather than forcing fixed dimensions to accommodate English. The EFF passphrase word list is separate from UI localization and is not automatically translated.
