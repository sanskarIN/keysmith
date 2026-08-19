# Accessibility

KeySmith treats accessibility as a product requirement rather than a visual-polish task. The desktop UI targets keyboard-first, screen-reader-friendly, scalable, contrast-aware interaction while preserving the application's security/privacy boundaries.

This document describes implemented source-level accessibility behavior and the manual review required before release. Source inspection alone is not evidence that every platform/webview/assistive-technology combination is fully accessible.

## Implemented baseline

The current UI includes:

- semantic `header`, `main`, `section`, `aside`, `footer`, headings, forms, labels, fieldsets, legends, buttons, links, output, and dialog elements;
- explicit labels for generator inputs;
- a skip link that targets the generator region;
- a tablist with Password, Passphrase, and Batch tabs;
- `aria-selected` plus roving tab focus state;
- Left/Right Arrow tab navigation;
- `aria-live` status/output regions for asynchronous generation/clipboard feedback;
- visible `:focus-visible` treatment;
- status text that is not communicated by color alone;
- native `<dialog>`-based onboarding, Settings, and About surfaces;
- responsive/scalable typography and layouts;
- touch-friendly controls;
- reduced-motion handling through media queries;
- light/dark/system themes built from shared design tokens.

## Keyboard interaction contract

### Global navigation

A keyboard-only user must be able to:

1. reach and activate the skip link;
2. reach top-bar theme, Settings, and About actions;
3. enter the generator tab list;
4. reach all controls in the selected panel;
5. generate, copy, clear, export, and operate settings/dialog actions;
6. reach footer content/links where applicable;
7. exit dialogs without a pointer.

No application function required for normal use should depend only on hover, drag, or a pointer gesture.

### Generator tabs

The three mode buttons use tab semantics:

- only the selected tab has `tabIndex=0`;
- unselected tabs have `tabIndex=-1`;
- Left Arrow selects/focuses the previous tab;
- Right Arrow selects/focuses the next tab;
- wrapping is supported at the ends;
- changing mode updates `aria-selected` and visible panel state.

Click/tap activation must remain supported as well.

### Range controls

Length and word-count controls use native range inputs so standard keyboard behavior is inherited from the platform/webview. Their current values are also shown in adjacent text.

### Dialogs

Onboarding, Settings, and About use native `<dialog>` elements. Manual testing must verify platform webview focus behavior because native-dialog accessibility can vary by environment.

Expected behavior:

- modal content receives usable focus;
- background content is not accidentally interactive while modal;
- keyboard focus remains within the modal as appropriate;
- close/start actions are reachable;
- closing returns focus to a reasonable trigger/context;
- reopening onboarding from Settings does not create overlapping modals.

## Focus visibility

Interactive controls must show a visible focus indicator when navigated by keyboard. Theme/styling changes must not remove focus outlines without supplying an equally visible replacement.

Review focus in:

- light theme;
- dark theme;
- system theme under both OS appearances;
- high display scaling;
- selected/unselected generator tabs;
- primary/secondary/icon buttons;
- links inside About;
- form fields/selects/ranges/checkboxes;
- dialog close buttons.

## Labels and accessible names

Every form control requires an accessible name derived from a `<label>`, fieldset/legend, visible button text, or appropriate ARIA label.

Examples in the current markup include:

- Length;
- character-set options grouped under Character sets;
- Custom symbols;
- Policy preset;
- Words;
- Separator;
- passphrase options grouped in a fieldset;
- Number of passwords;
- Clipboard auto-clear;
- Settings theme.

Icon-only controls such as the theme button and dialog close controls require meaningful `aria-label` text.

Decorative logo images use empty `alt` text when nearby text already supplies the product name, preventing redundant announcements.

## Status and generated output

The generated value uses an `<output>` element in a polite live region. Operational messages use a status paragraph with `role="status"` and `aria-live="polite"`.

Messages should be concise and should never contain hidden information available only through color.

Examples of text-state feedback include:

- Generated;
- Copied;
- Clipboard cleared;
- generation/clipboard error messages;
- batch count summary;
- passphrase entropy status.

Do not include real secrets in separate debug/status messages; the generated output itself is already the necessary value presentation.

## Strength presentation

Strength currently presents both a textual label and a numeric score such as `3/4`. Styling may also use color, but color is supplemental rather than the only signal.

Future visual meters must retain text alternatives and must not present zxcvbn output as an absolute security guarantee.

## Error presentation

Core/Tauri errors are surfaced through the live status region. Error styling may use a different color, but the error text itself carries the meaning.

Validation behavior should not rely exclusively on visual border color. If future inline field errors are added, associate them with the relevant control using semantic/ARIA mechanisms and provide textual guidance.

## Color and contrast

Light/dark themes use centralized CSS variables in `src/styles.css` so contrast can be reviewed consistently.

Manual release review should examine at least:

