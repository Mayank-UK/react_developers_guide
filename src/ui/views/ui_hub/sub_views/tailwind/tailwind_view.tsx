import { SectionWrapper } from '../../../../components/section-wrapper';
import { ContentGroupWrapper } from '../../../../components/content-group-wrapper';
import { TextBlock } from '../../../../components/text-block';
import { CodeBlock } from '../../../../components/code-block';
import { Example } from '../../../../components/example';

/**
 * TailwindView — utility-first styling, the approach this app actually uses.
 * Covers the mental model, how this app wires design-system tokens into Tailwind
 * v4 via @theme inline, the everyday utilities, responsive + dark variants, and
 * the config-less v4 setup. Live demos show responsive + dark behavior.
 */
export default function TailwindView() {
    return (
        <div className="flex flex-col gap-md">
            <MentalModelSection />
            <ThisAppSetupSection />
            <EverydayUtilitiesSection />
            <ResponsiveSection />
            <DarkModeSection />
            <ProsConsSection />
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 1. Mental model                                                            */
/* -------------------------------------------------------------------------- */

function MentalModelSection() {
    return (
        <SectionWrapper title="Utility-first styling">
            <ContentGroupWrapper title="No component CSS — compose with small classes">
                <TextBlock>
                    {`Tailwind gives you thousands of tiny utility classes (p-4, flex,
text-center, rounded-md) instead of pre-designed components. You build a look by
combining utilities directly in className. The payoff: you never switch between
JSX and CSS files, never invent class names, and never accumulate dead CSS —
only utilities you actually use are generated. This app is styled entirely this
way; the design-system screens layer tokens on top.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`// No separate .css per component — the styling IS the className:
<button className="rounded-md px-md py-xs text-on-primary shadow-button-card">
  Save
</button>

/* Tailwind compiles each utility to real CSS: */
/* .rounded-md { border-radius: var(--radius-md); }
   .px-md      { padding-inline: var(--space-md); }
   .text-on-primary { color: var(--color-on-primary); } */`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 2. How this app wires Tailwind to the design tokens                        */
/* -------------------------------------------------------------------------- */

function ThisAppSetupSection() {
    return (
        <SectionWrapper title="How this app configures Tailwind v4">
            <ContentGroupWrapper title="Tailwind v4 + Vite plugin, no config file">
                <TextBlock>
                    {`Tailwind v4 is config-less: you add the Vite plugin and write
@import 'tailwindcss' once in index.css — no tailwind.config.js. The magic that
makes this app's tokens usable as utilities is @theme inline: it maps each
design token (a CSS variable) to a Tailwind utility namespace, so bg-surface,
text-on-surface, rounded-md, shadow-button-card all reference the live CSS
variables. That's why flipping [data-theme] to dark instantly restyles every
utility — they're var() references, not hardcoded colors.`}
                </TextBlock>
                <CodeBlock
                    language="css"
                    code={`/* index.css */
@import 'tailwindcss';
@import './ui/design-system/tokens.css';

@theme inline {
  /* map token → utility namespace */
  --color-surface: var(--color-surface);       /* → bg-surface, text-surface */
  --color-on-surface: var(--color-on-surface); /* → text-on-surface */
  --radius-md: var(--radius-md);               /* → rounded-md */
  --shadow-button-card: var(--shadow-button-card); /* → shadow-button-card */
}`}
                    caption="vite.config.ts loads @tailwindcss/vite — no tailwind.config.js needed."
                />
            </ContentGroupWrapper>
            <ContentGroupWrapper title="Naming convention → token">
                <TextBlock>
                    {`The utility prefix tells you which token it reads. bg-* and text-*
read color tokens; rounded-* reads radius; shadow-* reads shadow; gap-/px-/py-*
read spacing. The spacing scale reuses the token names: gap-md = var(--space-md).`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`<div className="bg-surface text-on-surface rounded-lg shadow-drawer">
  {/* bg-surface       → background-color: var(--color-surface)
     text-on-surface  → color: var(--color-on-surface)
     rounded-lg       → border-radius: var(--radius-lg)
     shadow-drawer    → box-shadow: var(--shadow-drawer) */}
</div>`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 3. Everyday utilities                                                      */
/* -------------------------------------------------------------------------- */

function EverydayUtilitiesSection() {
    return (
        <SectionWrapper title="Everyday utilities">
            <ContentGroupWrapper title="Layout, spacing, color, typography">
                <TextBlock>
                    {`A handful of categories cover most styling. The spacing scale is
consistent: xxs/xs/sm/md/lg/xl map to the --space-* tokens. Colors come from the
design tokens (surface, on-surface, primary, etc.). Typography utilities target
font-family, size, and weight.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`<div className="flex flex-col gap-md p-md">  {/* layout + spacing */}
  <h2 className="text-title-lg font-medium text-on-surface">
    Heading
  </h2>
  <p className="text-body text-on-surface-variant leading-relaxed">
    Body text in a muted color.
  </p>
  <div className="rounded-md border border-outline bg-surface-tint p-sm">
    A tinted, bordered box.
  </div>
</div>`}
                />
            </ContentGroupWrapper>
            <ContentGroupWrapper title="Tokens are first-class; reserve [ ] for true one-offs">
                <TextBlock>
                    {`Every design token lives in the @theme inline block in index.css under
its proper namespace (--color-*, --text-*, --font-*, --spacing-*, --radius-*,
--shadow-*), so Tailwind generates a real utility for it. Write the utility —
text-body, font-mono, bg-primary — never the raw variable.

The bracket escape text-[var(--text-caption)] is a code smell here: it signals a
token that was never registered under its namespace. The rule of thumb — if
[var(-- appears in JSX, a token is missing from @theme inline.

Use the [ ] arbitrary syntax only for genuine one-off values with no token
behind them: w-[320px], h-[44px], grid-cols-[1fr_2fr], leading-[1.7].`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`// ✅ token is registered under --text-* → first-class utility
<p className="text-caption font-mono text-on-surface-variant" />

// ✅ genuine one-off pixel value, no token exists
<button className="h-[44px] w-[110px] rounded-md" />

// 🚫 smell — token exists, just wasn't registered; register it instead
<p className="text-[var(--text-caption)]" />`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 4. Responsive variants                                                     */
/* -------------------------------------------------------------------------- */

function ResponsiveSection() {
    return (
        <SectionWrapper title="Responsive variants">
            <ContentGroupWrapper title="sm:/md:/lg: prefix per breakpoint">
                <TextBlock>
                    {`Prefix any utility with a breakpoint to apply it from that width up:
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 means 1 column on mobile, 2 from the
sm breakpoint, 3 from lg. This is how the home nav grid reflows. Default
breakpoints: sm 640, md 768, lg 1024, xl 1280, 2xl 1536.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`<nav className="grid grid-cols-1 gap-sm sm:grid-cols-2 lg:grid-cols-3">
  <Card /><Card /><Card />
</nav>

// One element, behavior changes with width:
<h1 className="text-title md:text-title-lg">
  Grows at md
</h1>`}
                />
            </ContentGroupWrapper>
            <ContentGroupWrapper title="Live: resize the window">
                <TextBlock>
                    {`This grid is grid-cols-1 sm:grid-cols-2 lg:grid-cols-3. Narrow your
browser window and watch the columns reflow — the utility prefix is all there
is to it.`}
                </TextBlock>
                <Example label="Resize the window">
                    <ResponsiveDemo />
                </Example>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

function ResponsiveDemo() {
    return (
        <div className="grid grid-cols-1 gap-sm sm:grid-cols-2 lg:grid-cols-3">
            {['one', 'two', 'three', 'four', 'five', 'six'].map((t) => (
                <div
                    key={t}
                    className="rounded-md border border-outline bg-surface-tint p-md text-center text-body-sm text-on-surface-variant"
                >
                    {t}
                </div>
            ))}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 5. Dark mode                                                               */
/* -------------------------------------------------------------------------- */

function DarkModeSection() {
    return (
        <SectionWrapper title="Dark mode via variant">
            <ContentGroupWrapper title="dark: prefix + data-theme">
                <TextBlock>
                    {`Tailwind's dark: prefix styles an element only in dark mode. In v4 the
default dark strategy is prefers-color-scheme, but this app themes via a
[data-theme] attribute on <html>, so dark mode is driven by the ThemeProvider
set on the header toggle — not the OS. Because every color utility reads a CSS
variable, most of the app doesn't even need dark: prefixes: the tokens
themselves swap (see the CSS variables screen).`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`// Token-driven (this app's main approach) — no dark: needed:
<p className="text-on-surface">reads the variable, auto-adapts</p>

// dark: prefix — for the rare fixed token that must differ:
<p className="text-black dark:text-white">explicit per-mode color</p>`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 6. Trade-offs                                                              */
/* -------------------------------------------------------------------------- */

function ProsConsSection() {
    return (
        <SectionWrapper title="Trade-offs & guardrails">
            <ContentGroupWrapper title="Long classNames, but reusable">
                <TextBlock>
                    {`The common criticism is "long class strings". Mitigations this app
uses: (1) extract repeated patterns into a component (the shared primitives),
(2) keep className readable by ordering layout → spacing → color → effect. The
gain is no dead CSS, no naming, and pixel-level control.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`// Instead of repeating this everywhere, extract a component:
<button className="rounded-md px-md py-xs text-on-primary shadow-button-card hover:shadow-button-card-hover"
  style={{ backgroundColor: 'var(--color-primary)' }}>
  Primary
</button>

// → one reusable <PrimaryButton/> used across files (see Architecture screen)`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}
