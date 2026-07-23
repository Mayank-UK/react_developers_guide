import { SectionWrapper } from '../../../../components/section-wrapper';
import { ContentGroupWrapper } from '../../../../components/content-group-wrapper';
import { TextBlock } from '../../../../components/text-block';
import { CodeBlock } from '../../../../components/code-block';
import { Example } from '../../../../components/example';
import { useTheme } from '../../../../design-system/theme';

/**
 * DesignSystemView — the visual language this app is built from, and how it's
 * wired. Covers what design tokens are, each token category (color, type,
 * spacing, radius, elevation), how those tokens become Tailwind utilities, and
 * how light/dark theming works.
 *
 * The goal of a design system is ONE source of truth: a colour or spacing value
 * is defined once (a token) and referenced everywhere, so the whole UI can be
 * restyled or re-themed by changing the token, not by hunting through markup.
 *
 * This screen itself is built entirely from the tokens it describes — every
 * swatch below reads a live CSS variable, so it updates the instant you flip
 * light/dark.
 */
export default function DesignSystemView() {
    return (
        <div className="flex flex-col gap-md">
            <WhyTokensSection />
            <ColorSection />
            <TypographySection />
            <SpacingSection />
            <RadiusElevationSection />
            <TailwindBridgeSection />
            <ThemingSection />
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 1. Why tokens                                                              */
/* -------------------------------------------------------------------------- */

function WhyTokensSection() {
    return (
        <SectionWrapper title="What a design system is, and why">
            <ContentGroupWrapper title="One source of truth for every visual value">
                <TextBlock>
                    {`A design system is a small, named set of decisions — the brand colour,
the body font, how far apart things sit, how round corners are — captured as
variables called tokens. Instead of hard-coding #4f46e5 and 16px in a hundred
components, you write var(--color-primary) and p-md. The win is consistency (no
two "primary blues" drifting apart) and leverage: change one token and the whole
UI follows. This app stores tokens as CSS custom properties in
src/ui/design-system/tokens.css.`}
                </TextBlock>
                <CodeBlock
                    language="css"
                    caption={
                        <span className="text-caption text-on-surface-variant">
                            tokens.css — light values are the default under :root.
                        </span>
                    }
                    code={`:root {
  --color-primary: #4f46e5;     /* indigo-600 — the one accent */
  --color-surface: #ffffff;     /* page background */
  --color-on-surface: #0f172a;  /* text that sits on a surface */
  --space-md: 16px;             /* the spacing unit */
  --radius-md: 8px;
  --shadow-button-card: 0 1px 2px rgba(15,23,42,.06), 0 1px 3px rgba(15,23,42,.1);
}`}
                />
                <TextBlock>
                    {`The contract: every background token (surface, primary, error, ...) has a
matching "on" token for the text/foreground that sits on it — surface ↔
on-surface, primary ↔ on-primary. You never pick a text colour independently;
you always read it off the surface it sits on. That pairing is what keeps
contrast correct automatically when you re-theme.`}
                </TextBlock>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 2. Color tokens                                                            */
/* -------------------------------------------------------------------------- */

const COLOR_SWATCHES = [
    { name: 'primary', token: '--color-primary', on: '--color-on-primary' },
    {
        name: 'primary-container',
        token: '--color-primary-container',
        on: '--color-on-primary',
    },
    { name: 'secondary', token: '--color-secondary', on: '--color-on-secondary' },
    {
        name: 'surface',
        token: '--color-surface',
        on: '--color-on-surface',
        border: true,
    },
    {
        name: 'surface-tint',
        token: '--color-surface-tint',
        on: '--color-on-surface',
        border: true,
    },
    {
        name: 'surface-variant',
        token: '--color-surface-variant',
        on: '--color-on-surface',
        border: true,
    },
    { name: 'error', token: '--color-error', on: '--color-on-error' },
    { name: 'info', token: '--color-info', on: '#ffffff' },
    { name: 'warning', token: '--color-warning', on: '#ffffff' },
    { name: 'critical', token: '--color-critical', on: '#ffffff' },
];

function ColorSection() {
    return (
        <SectionWrapper title="Color tokens">
            <ContentGroupWrapper title="The palette — neutral base, one indigo accent">
                <TextBlock>
                    {`A neutral slate base carries 95% of the UI; a single indigo accent
(--color-primary) carries emphasis — links, focus rings, active marks, the
accent bar on every section title. Secondary (teal) and the severity colours
(info / warning / critical) exist for specific jobs (links, and the
ShowError / FailureSnackbar components). Used sparingly, the accent stays
meaningful.`}
                </TextBlock>
            </ContentGroupWrapper>
            <Example label="Live swatches — each reads the token at runtime">
                <p className="text-body-sm text-on-surface-variant">
                    Flip the theme (last section, or the header toggle) and every
                    swatch re-resolves from its CSS variable. The label text uses
                    that swatch's <code className="font-mono">on-*</code> token.
                </p>
                <div
                    className="grid grid-cols-2 gap-sm sm:grid-cols-3 lg:grid-cols-5"
                    data-testid="color-swatches"
                >
                    {COLOR_SWATCHES.map((c) => (
                        <div
                            key={c.name}
                            className="flex h-[72px] flex-col justify-between rounded-md p-xs"
                            style={{
                                backgroundColor: `var(${c.token})`,
                                color: c.on.startsWith('--')
                                    ? `var(${c.on})`
                                    : c.on,
                                border: c.border
                                    ? '1px solid var(--color-outline)'
                                    : 'none',
                            }}
                        >
                            <span className="font-mono text-caption">
                                {c.name}
                            </span>
                            <span className="text-overline opacity-80">
                                var({c.token})
                            </span>
                        </div>
                    ))}
                </div>
            </Example>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 3. Typography                                                              */
/* -------------------------------------------------------------------------- */

const TYPE_SCALE = [
    { cls: 'text-display-md', name: 'display-md', px: '60px' },
    { cls: 'text-headline', name: 'headline', px: '34px' },
    { cls: 'text-title-lg', name: 'title-lg', px: '24px' },
    { cls: 'text-title', name: 'title', px: '20px' },
    { cls: 'text-body', name: 'body', px: '16px' },
    { cls: 'text-body-sm', name: 'body-sm', px: '14px' },
    { cls: 'text-caption', name: 'caption', px: '12px' },
    { cls: 'text-overline', name: 'overline', px: '10px' },
];

function TypographySection() {
    return (
        <SectionWrapper title="Typography scale">
            <ContentGroupWrapper title="Three font families, a fixed size ladder">
                <TextBlock>
                    {`Fonts: --font-display (Montserrat, headings), --font-body (Inter,
everything), --font-mono (JetBrains Mono, code). Sizes are a fixed ladder —
display → headline → title → body → caption → overline — registered as Tailwind
utilities so you write text-body / text-caption, never an arbitrary pixel size.
A ladder (not free values) is what keeps type hierarchy legible across a long
page: every level is unambiguously bigger or smaller than its neighbours.`}
                </TextBlock>
                <CodeBlock
                    language="css"
                    code={`--font-display: 'Montserrat', system-ui, sans-serif;
--font-body: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace;

--text-headline: 34px;
--text-title: 20px;
--text-body: 16px;
--text-caption: 12px;
--text-overline: 10px;`}
                />
            </ContentGroupWrapper>
            <Example label="Type specimen — each line is its token utility">
                <div className="flex flex-col gap-xs" data-testid="type-scale">
                    {TYPE_SCALE.map((t) => (
                        <div
                            key={t.name}
                            className="flex items-baseline gap-md"
                        >
                            <span
                                className={`${t.cls} font-display text-on-surface`}
                            >
                                The quick brown fox
                            </span>
                            <span className="ml-auto shrink-0 font-mono text-overline text-on-surface-variant">
                                {t.name} · {t.px}
                            </span>
                        </div>
                    ))}
                </div>
            </Example>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 4. Spacing                                                                 */
/* -------------------------------------------------------------------------- */

const SPACING = [
    { name: 'xxs', px: 2 },
    { name: 'xs', px: 4 },
    { name: 'sm', px: 8 },
    { name: 'md', px: 16 },
    { name: 'lg', px: 32 },
    { name: 'xl', px: 64 },
    { name: 'xxl', px: 128 },
];

function SpacingSection() {
    return (
        <SectionWrapper title="Spacing scale">
            <ContentGroupWrapper title="A doubling scale, not free pixel values">
                <TextBlock>
                    {`Spacing follows a base-2-ish doubling scale: 2 / 4 / 8 / 16 / 32 / 64 /
128. It drives every p-*, m-*, gap-*, and the spacing utilities the rest of this
app uses (p-md = 16px, gap-sm = 8px). A fixed scale makes rhythm consistent —
things that should feel "a little apart" are always sm, "clearly apart" always
md, never a designer's eyeballed 13px. When a JS value is needed (inline styles,
dynamic gaps), the same numbers live in sizes.ts as DSSizes.md.`}
                </TextBlock>
            </ContentGroupWrapper>
            <Example label="The scale, drawn to size">
                <div className="flex flex-col gap-xs" data-testid="spacing-scale">
                    {SPACING.map((s) => (
                        <div key={s.name} className="flex items-center gap-md">
                            <div
                                className="h-[16px] rounded-pill"
                                style={{
                                    width: `${s.px}px`,
                                    backgroundColor: 'var(--color-primary)',
                                }}
                            />
                            <span className="font-mono text-caption text-on-surface-variant">
                                {s.name} = {s.px}px
                            </span>
                        </div>
                    ))}
                </div>
            </Example>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 5. Radius + elevation                                                      */
/* -------------------------------------------------------------------------- */

const RADII = [
    { name: 'sm', cls: 'rounded-sm', px: '4px' },
    { name: 'md', cls: 'rounded-md', px: '8px' },
    { name: 'lg', cls: 'rounded-lg', px: '16px' },
    { name: 'pill', cls: 'rounded-pill', px: '9999px' },
];

const SHADOWS = [
    { name: 'button-card', cls: 'shadow-button-card' },
    { name: 'button-card-hover', cls: 'shadow-button-card-hover' },
    { name: 'drawer', cls: 'shadow-drawer' },
    { name: 'modal', cls: 'shadow-modal' },
];

function RadiusElevationSection() {
    return (
        <SectionWrapper title="Radius & elevation">
            <ContentGroupWrapper title="Corner roundness and shadow depth">
                <TextBlock>
                    {`Radius (--radius-sm/md/lg/pill) and elevation (--shadow-button-card,
-drawer, -modal) are the two remaining token families. Elevation doubles as a
hierarchy signal: a flat surface, a card (button-card), a raised/hovered card,
then drawers and modals get progressively heavier shadows. Used sparingly (this
screen's cards, drawers, dialogs), shadow communicates "this floats above" —
overuse flattens the meaning.`}
                </TextBlock>
            </ContentGroupWrapper>
            <Example label="Radius scale">
                <div
                    className="flex flex-wrap items-center gap-md"
                    data-testid="radius-scale"
                >
                    {RADII.map((r) => (
                        <div key={r.name} className="flex flex-col items-center gap-xs">
                            <div
                                className={`${r.cls} h-[48px] w-[48px] border border-outline`}
                                style={{
                                    backgroundColor: 'var(--color-surface-variant)',
                                }}
                            />
                            <span className="font-mono text-overline text-on-surface-variant">
                                {r.name} · {r.px}
                            </span>
                        </div>
                    ))}
                </div>
            </Example>
            <Example label="Elevation scale">
                <div
                    className="flex flex-wrap items-center gap-lg"
                    data-testid="shadow-scale"
                >
                    {SHADOWS.map((s) => (
                        <div key={s.name} className="flex flex-col items-center gap-xs">
                            <div
                                className={`${s.cls} flex h-[56px] w-[100px] items-center justify-center rounded-md border border-outline bg-surface`}
                            >
                                <span className="font-mono text-overline text-on-surface-variant">
                                    {s.name}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </Example>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 6. The Tailwind bridge (@theme inline)                                     */
/* -------------------------------------------------------------------------- */

function TailwindBridgeSection() {
    return (
        <SectionWrapper title="Tokens → Tailwind utilities (@theme inline)">
            <ContentGroupWrapper title="The contract between tokens.css and Tailwind">
                <TextBlock>
                    {`A CSS variable alone is just a value. To use it as a first-class Tailwind
utility — bg-primary, text-on-surface, p-md, shadow-button-card — it must be
registered in the @theme inline block in index.css. Each entry maps a Tailwind
namespace (--color-*, --text-*, --radius-*, --shadow-*, --spacing-*) to the
runtime token. The "inline" keyword is what makes utilities emit var(--token)
references, so they respond to the [data-theme] override live instead of baking
in the light value at build time.`}
                </TextBlock>
                <CodeBlock
                    language="css"
                    caption={
                        <span className="text-caption text-on-surface-variant">
                            index.css — register a token here to unlock its utility.
                        </span>
                    }
                    code={`@theme inline {
  --color-primary: var(--color-primary);    /* → bg-primary, text-primary */
  --color-on-surface: var(--color-on-surface);
  --text-body: var(--text-body);            /* → text-body */
  --spacing-md: var(--space-md);            /* → p-md, m-md, gap-md */
  --shadow-button-card: var(--shadow-button-card); /* → shadow-button-card */
}`}
                />
                <TextBlock>
                    {`Audit rule: if you ever see a bare [var(--x)] in JSX, a token is missing
from @theme inline. The fix is to register it and write the clean utility —
font-mono / text-caption — never the arbitrary escape. Zero [var(-- should
appear in markup; the arbitrary syntax is only for genuine one-off values with
no token behind them.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`/* ❌ smell — a token is missing from @theme inline */
<code className="font-[var(--font-mono)] text-[var(--text-caption)]" />

/* ✅ first-class — register once, use everywhere */
<code className="font-mono text-caption" />`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 7. Light / dark theming                                                    */
/* -------------------------------------------------------------------------- */

function ThemingSection() {
    const { mode, toggle } = useTheme();
    return (
        <SectionWrapper title="Light / dark theming">
            <ContentGroupWrapper title="A second value-set, switched by one attribute">
                <TextBlock>
                    {`Dark mode is just the same tokens redefined under [data-theme='dark'].
The ThemeProvider holds the chosen mode in React state, persists it to
localStorage, honours prefers-color-scheme on first visit, and writes
data-theme onto <html>. Because every utility emits var(--token), the ENTIRE app
re-themes the moment that attribute flips — no component opt-in, no re-render of
styles. That's the payoff for the "always use tokens, never hard-code" rule.`}
                </TextBlock>
                <CodeBlock
                    language="css"
                    code={`[data-theme='dark'] {
  --color-primary: #818cf8;        /* brighter indigo on dark */
  --color-surface: #0b1120;        /* near-black slate */
  --color-on-surface: #e2e8f0;     /* light text on dark */
  --shadow-button-card: 0 1px 2px rgba(0,0,0,.4);
}`}
                />
                <CodeBlock
                    language="tsx"
                    code={`// ThemeProvider writes data-theme on <html> and persists to localStorage.
export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(getInitialMode); // stored | prefers-color-scheme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    window.localStorage.setItem('rdg-theme', mode);
  }, [mode]);
  // ...
}

// any component reads/toggles it via the hook:
const { mode, toggle } = useTheme();`}
                />
            </ContentGroupWrapper>
            <Example label="Flip the whole app's theme">
                <p className="text-body-sm text-on-surface-variant">
                    This button calls <code className="font-mono">useTheme().toggle()</code>{' '}
                    — the same one in the header. Watch every section above
                    (swatches, type, shadows) re-resolve in place.
                </p>
                <button
                    type="button"
                    onClick={toggle}
                    className="rounded-md border border-outline px-md py-xs text-body text-on-surface hover:bg-surface-variant"
                    data-testid="theme-toggle-demo"
                >
                    {mode === 'dark' ? '☀︎ switch to light' : '☾ switch to dark'}
                </button>
                <p className="font-mono text-caption text-on-surface-variant">
                    current mode: {mode}
                </p>
            </Example>
        </SectionWrapper>
    );
}
