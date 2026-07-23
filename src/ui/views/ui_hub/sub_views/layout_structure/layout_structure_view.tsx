import { useState } from 'react';
import { SectionWrapper } from '../../../../components/section-wrapper';
import { ContentGroupWrapper } from '../../../../components/content-group-wrapper';
import { TextBlock } from '../../../../components/text-block';
import { CodeBlock } from '../../../../components/code-block';
import { Example } from '../../../../components/example';

/**
 * LayoutStructureView — how a page/screen is structured in a React web app, from
 * component tree down to the CSS layout mechanics. Covers the idiomatic React
 * Router layout pattern this app uses, semantic HTML, the box model, and the
 * two layout engines (Flexbox + Grid) with live toggles.
 *
 * Mirrors the Flutter "Layout and structure" screen but rebuilt for the web: in
 * Flutter you compose Row/Column widgets; on the web you compose HTML elements
 * and lay them out with CSS flex/grid. The shared design-system primitives are
 * used throughout; live demos are local functions.
 */
export default function LayoutStructureView() {
    return (
        <div className="flex flex-col gap-md">
            <ComponentTreeSection />
            <AppLayoutPatternSection />
            <SemanticHtmlSection />
            <BoxModelSection />
            <FlexboxSection />
            <GridSection />
            <LayoutPrimitivesSection />
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 1. From component tree to DOM                                              */
/* -------------------------------------------------------------------------- */

function ComponentTreeSection() {
    return (
        <SectionWrapper title="Pages are component trees">
            <ContentGroupWrapper title="Compose, don't concatenate">
                <TextBlock>
                    {`A React page is a tree of nested components, each returning markup.
The outermost component usually renders a layout shell; children render into the
gaps. React turns that tree into real DOM nodes the browser lays out. This app's
shared RootLayout is the shell; each route's view is the content that fills it.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`// The whole app is one tree:
<RootLayout>          {/* shell: header + scrolling area */}
  <HomeView>          {/* a route's content */}
    <Links>
      <LinkCard />
      <LinkCard />
    </Links>
  </HomeView>
</RootLayout>`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 2. The app's layout pattern (RootLayout + Outlet)                          */
/* -------------------------------------------------------------------------- */

function AppLayoutPatternSection() {
    return (
        <SectionWrapper title="Shared layout via <Outlet/>">
            <ContentGroupWrapper title="Declare chrome once">
                <TextBlock>
                    {`React Router's idiomatic layout pattern: a parent route renders the
shared shell and an <Outlet/> where the matched child renders. App chrome (the
header, theme toggle, max-width container) lives in one file — RootLayout —
instead of being repeated on every screen. This replaces the per-screen Flutter
PageScaffold/Scaffold+AppBar pattern: on the web the browser already gives you
back/forward and scrolling, so you declare chrome once.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`// RootLayout — declared once, wraps every route
function RootLayout() {
  return (
    <div className="flex min-h-full flex-col">
      <header>{/* logo, page title, theme toggle */}</header>
      <main className="mx-auto w-full max-w-[960px] flex-1">
        <Outlet />   {/* the matched child route renders here */}
      </main>
    </div>
  );
}

// Router config — the layout is the parent, screens are its children:
const routes = [
  { element: <RootLayout />, children: [
    { path: '/', element: <HomeView /> },
    { path: '/react-fundamentals', element: <ReactFundamentalsView /> },
    // ...
  ] },
];`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 3. Semantic HTML                                                           */
/* -------------------------------------------------------------------------- */

function SemanticHtmlSection() {
    return (
        <SectionWrapper title="Semantic HTML">
            <ContentGroupWrapper title="Use elements for what they mean">
                <TextBlock>
                    {`Reach for the element that describes the content's role, not a bare
<div> for everything. Semantic tags improve accessibility (screen readers,
landmark navigation), SEO, and readability for free. className is for visual
styling on top of the meaning.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`// Prefer meaning over <div> soup:
<div className="card">          {/* ❌ tells the browser nothing */}
<section className="card">     {/* ✅ a thematic grouping */}
  <header><h2>Title</h2></header>
  <p>Body…</p>
  <footer>Footnote</footer>
</section>

<nav>       {/* navigation links */}
<main>      {/* the page's primary content (one per page) */}
<aside>     {/* tangentially related (sidebar) */}
<article>   {/* self-contained (a post, a card) */}
<ul>/<li>   {/* a list of items */}
<button>    {/* a clickable action (not <div onClick>) */}`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 4. The box model                                                           */
/* -------------------------------------------------------------------------- */

function BoxModelSection() {
    return (
        <SectionWrapper title="The box model">
            <ContentGroupWrapper title="Every element is a box">
                <TextBlock>
                    {`A block element is a rectangle of four concentric layers: content →
padding → border → margin. Padding is space inside the border (part of the
element's background); margin is space outside (pushes neighbours). width/height
by default set the content box only — box-sizing: border-box (set globally in
this app) makes them include padding+border, which is far more intuitive.`}
                </TextBlock>
                <CodeBlock
                    language="css"
                    code={`/* global reset in this app — widths include padding & border: */
* { box-sizing: border-box; }

.card {
  width: 320px;     /* with border-box: the WHOLE box is 320px */
  padding: 16px;    /* space inside, fills with the card's bg */
  border: 1px solid #ccc;
  margin: 8px;      /* space outside, transparent, can collapse */
}`}
                />
            </ContentGroupWrapper>
            <ContentGroupWrapper title="Live: padding vs margin">
                <TextBlock>
                    {`The inner tile has padding (its own background grows); the outer box
has margin (a transparent gap to its container's edge). Toggle to see the
difference.`}
                </TextBlock>
                <Example label="Padding vs margin">
                    <BoxModelDemo />
                </Example>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

function BoxModelDemo() {
    const [show, setShow] = useState(true);
    return (
        <div className="flex flex-col gap-sm">
            <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="self-start rounded-md border border-outline px-md py-xs text-body-sm text-on-surface hover:bg-surface-variant"
            >
                {show ? 'Hide' : 'Show'} padding & margin
            </button>
            <div
                className="rounded-md"
                style={
                    show
                        ? {
                              backgroundColor: 'var(--color-warning)',
                              padding: '16px',
                          }
                        : undefined
                }
                data-testid="margin-layer"
            >
                <div
                    className="rounded-md"
                    style={{
                        backgroundColor: 'var(--color-secondary)',
                        padding: show ? '16px' : 0,
                    }}
                >
                    <div
                        className="rounded-sm text-center text-on-surface"
                        style={{
                            backgroundColor: 'var(--color-surface)',
                            padding: '12px',
                        }}
                    >
                        content
                    </div>
                </div>
            </div>
            <p className="text-caption text-on-surface-variant">
                orange = margin (outside) · teal = padding (inside) · white =
                content
            </p>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 5. Flexbox                                                                 */
/* -------------------------------------------------------------------------- */

function FlexboxSection() {
    return (
        <SectionWrapper title="Flexbox — one-dimensional layout">
            <ContentGroupWrapper title="Lay items in a row or column">
                <TextBlock>
                    {`Flexbox arranges items along a single axis (a row or a column). Set
display: flex on the container and control direction, spacing, and alignment
from there. It's the workhorse for nav bars, button rows, centering — the
overwhelming majority of layout in this app. gap gives space between items
without margin-collapse headaches.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`<div className="flex flex-row gap-sm items-center justify-between">
  <span>A</span>
  <span>B</span>
  <span>C</span>
</div>

/* Tailwind utility → CSS */
flex            /* display: flex */
flex-col        /* flex-direction: column */
gap-sm          /* gap: var(--space-sm) */
items-center    /* align-items: center (cross axis) */
justify-center  /* justify-content: center (main axis) */
flex-1          /* flex: 1 — grow to fill remaining space */`}
                />
            </ContentGroupWrapper>
            <ContentGroupWrapper title="Live: direction & alignment">
                <TextBlock>
                    {`Flip the main axis and watch the row become a column. justify-* moves
items along the main axis; the live tiles are the same three boxes, only the
container's flex properties change.`}
                </TextBlock>
                <Example label="Direction & alignment">
                    <FlexDemo />
                </Example>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

function FlexDemo() {
    const [col, setCol] = useState(false);
    return (
        <div className="flex flex-col gap-sm">
            <div className="flex flex-wrap gap-xs">
                <button
                    type="button"
                    onClick={() => setCol(false)}
                    className="rounded-md border border-outline px-sm py-xs text-body-sm text-on-surface hover:bg-surface-variant"
                    data-testid="flex-row-btn"
                >
                    flex-row
                </button>
                <button
                    type="button"
                    onClick={() => setCol(true)}
                    className="rounded-md border border-outline px-sm py-xs text-body-sm text-on-surface hover:bg-surface-variant"
                    data-testid="flex-col-btn"
                >
                    flex-col
                </button>
            </div>
            <div
                className={`gap-sm rounded-md bg-surface-tint p-md ${col ? 'flex-col' : 'flex-row'}`}
                data-testid="flex-container"
            >
                {['A', 'B', 'C'].map((t) => (
                    <span
                        key={t}
                        className="rounded-md px-md py-sm text-center text-on-primary"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                        {t}
                    </span>
                ))}
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 6. CSS Grid                                                                */
/* -------------------------------------------------------------------------- */

function GridSection() {
    return (
        <SectionWrapper title="CSS Grid — two-dimensional layout">
            <ContentGroupWrapper title="Rows and columns together">
                <TextBlock>
                    {`Grid is for true two-dimensional layouts — when you need to control
both rows and columns at once (dashboards, galleries, the home nav). Define
tracks with grid-template-columns; the responsive auto-fit pattern below is how
the home card grid reflows from 1 → 2 → 3 columns with no media queries.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`<nav className="grid gap-sm"
  style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
  <Card /><Card /><Card />
</nav>

/* Responsive without media queries — cards reflow to fit: */
grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));`}
                />
            </ContentGroupWrapper>
            <ContentGroupWrapper title="Live: column count">
                <TextBlock>
                    {`Same six tiles, different grid-template-columns. This is how the
home navigation grid is built.`}
                </TextBlock>
                <Example label="Column count">
                    <GridDemo />
                </Example>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

function GridDemo() {
    const cols = [1, 2, 3] as const;
    const [col, setCol] = useState<(typeof cols)[number]>(3);
    return (
        <div className="flex flex-col gap-sm">
            <div className="flex flex-wrap gap-xs">
                {cols.map((c) => (
                    <button
                        key={c}
                        type="button"
                        onClick={() => setCol(c)}
                        className="rounded-md border border-outline px-sm py-xs text-body-sm text-on-surface hover:bg-surface-variant"
                        data-selected={col === c}
                        style={
                            col === c
                                ? { borderColor: 'var(--color-primary)' }
                                : undefined
                        }
                    >
                        {c} col{c > 1 ? 's' : ''}
                    </button>
                ))}
            </div>
            <div
                className="grid gap-sm rounded-md bg-surface-tint p-md"
                style={{ gridTemplateColumns: `repeat(${col}, 1fr)` }}
                data-testid="grid-container"
            >
                {Array.from({ length: 6 }, (_, i) => (
                    <span
                        key={i}
                        className="rounded-md px-md py-sm text-center text-body-sm text-on-surface-variant"
                        style={{ backgroundColor: 'var(--color-surface)' }}
                    >
                        {i + 1}
                    </span>
                ))}
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 7. This app's layout primitives                                            */
/* -------------------------------------------------------------------------- */

function LayoutPrimitivesSection() {
    return (
        <SectionWrapper title="Layout primitives in this app">
            <ContentGroupWrapper title="Compose with the shared wrappers">
                <TextBlock>
                    {`Rather than re-styling boxes per screen, this app funnels layout into
a few reusable primitives. They encode the consistent spacing, surface tint, and
heading scale used everywhere — so a new screen is mostly composition, not CSS.
If a box is used in one file, make it a local function; if it's used across
files, it belongs here in ui/components.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`// The building blocks (all in src/ui/components):
<RootLayout />          {/* app shell: header + <Outlet/> content area */}
<SectionWrapper title>  {/* a titled, surface-tinted block */}
  <ContentGroupWrapper title> {/* a labelled sub-grouping */}
    <TextBlock>…</TextBlock>   {/* a paragraph */}
    <CodeBlock code="…" />     {/* a copyable code listing */}
  </ContentGroupWrapper>
</SectionWrapper>`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}
