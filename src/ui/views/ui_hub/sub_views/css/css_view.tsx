import { useState } from 'react';
import { SectionWrapper } from '../../../../components/section-wrapper';
import { ContentGroupWrapper } from '../../../../components/content-group-wrapper';
import { TextBlock } from '../../../../components/text-block';
import { CodeBlock } from '../../../../components/code-block';
import { Example } from '../../../../components/example';

/**
 * CssView — plain CSS fundamentals, the layer underneath Tailwind. Even though
 * this app styles with Tailwind v4 utilities, those utilities compile down to
 * real CSS, so understanding selectors, the cascade, specificity, units, and
 * custom properties is what makes the Tailwind layer legible. The Bootstrap and
 * Tailwind screens build on these primitives.
 *
 * Live demos are local functions; shared design-system primitives are used
 * throughout.
 */
export default function CssView() {
    return (
        <div className="flex flex-col gap-md">
            <HowCssWorksSection />
            <SelectorsSection />
            <CascadeAndSpecificitySection />
            <UnitsSection />
            <PseudoClassesSection />
            <CustomPropertiesSection />
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 1. How CSS works                                                           */
/* -------------------------------------------------------------------------- */

function HowCssWorksSection() {
    return (
        <SectionWrapper title="How CSS works">
            <ContentGroupWrapper title="Rules select elements and set properties">
                <TextBlock>
                    {`A CSS rule is a selector (which elements) plus a block of
declarations (property: value). The browser matches selectors against the DOM,
resolves conflicts via the cascade + specificity, and paints. In React you
usually don't hand-write .css files — you apply Tailwind utility classes — but
those utilities ARE these rules, generated for you. This app keeps one hand-written
sheet (index.css / tokens.css) for tokens and global resets, and lets Tailwind
generate the rest.`}
                </TextBlock>
                <CodeBlock
                    language="css"
                    code={`/* selector { property: value; } */
.card {
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 16px;
}`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 2. Selectors                                                               */
/* -------------------------------------------------------------------------- */

function SelectorsSection() {
    return (
        <SectionWrapper title="Selectors">
            <ContentGroupWrapper title="Element, class, id, and combinations">
                <TextBlock>
                    {`Selectors target elements. Type selectors (h1) match by tag; class
(.name) matches many; id (#name) matches one. Combinators refine: descendant
(space), child (>), and chaining (.a.b means both classes). In practice classes
are the workhorse — they're reusable and avoid the specificity traps of ids.`}
                </TextBlock>
                <CodeBlock
                    language="css"
                    code={`h1            /* type — every <h1> */
.card         /* class — every class="card" */
#submit-btn   /* id — the one element with id="submit-btn" */

.grid > .card /* child — .card directly inside .grid */
.list .item   /* descendant — .item anywhere inside .list */
.card.active  /* chained — element with BOTH classes */`}
                />
            </ContentGroupWrapper>
            <ContentGroupWrapper title="Pseudo-elements & attribute selectors">
                <TextBlock>
                    {`::before/::after insert generated content; [attr] matches by
attribute. These keep markup clean when the visual detail isn't content.`}
                </TextBlock>
                <CodeBlock
                    language="css"
                    code={`a[href^="https"]::before { content: '🔒 '; }   /* generated content */
input[disabled] { opacity: 0.5; }               /* attribute match */
p::first-line { font-weight: bold; }            /* first line of text */`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 3. The cascade & specificity                                               */
/* -------------------------------------------------------------------------- */

function CascadeAndSpecificitySection() {
    return (
        <SectionWrapper title="The cascade & specificity">
            <ContentGroupWrapper title="Which rule wins?">
                <TextBlock>
                    {`When several rules target the same element, the cascade picks the
winner by: (1) origin/importance (!important beats normal), (2) specificity
(how narrowly the selector targets the element), then (3) source order (later
wins on ties). Specificity is counted as three buckets — (ids, classes, types).
An id beats any number of classes; a class beats any number of types.`}
                </TextBlock>
                <CodeBlock
                    language="css"
                    code={`/* Specificity (ids, classes, types) — higher wins: */
#menu .item        /* (1,1,0) — wins */
.list .item        /* (0,2,0) */
.item              /* (0,1,0) */
div                /* (0,0,1) */

/* Tie at (0,1,0) → later rule wins: */
.item { color: red; }
.item { color: green; }   /* green wins */`}
                />
            </ContentGroupWrapper>
            <ContentGroupWrapper title="Live: inline style vs class">
                <TextBlock>
                    {`Inline styles beat classes (they're treated as higher specificity),
which is why this app reaches for CSS-variable tokens via Tailwind utilities
rather than scattering inline styles — but inline styles are the right tool when
a value is dynamic at runtime (e.g. a user-picked color).`}
                </TextBlock>
                <Example label="Inline style vs class">
                    <SpecificityDemo />
                </Example>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

function SpecificityDemo() {
    const [useInline, setUseInline] = useState(false);
    return (
        <div className="flex flex-col gap-sm">
            <div className="flex flex-wrap items-center gap-sm">
                <button
                    type="button"
                    onClick={() => setUseInline(false)}
                    className="rounded-md border border-outline px-sm py-xs text-[var(--text-body-sm)] text-on-surface hover:bg-surface-variant"
                    data-selected={!useInline}
                    style={
                        !useInline
                            ? { borderColor: 'var(--color-primary)' }
                            : undefined
                    }
                >
                    class only
                </button>
                <button
                    type="button"
                    onClick={() => setUseInline(true)}
                    className="rounded-md border border-outline px-sm py-xs text-[var(--text-body-sm)] text-on-surface hover:bg-surface-variant"
                    data-selected={useInline}
                    style={
                        useInline
                            ? { borderColor: 'var(--color-primary)' }
                            : undefined
                    }
                >
                    class + inline
                </button>
            </div>
            <div
                className="rounded-md px-md py-sm text-center font-medium text-on-primary"
                data-testid="spec-target"
                style={
                    useInline
                        ? { backgroundColor: 'var(--color-secondary)' }
                        : undefined
                }
                // The class always applies primary; the inline style overrides it when on.
            >
                {useInline
                    ? 'inline style wins (secondary)'
                    : 'class applied (primary)'}
            </div>
            <p className="text-[var(--text-caption)] text-on-surface-variant">
                The element always carries the primary class; toggling adds an
                inline background-color that overrides it.
            </p>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 4. Units                                                                   */
/* -------------------------------------------------------------------------- */

function UnitsSection() {
    return (
        <SectionWrapper title="Units: px, %, rem, em, vh/vw">
            <ContentGroupWrapper title="Absolute vs relative">
                <TextBlock>
                    {`px is absolute (a physical pixel-ish unit). % is relative to the
parent. rem is relative to the root font-size (consistent scaling across the
whole app — 1rem = 16px by default). em is relative to the element's own
font-size (compounds when nested — use carefully). vh/vw are relative to the
viewport (1vh = 1% of screen height).`}
                </TextBlock>
                <CodeBlock
                    language="css"
                    code={`.card {
  padding: 1rem;       /* 16px — scales with user's font-size setting */
  width: 50%;          /* half of the parent's content width */
  border-radius: 8px;  /* crisp, fixed */
  font-size: 0.875rem; /* 14px */
  max-height: 80vh;    /* 80% of the viewport height */
}`}
                />
            </ContentGroupWrapper>
            <ContentGroupWrapper title="Live: rem scales with root font-size">
                <TextBlock>
                    {`Changing the root font-size scales every rem value together. This is
exactly how a design system keeps proportions consistent — tokens are defined in
px but consumed as rem-friendly utilities.`}
                </TextBlock>
                <Example label="rem scales with root font-size">
                    <UnitsDemo />
                </Example>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

function UnitsDemo() {
    const [root, setRoot] = useState(16);
    return (
        <div className="flex flex-col gap-sm" style={{ fontSize: `${root}px` }}>
            <div className="flex flex-wrap items-center gap-sm">
                <label className="text-[var(--text-body-sm)] text-on-surface-variant">
                    root font-size
                </label>
                <input
                    type="range"
                    min={12}
                    max={24}
                    value={root}
                    onChange={(e) => setRoot(Number(e.target.value))}
                    className="w-[160px]"
                    aria-label="Root font size in pixels"
                />
                <span className="text-[var(--text-body-sm)] text-on-surface tabular-nums">
                    {root}px
                </span>
            </div>
            <div
                className="rounded-md bg-surface-tint p-md"
                style={{ padding: `${root}px ${root * 2}px` }}
            >
                <p style={{ fontSize: '1rem' }}>
                    1rem text — scales with the root.
                </p>
                <p style={{ fontSize: '1.25rem' }}>1.25rem subheading.</p>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 5. Pseudo-classes                                                          */
/* -------------------------------------------------------------------------- */

function PseudoClassesSection() {
    return (
        <SectionWrapper title="Pseudo-classes">
            <ContentGroupWrapper title="State-based styles">
                <TextBlock>
                    {`A pseudo-class (single colon) styles an element based on state or
position: :hover, :focus, :active, :disabled, :first-child. They add
interactivity without JS — the browser tracks the state for you. The interactive
behaviours screen goes deeper on these.`}
                </TextBlock>
                <CodeBlock
                    language="css"
                    code={`.btn {
  background-color: var(--color-primary);
}
.btn:hover {           /* mouse over it */
  background-color: var(--color-primary-container);
}
.btn:focus-visible {   /* keyboard focus — accessibility */
  outline: 2px solid var(--color-secondary);
}
input:disabled {       /* form state */
  opacity: 0.5;
}`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 6. Custom properties (CSS variables)                                       */
/* -------------------------------------------------------------------------- */

function CustomPropertiesSection() {
    return (
        <SectionWrapper title="Custom properties (CSS variables)">
            <ContentGroupWrapper title="The backbone of this app's design system">
                <TextBlock>
                    {`Custom properties (--name: value) are dynamic, inherited, and
changeable at runtime via JS. They're how this app themes light/dark — the same
utility class (bg-surface) resolves to different colors because [data-theme]
overrides the token. Unlike Sass/SCSS variables, CSS variables are live: change
the variable and every consumer updates instantly.`}
                </TextBlock>
                <CodeBlock
                    language="css"
                    code={
                        ":root {\n  --color-primary: #6200ea;   /* default token */\n  --space-md: 16px;\n}\n\n[data-theme='dark'] {\n  --color-primary: #bb86fc;   /* override in dark mode */\n}\n\n.card {\n  /* read a token with var() — can take a fallback */\n  background: var(--color-surface);\n  padding: var(--space-md);\n  color: var(--color-on-surface, #000); /* fallback if unset */\n}"
                    }
                />
            </ContentGroupWrapper>
            <ContentGroupWrapper title="Live: change a token, watch it propagate">
                <TextBlock>
                    {`The two tiles below read background-color: var(--demo-color). Move
the slider to set --demo-color on their container — both tiles update together
because custom properties cascade and inherit.`}
                </TextBlock>
                <Example label="Change a token, watch it propagate">
                    <CustomPropertiesDemo />
                </Example>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

const DEMO_HUES = [
    { label: 'primary', val: '#6200ea' },
    { label: 'secondary', val: '#03dac6' },
    { label: 'warning', val: '#ff9800' },
    { label: 'critical', val: '#e53935' },
];

function CustomPropertiesDemo() {
    const [hue, setHue] = useState(0);
    const current = DEMO_HUES[hue];
    return (
        <div className="flex flex-col gap-sm">
            <div className="flex flex-wrap gap-xs">
                {DEMO_HUES.map((h, i) => (
                    <button
                        key={h.label}
                        type="button"
                        onClick={() => setHue(i)}
                        className="rounded-md border border-outline px-sm py-xs text-[var(--text-body-sm)] capitalize text-on-surface hover:bg-surface-variant"
                        data-selected={i === hue}
                        style={i === hue ? { borderColor: h.val } : undefined}
                    >
                        {h.label}
                    </button>
                ))}
            </div>
            <div
                className="grid grid-cols-2 gap-sm"
                style={{ ['--demo-color' as string]: current.val }}
            >
                {[0, 1].map((i) => (
                    <div
                        key={i}
                        className="rounded-md px-md py-lg text-center font-medium text-on-primary"
                        style={{ backgroundColor: 'var(--demo-color)' }}
                        data-testid="cp-tile"
                    >
                        tile {i + 1}
                    </div>
                ))}
            </div>
            <p className="font-[var(--font-mono)] text-[var(--text-caption)] text-on-surface-variant">
                --demo-color = {current.val} ({current.label})
            </p>
        </div>
    );
}
