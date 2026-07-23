import { SectionWrapper } from '../../../../components/section-wrapper';
import { ContentGroupWrapper } from '../../../../components/content-group-wrapper';
import { TextBlock } from '../../../../components/text-block';
import { CodeBlock } from '../../../../components/code-block';
import { Example } from '../../../../components/example';

/**
 * BootstrapView — a tour of Bootstrap, the classic CSS framework, as an
 * alternative styling approach. This app styles with Tailwind (see the Tailwind
 * screen), so Bootstrap is shown for comparison: how the same UI is built with a
 * component-and-grid framework vs utility classes. Covers Bootstrap's grid,
 * components, and utilities so the trade-offs are concrete.
 */
export default function BootstrapView() {
    return (
        <div className="flex flex-col gap-md">
            <WhatIsBootstrapSection />
            <GridSection />
            <ComponentsSection />
            <UtilitiesSection />
            <ComparisonSection />
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 1. What is Bootstrap                                                       */
/* -------------------------------------------------------------------------- */

function WhatIsBootstrapSection() {
    return (
        <SectionWrapper title="What is Bootstrap?">
            <ContentGroupWrapper title="A batteries-included CSS framework">
                <TextBlock>
                    {`Bootstrap is a pre-built CSS (and JS) framework: it ships dozens of
ready-made components (buttons, cards, navbars, modals) and a 12-column grid, all
with a default look. You opt into its look by adding class names. The trade-off:
you get a polished UI fast, but it's opinionated — to stray from Bootstrap's look
you end up fighting its CSS. This app uses Tailwind instead (utility-first, no
default look), but Bootstrap is still extremely common in React projects.`}
                </TextBlock>
                <CodeBlock
                    language="bash"
                    code={`# Install (CSS only — the React port is "reactstrap"):
npm install bootstrap

// Then import the stylesheet once (e.g. main.tsx):
import 'bootstrap/dist/css/bootstrap.min.css';`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 2. The 12-column grid                                                      */
/* -------------------------------------------------------------------------- */

function GridSection() {
    return (
        <SectionWrapper title="The 12-column grid">
            <ContentGroupWrapper title="container > row > columns">
                <TextBlock>
                    {`Bootstrap's layout is a 12-column grid. Wrap content in a .container
(centered, max-width), put a .row inside, then .col-* columns that add up to 12.
Responsive breakpoints are baked into the class names: col-md-6 means "6 columns
wide from the md breakpoint up".`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`<div className="container">
  <div className="row">
    {/* full width on mobile, half on md+, third on lg+ */}
    <div className="col-12 col-md-6 col-lg-4">A</div>
    <div className="col-12 col-md-6 col-lg-4">B</div>
    <div className="col-12 col-md-6 col-lg-4">C</div>
  </div>
</div>`}
                />
            </ContentGroupWrapper>
            <ContentGroupWrapper title="Live: 12 columns visualized">
                <TextBlock>
                    {`Three common splits over a 12-track grid. The colored bars are the
column spans; the gaps mirror Bootstrap's row gutter.`}
                </TextBlock>
                <Example label="12 columns visualized">
                    <div className="flex flex-col gap-xs">
                        {[
                            { cells: 6, label: 'col-6 + col-6' },
                            { cells: 4, label: 'col-4 + col-4 + col-4' },
                            { cells: 8, label: 'col-8 + col-4' },
                        ].map((row) => (
                            <div
                                key={row.label}
                                className="flex flex-col gap-xxs"
                            >
                                <span className="text-caption text-on-surface-variant">
                                    {row.label}
                                </span>
                                <div className="grid grid-cols-12 gap-xs">
                                    {Array.from(
                                        { length: 12 / row.cells },
                                        (_, i) => i,
                                    ).map((i) => (
                                        <div
                                            key={i}
                                            className="h-[28px] rounded-sm text-center text-overline leading-[28px] text-on-primary"
                                            style={{
                                                backgroundColor:
                                                    'var(--color-primary)',
                                                gridColumn: `span ${row.cells}`,
                                            }}
                                        >
                                            {row.cells}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </Example>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 3. Components                                                              */
/* -------------------------------------------------------------------------- */

function ComponentsSection() {
    return (
        <SectionWrapper title="Ready-made components">
            <ContentGroupWrapper title="Class-name components">
                <TextBlock>
                    {`Bootstrap ships styled components as class names: .btn, .card,
.navbar, .alert, .badge, etc., each with variants (.btn-primary, .btn-outline-…).
In React you'd either use these classes directly or reach for reactstrap, which
wraps them in components. Either way the look is Bootstrap's — fast to ship, hard
to customize away from.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`<!-- Bootstrap class-name components -->
<button className="btn btn-primary">Save</button>
<span className="badge text-bg-secondary">New</span>

<div className="card" style={{ width: '18rem' }}>
  <div className="card-body">
    <h5 className="card-title">Title</h5>
    <p className="card-text">Some text.</p>
    <a href="#" className="btn btn-primary">Go</a>
  </div>
</div>`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 4. Utilities                                                               */
/* -------------------------------------------------------------------------- */

function UtilitiesSection() {
    return (
        <SectionWrapper title="Bootstrap utilities">
            <ContentGroupWrapper title="Small helper classes">
                <TextBlock>
                    {`Bootstrap also has utility classes for spacing, text, flex, and
display — d-flex, mt-3, text-center, gap-2. These overlap heavily with Tailwind's
utilities but are fewer and less composable. This overlap is why many teams
eventually migrate from Bootstrap to Tailwind: same idea, more granular.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`<div className="d-flex gap-3 align-items-center">
  <span className="mt-3 mb-2 p-2 bg-primary text-white rounded">
    spaced & styled with utilities
  </span>
</div>`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 5. Bootstrap vs Tailwind (what this app chose)                             */
/* -------------------------------------------------------------------------- */

function ComparisonSection() {
    return (
        <SectionWrapper title="Bootstrap vs Tailwind — what this app chose">
            <ContentGroupWrapper title="Component framework vs utility framework">
                <TextBlock>
                    {`Bootstrap gives you pre-designed components with a default look.
Tailwind gives you low-level utilities and no default look, so you compose any
design without fighting preset opinions. Because this app has its own design
system (brand colors, tokens, light/dark), Tailwind is the better fit — the
tokens map straight into Tailwind utilities via @theme inline (see the Tailwind
and Design system screens). Bootstrap would be the better pick for an internal
tool where "looks like Bootstrap" is good enough.`}
                </TextBlock>
                <CodeBlock
                    language="tsx"
                    code={`// Same button, two philosophies:

// Bootstrap — pick a pre-designed component class
<button className="btn btn-primary">Save</button>

// Tailwind — compose the look from utilities (this app's approach)
<button className="rounded-md px-md py-xs text-on-primary shadow-button-card">
  Save
</button>`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}
