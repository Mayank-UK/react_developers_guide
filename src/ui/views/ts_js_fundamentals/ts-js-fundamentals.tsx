import { useState } from 'react';
import { SectionWrapper } from '../../components/section-wrapper';
import { ContentGroupWrapper } from '../../components/content-group-wrapper';
import { TextBlock } from '../../components/text-block';
import { CodeBlock } from '../../components/code-block';
import { Example } from '../../components/example';

/**
 * TsJsFundamentalsView — one consolidated screen for the JavaScript + TypeScript
 * language fundamentals the rest of this app leans on. The Flutter guide split
 * these across ~20 dart_fundamentals sub-screens; for JS/TS a single screen with
 * tight, well-labelled sections reads better (and matches the request). Where
 * something is TypeScript-only it's tagged (TS); everything else is plain JS.
 *
 * Uses the shared design-system primitives; the live demos are local functions
 * (only used here → local function rule).
 */
export default function TsJsFundamentalsView() {
    return (
        <div className="flex flex-col gap-md">
            <IntroSection />
            <VariablesSection />
            <PrimitivesSection />
            <TypesAnnotationsSection />
            <ObjectsArraysSection />
            <FunctionsSection />
            <ControlFlowSection />
            <OperatorsSection />
            <ClassesInterfacesSection />
            <GenericsSection />
            <AsyncSection />
            <ModulesSection />
            <ExceptionsSection />
            <UtilityTypesSection />
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 1. Intro                                                                   */
/* -------------------------------------------------------------------------- */

function IntroSection() {
    return (
        <SectionWrapper title="JavaScript vs TypeScript">
            <ContentGroupWrapper title="JavaScript runs in the browser (and on servers)">
                <TextBlock>
                    {`JavaScript is a dynamically-typed, garbage-collected language with
prototypal inheritance and a single-threaded, event-loop-based concurrency
model. This app's runtime is the browser; the same language also runs on servers
via Node.js. There's one number type (IEEE-754 double), no separate int/float,
and ` +
                        '`typeof x`' +
                        ` tells you a value's category at runtime.`}
                </TextBlock>
            </ContentGroupWrapper>

            <ContentGroupWrapper title="TypeScript is JavaScript + static types (TS)">
                <TextBlock>
                    {`TypeScript is a strict superset of JavaScript: any valid JS is valid
TS. It adds a type system that is erased at compile time — the output is plain
JS, so types cost nothing at runtime. They catch whole classes of bugs at edit
time (typos in property names, wrong argument shapes, null dereferences) and
power the editor autocomplete you see throughout this codebase. Every .ts/.tsx
file in this app is TypeScript.`}
                </TextBlock>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 2. Variables & declarations                                                */
/* -------------------------------------------------------------------------- */

function VariablesSection() {
    return (
        <SectionWrapper title="Variables: let, const, var">
            <ContentGroupWrapper title="Prefer const, use let, avoid var">
                <TextBlock>
                    {`const declares a binding that can't be reassigned (though objects it
holds can still mutate). let declares a reassignable, block-scoped variable.
var is the old, function-scoped, hoisted form — avoid it in modern code; it's
the source of confusing "hoisting" bugs.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`const pi = 3.14159;      // can't reassign the binding
let count = 0;          // can reassign
count = count + 1;

const user = { name: 'Sam' };
user.name = 'Jo';       // OK — the object mutates, the binding is unchanged
// user = { name: 'Jo' }; // ERROR — can't reassign a const

var legacy = 'avoid';   // function-scoped + hoisted — don't use`}
                />
            </ContentGroupWrapper>

            <ContentGroupWrapper title="Hoisting & the temporal dead zone">
                <TextBlock>
                    {`let/const are hoisted but stay uninitialized until their line runs
(the "temporal dead zone") — using them early throws. var hoists and initializes
to undefined, so it silently returns undefined instead. This is the main reason
var is avoided.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`console.log(later); // ReferenceError (TDZ)
let later = 1;

console.log(old);      // undefined (var hoist)
var old = 2;`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 3. Primitive types                                                         */
/* -------------------------------------------------------------------------- */

function PrimitivesSection() {
    return (
        <SectionWrapper title="Primitive types">
            <ContentGroupWrapper title="Seven primitives">
                <TextBlock>
                    {`Everything that isn't an object is a primitive: string, number,
boolean, null, undefined, bigint, and symbol. They're immutable and compared by
value. Objects (including arrays and functions) are compared by reference.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`const str: string = 'hi';
const n: number = 42;          // one number type — ints & floats unified
const big: bigint = 9007199254740993n;
const flag: boolean = true;
const nothing: null = null;    // intentional absence
const missing: undefined = undefined; // declared but no value yet

// typeof is a runtime operator (values, not TS types):
typeof 'hi';   // 'string'
typeof 42;     // 'number'
typeof null;   // 'object'  <- famous JS quirk, not 'null'
typeof undefined; // 'undefined'`}
                />
            </ContentGroupWrapper>

            <ContentGroupWrapper title="== vs === (always use ===)">
                <TextBlock>
                    {`== does loose comparison with type coercion (surprising results);
=== compares without coercion. Standard practice — and the rule this codebase's
linter enforces — is to always use === and !==.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`0 == '';     // true  (coercion — avoid)
0 === '';    // false
null == undefined;  // true
null === undefined; // false`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 4. Type annotations & inference (TS)                                       */
/* -------------------------------------------------------------------------- */

function TypesAnnotationsSection() {
    return (
        <SectionWrapper title="Type annotations & inference (TS)">
            <ContentGroupWrapper title="Annotate boundaries, let inference do the rest">
                <TextBlock>
                    {`TypeScript infers the type of most expressions automatically, so you
don't annotate everything. Annotate where it adds value: function parameters
and return types (public contract), and variables initialized from ambiguous
values. Elsewhere, trust the inferred type.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`let age = 30;            // inferred as number — no annotation needed
let score: number;        // declared without a value: annotate

// Parameters always need types; the return type is inferred but often declared
// for documentation and to catch accidental changes:
function add(a: number, b: number): number {
  return a + b;
}`}
                />
            </ContentGroupWrapper>

            <ContentGroupWrapper title="Union types & literals">
                <TextBlock>
                    {`A value can be one of several types with a union (|). Literal types
narrow a value to specific strings/numbers — the basis of discriminated unions
and exhaustive checks.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`type Status = 'idle' | 'loading' | 'success' | 'error';
type ID = string | number;

function label(s: Status): string {
  // switch on a union and TS knows each case's type:
  switch (s) {
    case 'idle': return 'Not started';
    case 'loading': return 'Working…';
    case 'success': return 'Done';
    case 'error': return 'Failed';
  }
}`}
                />
            </ContentGroupWrapper>

            <ContentGroupWrapper title="Live: types catch mistakes at edit time">
                <TextBlock>
                    {`This running counter is plain JS at runtime, but it was authored
against TS types. The buttons only ever feed numbers into setCount, so the total
never goes NaN — exactly the class of bug static types prevent.`}
                </TextBlock>
                <Example label="Types track a value at edit time">
                    <TypesPlaygroundDemo />
                </Example>
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

function TypesPlaygroundDemo() {
    const [n, setN] = useState<number>(0);
    const doubled: number = n * 2;
    return (
        <div className="flex flex-wrap items-center gap-sm">
            <button
                type="button"
                onClick={() => setN((v) => v + 1)}
                className="rounded-md px-md py-xs text-on-primary shadow-button-card hover:shadow-button-card-hover"
                style={{ backgroundColor: 'var(--color-primary)' }}
            >
                n = {n}
            </button>
            <span className="text-[var(--text-body-sm)] text-on-surface-variant">
                doubled ={' '}
                <span className="text-on-surface" data-testid="doubled-value">
                    {doubled}
                </span>
            </span>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* 5. Objects, arrays, tuples                                                 */
/* -------------------------------------------------------------------------- */

function ObjectsArraysSection() {
    return (
        <SectionWrapper title="Objects, arrays & tuples">
            <ContentGroupWrapper title="Object shapes">
                <TextBlock>
                    {`An object's shape is its set of keys+value types. In TS you describe
it with a type alias or interface; optional properties get a ?.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`type User = {
  id: number;
  name: string;
  role?: string;        // optional — may be absent
  readonly createdAt: string; // can't be reassigned
};

const u: User = { id: 1, name: 'Sam', createdAt: '2024-01-01' };`}
                />
            </ContentGroupWrapper>

            <ContentGroupWrapper title="Arrays & tuples">
                <TextBlock>
                    {`Arrays are typed with Type[] (or Array<Type>). A tuple is a
fixed-length array where each position has a known type — handy for pairs and
function returns.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`const nums: number[] = [1, 2, 3];
const users: User[] = [];

// tuple — fixed length, positional types:
const pair: [string, number] = ['Sam', 30];
const name = pair[0]; // string
const age = pair[1];  // number`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 6. Functions                                                               */
/* -------------------------------------------------------------------------- */

function FunctionsSection() {
    return (
        <SectionWrapper title="Functions">
            <ContentGroupWrapper title="Three ways to define one">
                <TextBlock>
                    {`Function declarations, function expressions, and arrow functions.
Declarations are hoisted (callable before their line); arrows are not but are
concise and don't bind their own this — which matters in class methods.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`// 1. declaration — hoisted
function add(a: number, b: number): number { return a + b; }

// 2. expression — not hoisted
const add2 = function (a: number, b: number): number { return a + b; };

// 3. arrow — concise, lexical this
const add3 = (a: number, b: number): number => a + b;`}
                />
            </ContentGroupWrapper>

            <ContentGroupWrapper title="Default, optional & rest params">
                <TextBlock>
                    {`Optional params (with ?) must come after required ones. Defaults are
written inline with =. Rest params (...) collect trailing arguments into an
array.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`function greet(name: string, greeting = 'Hello', ...tags: string[]) {
  return \`\${greeting}, \${name}!\` + (tags.length ? ' [' + tags.join(',') + ']' : '');
}

greet('Sam');                     // 'Hello, Sam!'
greet('Sam', 'Hi');               // 'Hi, Sam!'
greet('Sam', 'Hi', 'vip', 'new'); // 'Hi, Sam! [vip,new]'`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 7. Control flow                                                            */
/* -------------------------------------------------------------------------- */

function ControlFlowSection() {
    return (
        <SectionWrapper title="Control flow">
            <ContentGroupWrapper title="if / else if / else & switch">
                <TextBlock>
                    {`Standard branching. switch is most useful over unions (TS narrows
the value per case). Remember break — without it execution falls through.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`function classify(n: number): string {
  if (n < 0) return 'negative';
  else if (n === 0) return 'zero';
  else return 'positive';
}

switch (status) {
  case 'loading':
    showSpinner();
    break;            // without break, falls into the next case
  case 'error':
    showError();
    break;
  default:
    render();
}`}
                />
            </ContentGroupWrapper>

            <ContentGroupWrapper title="Loops & iteration">
                <TextBlock>
                    {`for...of iterates values (arrays, strings); for...in iterates keys
(avoid for arrays — order/prototype noise). Array methods (map / filter /
reduce / forEach) are the idiomatic, functional way to transform collections
and are used heavily in React.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`const nums = [1, 2, 3];

for (const n of nums) console.log(n);          // 1, 2, 3 (values)

const doubled = nums.map((n) => n * 2);         // [2, 4, 6]
const evens = nums.filter((n) => n % 2 === 0);  // [2]
const sum = nums.reduce((acc, n) => acc + n, 0); // 6`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 8. Operators                                                               */
/* -------------------------------------------------------------------------- */

function OperatorsSection() {
    return (
        <SectionWrapper title="Operators">
            <ContentGroupWrapper title="Spread & destructuring">
                <TextBlock>
                    {`... spreads iterables (arrays) into elements or collects them back
(the rest pattern). Destructuring pulls values out of arrays/objects by position
or name — the standard way to read props and function args in React.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`// spread (copy/merge — shallow!)
const a = [1, 2];
const b = [...a, 3];              // [1, 2, 3]
const merged = { ...user, name: 'Jo' }; // override one field

// destructuring
const [first, ...rest] = [1, 2, 3]; // first=1, rest=[2,3]
const { name, role = 'guest' } = user; // rename/default

// function param destructuring — everywhere in components:
function Card({ title, subtitle }: { title: string; subtitle?: string }) {}`}
                />
            </ContentGroupWrapper>

            <ContentGroupWrapper title="Nullish coalescing & optional chaining">
                <TextBlock>
                    {`?? returns the right side only for null/undefined (use it, not ||
when 0/'' are valid). ?. short-circuits on null/undefined instead of throwing —
essential for deep property access.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`const name = input ?? 'anonymous';   // keeps 0 and '' — || would drop them
const city = user?.address?.city;       // undefined if any link is missing
const len = user?.name?.length ?? 0;    // safe default at the end`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 9. Classes & interfaces                                                    */
/* -------------------------------------------------------------------------- */

function ClassesInterfacesSection() {
    return (
        <SectionWrapper title="Classes & interfaces (TS)">
            <ContentGroupWrapper title="Classes: fields, constructors, modifiers">
                <TextBlock>
                    {`JS has class syntax with a prototypal backbone. TS adds access
modifiers (public / private / protected) and parameter properties — constructor
params that auto-declare and assign fields. Note: React favors functions +
hooks over classes for components; classes here are for domain/model objects.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`class Account {
  // parameter properties — shorthand for declaring + assigning:
  constructor(
    public readonly id: number,
    public owner: string,
    private balance: number,
  ) {}

  deposit(amount: number): void {
    this.balance += amount;
  }

  getBalance(): number {
    return this.balance; // private — only reachable from inside
  }
}`}
                />
            </ContentGroupWrapper>

            <ContentGroupWrapper title="interface vs type">
                <TextBlock>
                    {`Both describe an object shape and are largely interchangeable.
Convention: use interface for extensible object contracts (it can be merged /
implemented), type for unions and computed/mapped shapes. The domain models in
this app use plain type aliases and interfaces for DTOs.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`interface Animal { name: string; speak(): void; }
class Dog implements Animal {
  name: string;
  constructor(name: string) { this.name = name; }
  speak() { return 'woof'; }
}

type JSON = string | number | boolean | null | JSON[] | { [k: string]: JSON };`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 10. Generics                                                               */
/* -------------------------------------------------------------------------- */

function GenericsSection() {
    return (
        <SectionWrapper title="Generics (TS)">
            <ContentGroupWrapper title="Type-level parameters">
                <TextBlock>
                    {`Generics let you write code that preserves types instead of erasing
them to any. A function <T>(x: T) means "of whatever type the caller passes" —
the same definition works for number, string, etc. while keeping full type
safety. This app's Result<T, E> and repository interfaces use them heavily.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`// T is captured from the argument, so the return type tracks it:
function first<T>(items: T[]): T | undefined {
  return items[0];
}

const n = first([1, 2, 3]);      // number | undefined
const s = first(['a', 'b']);     // string | undefined

// constrained generic — T must have a 'length' property:
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 11. Async                                                                  */
/* -------------------------------------------------------------------------- */

function AsyncSection() {
    return (
        <SectionWrapper title="Async: Promises & async/await">
            <ContentGroupWrapper title="The event loop never blocks">
                <TextBlock>
                    {`JS is single-threaded with an event loop, so long work (network,
timers) is async. A Promise is a value-available-later object with .then /
.catch / .finally. async/await is syntactic sugar over promises that lets you
write async code that reads top-to-bottom.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`// promise style
fetch('/api/posts')
  .then((res) => res.json())
  .then((posts) => console.log(posts))
  .catch((err) => console.error(err));

// async/await — equivalent, easier to read
async function loadPosts(): Promise<void> {
  try {
    const res = await fetch('/api/posts');  // pauses until settled
    const posts = await res.json();
    console.log(posts);
  } catch (err) {
    console.error(err);                       // rejected promise lands here
  }
}`}
                />
            </ContentGroupWrapper>

            <ContentGroupWrapper title="Parallel work with Promise.all">
                <TextBlock>
                    {`await is sequential — one at a time. Run independent async tasks in
parallel with Promise.all and await the bundle. The API-handling screen uses
this for remote + cache lookups.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`// sequential — slower than needed:
const a = await getUser();
const b = await getPosts();

// parallel — both kick off, resolve together:
const [user, posts] = await Promise.all([getUser(), getPosts()]);`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 12. Modules                                                                */
/* -------------------------------------------------------------------------- */

function ModulesSection() {
    return (
        <SectionWrapper title="Modules">
            <ContentGroupWrapper title="ES modules — import / export">
                <TextBlock>
                    {`Each file is a module with its own scope. Export with export (or
export default for one-per-file), import with import. This app uses ESM
throughout — it's the standard for browser + bundler (Vite) ecosystems and the
only style modern tooling expects.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`// math.ts — named exports
export const add = (a: number, b: number) => a + b;
export const mul = (a: number, b: number) => a * b;
export type Vec = { x: number; y: number };

// default export — one per module
export default function square(n: number) { return n * n; }

// consumer
import square, { add, mul, type Vec } from './math';
import * as math from './math'; // namespace import`}
                    caption={`type-only imports (import type) are erased at build — zero runtime cost.`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 13. Exceptions                                                             */
/* -------------------------------------------------------------------------- */

function ExceptionsSection() {
    return (
        <SectionWrapper title="Exceptions">
            <ContentGroupWrapper title="throw / try / catch">
                <TextBlock>
                    {`JS lets you throw anything, but throwing Error subclasses is the
convention. try/catch/finally handles failures; async rejections land in catch
when awaited. This app goes further — it maps thrown errors into typed Failure
objects with severity (see the Exception handling screen).`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`function divide(a: number, b: number): number {
  if (b === 0) throw new Error('divide by zero');
  return a / b;
}

try {
  divide(1, 0);
} catch (err) {
  // err is unknown by default in TS — narrow it:
  const msg = err instanceof Error ? err.message : String(err);
  console.error(msg);
} finally {
  // always runs — cleanup (close file, release lock, etc.)
}`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}

/* -------------------------------------------------------------------------- */
/* 14. Utility types (TS)                                                     */
/* -------------------------------------------------------------------------- */

function UtilityTypesSection() {
    return (
        <SectionWrapper title="Utility & built-in types (TS)">
            <ContentGroupWrapper title="Derive new types from existing ones">
                <TextBlock>
                    {`TS ships helpers that transform types so you don't hand-write
near-duplicates. The data layer in this app uses Pick / Omit to derive a DTO
from a domain model, and Partial for update shapes.`}
                </TextBlock>
                <CodeBlock
                    language="ts"
                    code={`type User = { id: number; name: string; email: string; role: string };

type UserSummary = Pick<User, 'id' | 'name'>;          // { id, name }
type CreateUser = Omit<User, 'id'>;                    // everything but id
type UserPatch = Partial<User>;                         // all fields optional
type GuestUser = Readonly<User>;                        // all fields readonly

// common built-ins you'll see:
type T = any;        // avoid — opts out of type-checking
type U = unknown;    // safe "I don't know yet" — must narrow before use
type V = void;       // function returns nothing
type N = never;      // unreachable / impossible`}
                />
            </ContentGroupWrapper>
        </SectionWrapper>
    );
}
