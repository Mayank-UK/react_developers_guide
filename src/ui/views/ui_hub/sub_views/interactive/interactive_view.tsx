import { useState } from 'react';
import { SectionWrapper } from '../../../../components/section-wrapper';
import { ContentGroupWrapper } from '../../../../components/content-group-wrapper';
import { TextBlock } from '../../../../components/text-block';
import { CodeBlock } from '../../../../components/code-block';
import { Example } from '../../../../components/example';

/**
 * InteractiveView — interactive CSS behaviours: the states an element can be in
 * (hover, focus, active, disabled) and the transitions/animations between them.
 * This is the CSS layer of interactivity; React-driven interactions (click
 * handlers, state changes) are covered in React fundamentals.
 *
 * Every concept here ships with a visible, working example (not just a code
 * listing) because these behaviours only make sense when you see/feel them.
 */
export default function InteractiveView() {
    return (
        <div className="flex flex-col gap-md">
            <StatesSection />
            <HoverFocusSection />
            <TransitionSection />
            <AnimationSection />
            <AccessibilitySection />
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 1. The interactive states                                                  */
/* -------------------------------------------------------------------------- */

function StatesSection() {
    return (
        <SectionWrapper title="Interactive states">
            <ContentGroupWrapper title="Every interactive element has states">
                <TextBlock>
                    {`A button isn't a static box — it has a default look, a hover look
(mouse over), an active look (pressed), a focus look (keyboard), and a disabled
look (greyed out). CSS pseudo-classes target each one so you style all of them
declaratively. The browser tracks the state; you just say "when hovered, use
this color".`}
                </TextBlock>
                <CodeBlock
                    language="css"
                    code={`.btn { background: var(--color-primary); }
.btn:hover        { background: var(--color-primary-container); }
.btn:active       { transform: scale(0.97); }   /* pressed */
.btn:focus-visible{ outline: 2px solid var(--color-secondary); }
.btn:disabled     { opacity: 0.5; cursor: not-allowed; }`}
                />
            </ContentGroupWrapper>
            <Example label="The five states, side by side">
                <p className="text-body-sm text-on-surface-variant">
                    The first four are live — hover, click-hold, and Tab to
                    focus each one. The fifth is forced into its disabled style.
                </p>
                <div className="flex flex-wrap gap-md">
                    <StateTile label="default" />
                    <StateTile
                        label=":hover"
                        className="hover:bg-primary-container hover:text-on-primary"
                    />
                    <StateTile
                        label=":active"
                        className="active:scale-95 active:bg-secondary-container"
                    />
                    <StateTile
                        label=":focus-visible"
                        className="focus-visible:ring-2 focus-visible:ring-secondary"
                    />
                    <StateTile label=":disabled" disabled />
                </div>
            </Example>
        </SectionWrapper>
    );
}

function StateTile({
    label,
    className = '',
    disabled = false,
}: {
    label: string;
    className?: string;
    disabled?: boolean;
}) {
    return (
        <div className="flex flex-col items-center gap-xs">
            <button
                type="button"
                disabled={disabled}
                className={`h-[44px] w-[110px] rounded-md border border-outline bg-surface px-sm text-body-sm font-medium text-on-surface transition-all duration-150 hover:shadow-button-card ${className}`}
                data-testid={`state-${label}`}
            >
                button
            </button>
            <span className="font-mono text-overline text-on-surface-variant">
                {label}
            </span>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 2. Hover & focus                                                           */
/* -------------------------------------------------------------------------- */

function HoverFocusSection() {
    return (
        <SectionWrapper title="Hover & focus">
            <ContentGroupWrapper title="Hover effects you can feel">
                <TextBlock>
                    {`Hover and focus are the bread and butter of interactive UI. Move your
mouse across these cards — each lifts, shifts colour, and reveals a detail,
purely via :hover and a transition. No JavaScript state involved.`}
                </TextBlock>
                <Example label="Hover this grid of cards">
                    <div className="grid grid-cols-2 gap-sm sm:grid-cols-3">
                        {HOVER_CARDS.map((c) => (
                            <div
                                key={c.title}
                                className="group cursor-default rounded-md border border-outline bg-surface p-md transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-button-card-hover"
                                data-testid="hover-card"
                            >
                                <div className="mb-xs text-title-sm font-semibold text-on-surface transition-colors group-hover:text-primary">
                                    {c.title}
                                </div>
                                <p className="text-caption text-on-surface-variant">
                                    {c.desc}
                                </p>
                                <p className="mt-xs h-[0px] overflow-hidden text-overline text-secondary transition-all duration-200 group-hover:mt-xs group-hover:h-[16px]">
                                    {c.reveal}
                                </p>
                            </div>
                        ))}
                    </div>
                </Example>
            </ContentGroupWrapper>
            <ContentGroupWrapper title="focus-visible vs focus">
                <TextBlock>
                    {`:focus fires whenever the element is focused — including after a click,
which leaves an outline mouse users don't want. :focus-visible fires only for
keyboard focus, giving the outline to the people who need it (keyboard
navigators) and hiding it from mouse users. Always prefer :focus-visible for
outlines.`}
                </TextBlock>
                <CodeBlock
                    language="css"
                    code={`/* Bad — shows outline even after mouse click: */
.btn:focus { outline: 2px solid blue; }

/* Good — outline only for keyboard users: */
.btn:focus-visible { outline: 2px solid var(--color-secondary); }`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

const HOVER_CARDS = [
    {
        title: 'Lift',
        desc: 'translates up on hover',
        reveal: '↑ translateY(-4px)',
    },
    { title: 'Glow', desc: 'gains a shadow', reveal: '✦ shadow + border' },
    { title: 'Reveal', desc: 'unfurls a detail', reveal: '→ height auto' },
];

/* -------------------------------------------------------------------------- */
/* 3. Transitions                                                             */
/* -------------------------------------------------------------------------- */

function TransitionSection() {
    return (
        <SectionWrapper title="Transitions">
            <ContentGroupWrapper title="Smooth change between states">
                <TextBlock>
                    {`A transition tells the browser: when these properties change, animate
over this duration. Without it, hover styles snap instantly; with it, they ease.
Animate only cheap properties (transform, opacity, colors) for smooth 60fps —
animating width/top forces expensive relayout. transition-property duration
timing-function is the full signature.`}
                </TextBlock>
                <CodeBlock
                    language="css"
                    code={`.btn {
  transition: transform 0.15s ease, background-color 0.2s ease;
}
.btn:hover { transform: translateY(-2px); }`}
                />
            </ContentGroupWrapper>
            <Example label="Compare transition durations">
                <p className="text-body-sm text-on-surface-variant">
                    The same hover lift with three durations. Pick one, then
                    toggle hover — feel how the speed changes the feel of the
                    element.
                </p>
                <TransitionDemo />
            </Example>
        </SectionWrapper>
    );
}

const DURATIONS = [
    { label: 'instant', ms: 0 },
    { label: '150ms', ms: 150 },
    { label: '500ms', ms: 500 },
];

function TransitionDemo() {
    const [hovered, setHovered] = useState(false);
    const [duration, setDuration] = useState(150);
    return (
        <div className="flex flex-col gap-sm">
            <div className="flex flex-wrap items-center gap-sm">
                <div className="flex flex-wrap gap-xs">
                    {DURATIONS.map((d) => (
                        <button
                            key={d.label}
                            type="button"
                            onClick={() => {
                                setDuration(d.ms);
                                setHovered(false);
                            }}
                            className="rounded-md border border-outline px-sm py-xs text-body-sm text-on-surface hover:bg-surface-variant"
                            data-selected={duration === d.ms}
                            style={
                                duration === d.ms
                                    ? { borderColor: 'var(--color-primary)' }
                                    : undefined
                            }
                        >
                            {d.label}
                        </button>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={() => setHovered((v) => !v)}
                    className="rounded-md px-md py-xs text-on-primary shadow-button-card hover:shadow-button-card-hover"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                >
                    {hovered ? 'remove hover' : 'apply hover'}
                </button>
            </div>
            <div className="h-[64px]">
                <div
                    className="h-[48px] w-[48px] rounded-md"
                    style={{
                        backgroundColor: 'var(--color-primary)',
                        transform: hovered
                            ? 'translateY(-12px)'
                            : 'translateY(0)',
                        transition: `transform ${duration}ms ease`,
                    }}
                    data-testid="transition-box"
                />
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 4. Animations                                                              */
/* -------------------------------------------------------------------------- */

function AnimationSection() {
    return (
        <SectionWrapper title="Animations">
            <ContentGroupWrapper title="@keyframes for multi-step motion">
                <TextBlock>
                    {`Transitions animate between two states; animations animate along a
multi-step path defined by @keyframes. Useful for entrance effects, spinners,
and loops. Keep them short and purposeful — decorative animation that runs
constantly drains battery and attention. Respect prefers-reduced-motion for
accessibility (last section).`}
                </TextBlock>
                <CodeBlock
                    language="css"
                    code={`@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.card-enter {
  animation: fadeInUp 0.3s ease both;
}`}
                />
            </ContentGroupWrapper>
            <Example label="Play an entrance animation">
                <p className="text-body-sm text-on-surface-variant">
                    Click to replay the fadeInUp animation — the card fades in
                    and lifts into place. Compare it with a perpetual spinner (a
                    looping animation).
                </p>
                <AnimationDemo />
            </Example>
        </SectionWrapper>
    );
}

function AnimationDemo() {
    const [runId, setRunId] = useState(1);
    return (
        <div className="flex flex-col gap-sm">
            <button
                type="button"
                onClick={() => setRunId((n) => n + 1)}
                className="self-start rounded-md border border-outline px-md py-xs text-body-sm text-on-surface hover:bg-surface-variant"
            >
                replay animation
            </button>
            <div className="flex items-center gap-md">
                {/* key change forces React to remount → animation replays */}
                <div
                    key={runId}
                    className="flex h-[56px] w-[120px] items-center justify-center rounded-md text-body-sm font-medium text-on-primary"
                    style={{
                        backgroundColor: 'var(--color-primary)',
                        animation: 'fadeInUp 0.4s ease both',
                    }}
                    data-testid="anim-box"
                >
                    fadeInUp
                </div>
                <div
                    className="h-[40px] w-[40px] rounded-full border-4 border-secondary border-t-transparent"
                    style={{ animation: 'spin 1s linear infinite' }}
                    aria-hidden
                />
                <span className="text-caption text-on-surface-variant">
                    spinner (infinite loop)
                </span>
            </div>
            <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 5. Accessibility                                                           */
/* -------------------------------------------------------------------------- */

function AccessibilitySection() {
    return (
        <SectionWrapper title="Accessibility of interactions">
            <ContentGroupWrapper title="Not everyone uses a mouse">
                <TextBlock>
                    {`Interactive elements must work for keyboard and screen-reader users:
keep :focus-visible outlines (never remove them wholesale), use real <button>
elements (they're keyboard-focusable and announce as buttons), wire forms with
<label>, and respect prefers-reduced-motion to disable animation for users who
set that OS preference. The header toggle and every demo button on this screen
follow these rules.`}
                </TextBlock>
                <CodeBlock
                    language="css"
                    code={`/* Never do this — removes keyboard focus indicator: */
.btn { outline: none; }

/* Do this — keep a visible outline for keyboard focus: */
.btn:focus-visible { outline: 2px solid var(--color-secondary); }

/* Respect users who asked for less motion: */
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}