- body/background text;
- muted/help text;
- primary and secondary buttons in default/hover/focus/disabled states;
- card boundaries;
- inputs/selects;
- warning boxes;
- success/error status text;
- tab selected/unselected states;
- About/settings links;
- focus indicators.

Do not infer WCAG contrast compliance solely from source color values; measure rendered combinations in representative webviews when preparing a stable release.

## Scaling and responsive behavior

The Tauri main window has a minimum configured size of 760×620, while CSS also provides responsive behavior.

Test with:

- operating-system display scaling;
- browser/webview text scaling if available;
- 200% zoom-equivalent conditions where the environment supports it;
- the minimum resizable window size;
- long translated/text-expanded content in future localization work.

No critical action or warning should become unreachable because text wraps.

## Reduced motion

`src/styles.css` includes `prefers-reduced-motion` handling. When the user asks the OS/webview to reduce motion:

- non-essential animation/transition should be removed or minimized;
- functionality must not depend on animation completion;
- focus/state changes must remain understandable without movement.

Any future animated strength/clipboard/onboarding feedback must respect the same preference.

## Touch and pointer targets

Although KeySmith is a desktop application, controls should remain comfortably clickable on touch-enabled Windows/Linux devices and high-DPI displays.

Avoid shrinking buttons, select controls, checkboxes, or dialog close controls merely to fit more options on one screen. Prefer responsive layout/wrapping.

## Screen-reader manual review

Before stable release, test at least one representative screen reader/platform combination where possible, and record what was actually tested in `what_changed.md`.

Verify:

- KeySmith/product structure is understandable by headings/landmarks;
- skip link works;
- generator tabs announce selected state;
- fields announce names and grouping;
- generated output/status changes are announced without excessive duplication;
- disabled/enabled Copy/Export controls convey state;
- dialogs announce their names;
- About definition list and links are understandable;
- warning text is reachable/readable;
- no decorative logo is redundantly announced.

Do not claim universal screen-reader compatibility based on one environment.

## Clipboard/export accessibility

Security warnings must also be accessible.

- Clipboard auto-clear explanation is visible text associated with the setting context.
- Batch export warning is ordinary semantic text in a `role="note"` warning box.
- Export is an explicit button and does not happen automatically.
- Clipboard and export success/failure is reported through the live status region.

Do not move security warnings into hover-only tooltips or color-only icons.

## Theme accessibility

The top-bar theme control has an accessible label and a title reflecting the current preference. Settings provides a labeled select with explicit System, Light, and Dark options.

When System is selected, the resolved visual theme may change with the OS while the stored preference remains System. This behavior must not unexpectedly reset focus or dialog state.

## Localization readiness

`src/i18n/en.ts` is only an initial localization seed. Future localization must account for:

- longer labels/buttons;
- right-to-left layouts if introduced;
- translated accessible names/status messages;
- text expansion in dialogs/settings;
- not translating command names/storage keys/programmatic identifiers;
- maintaining warning meaning, not merely literal wording.

## Manual release checklist

### Keyboard

- [ ] Skip link is visible on focus and works.
- [ ] All interactive elements are reachable with Tab/Shift+Tab.
- [ ] Password/Passphrase/Batch tabs work with Left/Right Arrow.
- [ ] No keyboard trap exists outside intended modal focus containment.
- [ ] Generate/Copy/Clear/Export controls activate from keyboard.
- [ ] Settings/About/Onboarding dialogs can be operated and closed.

### Focus

- [ ] Focus indicator is visible in light theme.
- [ ] Focus indicator is visible in dark theme.
- [ ] Dialog opening/closing produces sensible focus behavior.
- [ ] Mode switching sends focus to the newly selected tab only for keyboard arrow navigation as intended.

### Semantics and announcements

- [ ] Form fields announce understandable labels.
- [ ] Fieldsets announce their legends/group purpose.
- [ ] Selected tab state is announced.
- [ ] Generated output is announced appropriately.
- [ ] Error/status messages are announced.
- [ ] Warning/export meaning is exposed as text.

### Visual accessibility

- [ ] Contrast is manually/mechanically reviewed for key text/control states.
- [ ] Status is understandable without color.
- [ ] 200% scaling/zoom-equivalent remains usable.
- [ ] Minimum-window layout remains usable.
- [ ] Light/dark/system themes do not hide content.

### Motion

- [ ] Reduced-motion preference is honored.
- [ ] No essential information relies on animation.

## Accessibility regression rule

An accessibility defect is a product defect. When a behavior can be automated without brittle platform coupling, add a regression test or extract the logic into a testable function. When it depends on native webview/assistive technology, add the exact manual case to this checklist/testing documentation and record release verification.

## Reporting accessibility issues

Public accessibility bugs can use the normal bug-report workflow unless they reveal a security vulnerability. Include:

- KeySmith version/commit;
- OS/webview context;
- assistive technology and version when relevant;
- keyboard or screen-reader steps;
- expected vs actual behavior.

Never include real generated credentials in screenshots, recordings, or issue text.
