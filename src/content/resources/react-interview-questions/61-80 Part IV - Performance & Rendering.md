## Performance & Rendering

*Total questions: 20*


**61. What is reconciliation, and how does React's diffing algorithm work?**

Reconciliation is the process React uses to figure out what changed between two renders. When a component renders, React produces a tree of React elements (the virtual representation). On the next render it produces a new tree, then diffs the new tree against the previous one to compute the minimal set of DOM mutations needed. This lets you write declarative "describe the whole UI" code while React handles imperative DOM updates efficiently.

general tree-diff is O(n³), which is far too slow for UIs. React uses a heuristic O(n) algorithm built on two assumptions: (1) two elements of different type produce different trees, and (2) developers can hint at stable identity across renders using key . Because of assumption (1), if a <div> becomes a <span> , React tears down the entire subtree and rebuilds it rather than trying to match children.

When the type is the same, React keeps the underlying DOM node and only updates changed attributes, then recurses into children. For children of the same type it walks both lists in order; without keys, position is the identity, so inserting an item at the front can cause every subsequent item to be treated as "changed." Keys fix this by giving elements stable identities independent of position.

```jsx
function App({ swap }) {
  // Different type => full remount of the subtree
  return swap
    ? <section><Child /></section>
    : <div><Child /></div>;
}
```

**Gotcha:** "Virtual DOM" is not inherently faster than direct DOM manipulation. Its value is the programming model: you describe UI as a function of state, and React batches and minimizes real DOM writes. Hand-tuned imperative code can be faster; React trades a little speed for a lot of maintainability.

**62. How do keys affect reconciliation and re-renders?**

A key tells React which element in a list corresponds to which element in the previous render, independent of order. During reconciliation of a list, React builds a map from key to previous element and matches by key rather than by index. This means React can move, insert, or remove list items surgically instead of mutating every node from the change point onward.

Using the array index as a key is the classic anti-pattern. If the list is reordered, filtered, or has items inserted at the front, index keys make React think item content changed in place, so component state (uncontrolled inputs, focus, animations) gets associated with the wrong item. It also defeats the optimization: React re-renders and re-commits elements that only moved.

Changing a component's key is also a deliberate tool: because a different key means a different identity, React unmounts the old instance and mounts a fresh one, resetting all internal state. This is the idiomatic way to "reset" a component (for example, a form) when a prop like a record ID changes.

```jsx
// Reset internal state by changing key
<ProfileForm key={userId} user={user} />
```

**Gotcha:** Keys only need to be unique among siblings, not globally. And keys are a hint to React, never passed to the component as a prop; if you need the value inside, pass it separately (e.g. id={userId} ).

**63. What actually causes a component to re-render?**

There are exactly three things that cause a function component to re-render: (1) its own state changes via a useState / useReducer setter, (2) a subscribed context value it consumes changes, or (3) its parent re-renders. That third one surprises people: by default, when a component re-renders, React re-renders all of its children, regardless of whether their props changed.

Notably, "props changed" is not on that list. Props changing don't independently trigger a re-render; a child re-renders because its parent re-rendered (which is what produced the new props). This distinction matters because it explains why React.memo works: memo lets a child opt out of the "parent re-rendered" rule by comparing props and skipping the render when they're shallow-equal.

Re-rendering is not the same as updating the DOM. A re-render runs your component function and reconciles; if the output is equivalent, React commits zero DOM changes. Re-renders are usually cheap, but they add up in large trees, and they run all your hooks and inline calculations each time, which is where wasted work accumulates.

```jsx
function Parent() {
```

  const [n, setN] = useState(0);

```jsx
  // Child re-renders on every click, even though
  // its props never change — because Parent did.
```

  return <><button onClick={() => setN(n + 1)} /><Child /></>;

```jsx
}
```

**Gotcha:** Calling a setter with a value equal to the current state (via Object.is ) causes React to bail out — but it may still render the component once before bailing. Don't rely on setState-with-same-value as a performance guarantee.

**64. What does React.memo do, and what are its limits?**

React.memo wraps a component so that React skips re-rendering it when its parent re-renders, as long as its props are shallow-equal to the previous props. It memoizes the rendered output keyed on props. This breaks the default "parent renders → child renders" chain, which is valuable when a cheap parent re-renders often but an expensive child's props rarely change.

Its comparison is shallow by default: it compares each prop with Object.is . This is exactly why passing a fresh object, array, or function literal as a prop silently defeats memo — a new reference each render is never equal to the last. You can pass a custom comparator as the second argument, but deep comparison is often more expensive than the render you're trying to avoid.

memo also does not stop re-renders caused by the component's own state or by a consumed context. It only guards the "parent re-rendered" path. Wrapping everything in memo is a common mistake: the comparison itself costs time and memory, and most renders are cheap enough that the bookkeeping is net-negative.

```jsx
const Row = React.memo(function Row({ label, onSelect }) {
  return <li onClick={onSelect}>{label}</li>;
});
// Only helps if `onSelect` is a stable reference
// (e.g. wrapped in useCallback).
```

**Gotcha:** children is a prop too. If you pass JSX children, they're a new element object every render, so a memoized wrapper around {children} won't skip renders unless the parent also memoizes those children.

**65. When do useMemo and useCallback actually help performance?**

useMemo caches the result of a computation between renders, recomputing only when its dependencies change. useCallback caches a function reference between renders. In fact useCallback(fn, deps) is just useMemo(() => fn, deps) . Both exist to preserve referential stability or to avoid repeating expensive work.

They help in two concrete situations. First, when a value is an expensive computation (sorting a large list, parsing) and you want to skip redoing it on unrelated re-renders — that's useMemo for CPU. Second, when a value or function is passed as a prop to a React.memo child or used in another hook's dependency array, and you need a stable reference so the downstream optimization actually fires — that's referential stability, served by either hook.

If neither condition holds, they don't help and add overhead: React still stores the deps, compares them each render, and keeps the cached value in memory. Memoizing a trivial calculation or a callback passed to a non-memoized child is pure cost. Measure before reaching for them.

```jsx
const sorted = useMemo(
  () => items.slice().sort(compare),
  [items]
); // recompute only when items changes
const handleAdd = useCallback(
  (id) => setItems((xs) => [...xs, id]),
  []
); // stable ref for a memoized child
```

**Gotcha:** useMemo is a performance hint, not a semantic guarantee. React may discard the cache (e.g. for memory) and recompute. Never put logic with side effects or correctnesscritical identity inside it — use useRef or state for values that must persist.

**66. Why does passing inline objects/functions as props hurt memoization?**

Every time a component renders, any object literal, array literal, or arrow function written in its JSX is created anew. Even if the contents are identical, the reference is different. Since React.memo and hook dependency arrays compare with Object.is , a fresh reference always looks "changed," so the memoization you thought you had never engages.

Concretely, style={{ margin: 8 }} and onClick={() => doThing()} produce brand-new values on every render. A memoized child receiving them re-renders every time its parent does. Worse, if that reference is in a useEffect dependency array, the effect re-runs each render, potentially causing loops or redundant network calls.

The fixes: hoist truly static objects out of the component (module scope), wrap computed objects in useMemo , and wrap callbacks in useCallback . But apply this surgically — only where a downstream memoized boundary or dependency array actually benefits. Blanket-wrapping every inline value trades one small cost for another.

```jsx
// New object & function every render:
```

<Child style={{ pad: 4 }} onTap={() => go()} />

```jsx
// Stable references:
```

const style = useMemo(() => ({ pad: 4 }), []);

```jsx
const onTap = useCallback(() => go(), []);
<Child style={style} onTap={onTap} />
```

**Gotcha:** If the child is not wrapped in React.memo and the value isn't a dependency anywhere, stabilizing the reference does nothing for performance — the child re-renders because its parent did, regardless of prop identity.

**67. How do you diagnose and fix unnecessary re-renders?**

Start by confirming there's a real problem: unnecessary re-renders only matter when they're frequent and expensive. Use the React DevTools Profiler (or the "Highlight updates when components render" option) to see which components render and why. The Profiler tells you, per commit, which components rendered and attributes the render to props, state, hooks, or parent.

Common causes and fixes: a high-frequency state update (like mouse position or input value) living too high in the tree — push that state down into a smaller subtree so fewer components re-render. Unstable props defeating React.memo — stabilize with useMemo / useCallback . A context value that's a fresh object each render — memoize the provider's value. An expensive child under a chatty parent — wrap the child in React.memo , or lift the child out via the children-as-prop pattern so it isn't recreated.

The children-as-prop trick is underused: if you pass an expensive component as children to a component that manages the frequently-changing state, the expensive child is created by the outer component and won't re-render when the inner state changes.

```jsx
function Toggle({ children }) {
```

  const [open, setOpen] = useState(false);

```jsx
  // children is created by the parent, so it
  // does NOT re-render when `open` changes.
  return <div>{open && children}</div>;
}
```

**Gotcha:** Don't optimize blind. Wrapping everything in memo/useMemo can make an app slower and harder to read. Profile first, fix the hot path, then re-measure to confirm the change actually helped.

**68. How do React.lazy and Suspense enable code splitting?**

Code splitting breaks your bundle into chunks that load on demand instead of shipping everything up front. React.lazy takes a function that returns a dynamic import() and produces a component that isn't loaded until it first renders. The bundler (Webpack, Vite, etc.) sees the dynamic import and automatically emits a separate chunk for that module.

Because the code loads asynchronously, React needs something to show while it's fetching. That's what Suspense provides: any lazy component must render beneath a <Suspense fallback={...}> boundary, which displays the fallback until the chunk resolves. One boundary can cover many lazy components; the fallback shows until all suspended children are ready.

Good places to split: route-level components (each page becomes a chunk), heavy modals or editors, and rarely-used feature panels. The trade-off is an extra network round trip when the component first appears, so avoid over-splitting tiny components where the request overhead exceeds the savings. Preloading (calling the import on hover/intent) can hide that latency.

```jsx
const Editor = React.lazy(() => import('./Editor'));
function Page() {
  return (
    <Suspense fallback={<Spinner />}>
      <Editor />
    </Suspense>
  );
}
```

**Gotcha:** React.lazy only supports default exports. For a named export, re-map it: import('./m').then(m => ({ default: m.Named })) . Also wrap lazy boundaries in an error boundary — a failed chunk fetch (e.g. after a deploy) throws.

**69. What is list virtualization (windowing) and when do you need it?**

Virtualization renders only the list items currently visible in the viewport (plus a small buffer), instead of mounting all of them. If you have 10,000 rows but only 20 fit on screen, you mount ~25 DOM nodes and swap their contents as the user scrolls. This keeps DOM size, memory, and render/commit time bounded regardless of dataset length.

It works by measuring the scroll container, computing which items fall in the visible window from scroll offset and item height, and absolutely positioning those items inside a spacer element sized to the full list height (so the scrollbar behaves correctly). Libraries like react-window , react-virtuoso , and TanStack Virtual handle the math, including variable-height items and dynamic measurement.

Reach for it when a list is long enough that mounting everything causes jank — typically hundreds to thousands of rows, especially with rich item content. For short lists it's unnecessary complexity. The main costs are added complexity, trickier accessibility (screen readers and in-page find won't see off-screen rows), and challenges with variable heights.

```jsx
import { FixedSizeList } from 'react-window';
```

<FixedSizeList height={400} itemCount={items.length}   itemSize={35} width={300}>

```jsx
  {({ index, style }) => (
    <div style={style}>{items[index].name}</div>
  )}
</FixedSizeList>
```

**Gotcha:** The per-row style prop from the library carries absolute positioning — you must spread it onto your row's outermost element, or rows will stack at the top. Also, Ctrl/Cmd+F won't find un-rendered rows; provide a search feature if discoverability matters.

**70. How do you use the React DevTools Profiler?**

The Profiler tab in React DevTools records a session of commits and shows, for each commit, which components rendered and how long they took. You click record, interact with the app, stop, and then inspect the flamegraph or ranked chart. It's the primary evidence-based tool for finding performance problems instead of guessing.

The flamegraph shows the component tree for a commit, with bar width proportional to render time; greyed-out components didn't render that commit. The ranked view lists components sorted by render duration. Selecting a component shows "why did this render?" (props changed, state changed, hooks changed, or parent rendered) — enable that in the Profiler settings to trace root causes quickly.

You can also step through commits with the timeline to see how many commits an interaction caused (often revealing redundant renders). For programmatic measurement, the <Profiler> component takes an onRender callback reporting actual vs. base render duration, useful for logging in environments where DevTools isn't available.

```jsx
<Profiler id="List" onRender={(id, phase, actual) => {
  console.log(id, phase, actual);
}}>
  <List />
</Profiler>
```

**Gotcha:** Profile a production-like build; the development build is intentionally slower and includes warnings/checks. Use React's profiling build so measurements reflect what users experience, not dev-mode overhead.

**71. What is automatic batching in React 18?**

Batching means React groups multiple state updates into a single re-render for performance. If you call three setters, React doesn't render three times — it collects them and renders once with the final state. Before React 18, batching only happened inside React event handlers. Updates in promises, setTimeout , native event handlers, or after await were not batched and each triggered its own render.

React 18 introduced automatic batching: with createRoot , state updates are batched everywhere, regardless of where they originate — timeouts, promises, async functions, native events. This means fewer renders and more consistent behavior. It's enabled automatically when you opt into the concurrent root.

Batching is based on the JavaScript execution context, not on which component the state belongs to; multiple updates across different components in the same tick still batch into one render pass. If you genuinely need to force a synchronous, flushed update between two setters (rare — e.g. to measure the DOM in between), flushSync from react-dom opts out for that update.

```jsx
function handleClick() {
  // React 18: these batch into ONE render,
  // even inside this async callback.
  fetchData().then(() => {
```

    setLoading(false);

```jsx
    setData(result);
  });
}
```

**Gotcha:** State updates are asynchronous within a batch: reading state right after calling a setter gives the old value. Use the functional updater form setN(n => n + 1) when the next value depends on the previous one, or successive updates in a batch will clobber each other.

**72. What does concurrent rendering mean in React 18?**

Concurrent rendering is a new capability where React can prepare (render) a UI update in the background without blocking the main thread, and can pause, resume, or abandon that work. Before this, rendering was synchronous and uninterruptible: once React started rendering a tree, it ran to completion, potentially blocking user input for tens of milliseconds on large updates.

Concurrency lets React treat some updates as low priority and interruptible. If a more urgent update (like a keystroke) arrives while React is rendering a big, non-urgent update, it can pause the big one, handle the urgent one, then resume. Crucially, halffinished concurrent renders are never shown to the user — the results are committed atomically only when complete.

You don't get concurrency just by upgrading; it's opt-in per update through features built on it: useTransition , useDeferredValue , and streaming SSR with Suspense. What you do get for free by switching to createRoot is the foundation (and automatic batching). The mental shift is that a render is no longer a guaranteed atomic, synchronous event.

```jsx
import { createRoot } from 'react-dom/client';
// Opts into the concurrent-capable root
const root = createRoot(document.getElementById('root'));
root.render(<App />);
```

**Gotcha:** Because a component may render and then have that render thrown away, render functions must be pure — no side effects during render. Strict Mode double-invokes renders in development specifically to surface impurity that concurrency would otherwise expose in production.

**73. How does useTransition keep the UI responsive?**

useTransition lets you mark a state update as a non-urgent transition, so React can keep the app responsive to more urgent updates (like typing) while the expensive update renders in the background. It returns [isPending, startTransition] ; updates wrapped in startTransition are rendered at low priority and can be interrupted.

The classic case is a search box that filters a huge list. The input value should update instantly (urgent), but re-rendering the giant filtered list is expensive. By keeping the input state as a normal update and wrapping the list's derived state in a transition, keystrokes stay snappy; the list "catches up" without freezing the field. isPending lets you show a subtle loading indicator during the transition.

Transitions don't make the heavy render faster — they make it non-blocking and interruptible, so the urgent work isn't starved. If the user types again before the list finishes, React abandons the in-progress list render and starts fresh with the newest input. For a simpler read-only version, useDeferredValue defers a value without needing to wrap the setter.

```jsx
const [isPending, startTransition] = useTransition();
function onChange(e) {
  setQuery(e.target.value);           // urgent
  startTransition(() => {
    setResults(filter(e.target.value)); // deferred
  });
}
```

**Gotcha:** Only wrap state updates in startTransition , not the input value itself — if you defer the controlled input's own state, the field feels laggy. Also, transitions can't wrap updates driven by controlled text inputs' immediate value; keep those urgent.

**74. How do you optimize Context to avoid excessive re-renders?**

Every component that consumes a context re-renders whenever the context's value changes (by Object.is ). The most common mistake is passing a fresh object literal as the provider value: value={{ user, setUser }} creates a new object every render, so all consumers re-render even when nothing meaningful changed. Wrap the value in useMemo so it only changes when its parts do.

Second, split contexts by change frequency. If you cram rarely-changing data (theme) and frequently-changing data (mouse position) into one context, every mouse move rerenders theme consumers. Separate them into distinct providers so a component only subscribes to what it uses. A common pattern is splitting state and dispatch into two contexts, since dispatch is stable and never needs to trigger re-renders.

Third, memoize consumers with React.memo so that a consumer's children don't rerender unless their own props change. For very high-frequency updates where context granularity isn't enough, an external store ( useSyncExternalStore , Zustand, Redux with selectors) lets components subscribe to slices and re-render only on the specific slice they read.

```jsx
const value = useMemo(
  () => ({ user, setUser }),
  [user]
); // setUser is stable, so only `user` matters
<UserContext.Provider value={value}>{children}</UserContext.Provider>
```

**Gotcha:** Context has no built-in selector: consumers can't subscribe to just one field of the value. Any change to the value object re-renders every consumer. If you need field-level subscriptions, split contexts or use an external store — don't reach for a giant single context.

**75. When does memoization make things worse?**

Memoization is not free. useMemo , useCallback , and React.memo all add work: React must store the previous dependencies/props and compare them on every render, and it must retain the cached values in memory. When the wrapped computation or render is cheap, this bookkeeping costs more than it saves. A memoized a + b is strictly slower than just computing a + b .

It also makes code harder to read and maintain. Dependency arrays become a maintenance burden and a bug source: a missing dependency yields stale values, an extra one defeats the memo. Over-memoization spreads these arrays everywhere, and a single unstable dependency upstream can silently invalidate a whole chain of "optimized" values, so you pay the cost without the benefit.

The right approach is to treat memoization as a targeted fix for a measured problem, not a default. First reduce work structurally: move state down, lift expensive children out via children props, split components. Only memoize the genuinely expensive computations and the props crossing a React.memo boundary. The React Compiler (React 19+) aims to automate much of this, reducing manual memoization further.

```jsx
// Net-negative: comparison > the work saved
const total = useMemo(() => price * qty, [price, qty]);
// Fine as plain code:
const total = price * qty;
```

**Gotcha:** Memoizing a value passed to a child that is not wrapped in React.memo accomplishes nothing — the child re-renders with its parent regardless. Both sides of the boundary must cooperate for referential stability to pay off.

**76. What is hydration, and what causes hydration mismatches?**

Hydration is the process of attaching React to server-rendered HTML. With serverside rendering, the browser receives fully-formed markup so users see content fast. React then "hydrates" that static HTML: it renders the component tree, walks the existing DOM, and attaches event listeners and internal state without recreating the nodes. The result is an interactive app built on top of the pre-rendered markup.

For hydration to work, React expects the tree it renders on the client to match the server-rendered HTML exactly. A hydration mismatch happens when they differ — React logs a warning and, in React 18, falls back to client-rendering the mismatched subtree, which is slow and can cause a visible flash. Common causes: using Date.now() , Math.random() , or window / localStorage during render; browseronly branches; locale/timezone differences; or invalid HTML nesting the browser autocorrects.

The fix is to make the initial client render deterministic and identical to the server. For genuinely client-only content, render a stable placeholder first and switch after mount (a useEffect -set flag), or use suppressHydrationMismatch / suppressHydrationWarning sparingly for knowndifferent nodes like timestamps.

const [mounted, setMounted] = useState(false); useEffect(() => setMounted(true), []);

```jsx
// Server & first client render match; client-only
// UI appears after mount to avoid a mismatch.
```

return mounted ? <ClientWidget /> : null;

**Gotcha:** React 18's hydrateRoot replaces ReactDOM.hydrate . Also, selective hydration means Suspense boundaries can hydrate independently and even prioritize the one the user interacts with first — you don't have to wait for the whole page to become interactive.

**77. What is the render props pattern, and when is it still useful?**

A render prop is a technique for sharing logic where a component takes a function as a prop and calls it to determine what to render, passing it the data it manages. Instead of dictating the UI, the component owns some behavior (state, subscriptions, measurements) and delegates rendering to the caller. The name comes from a prop literally called render , though children -as-a-function is the same idea.

Before hooks, render props were the main way to share stateful, non-visual logic between components without inheritance — think mouse trackers, data fetchers, or a downshift-style autocomplete. The consumer gets maximum flexibility over markup while reusing the provider's logic. It solved the same reuse problem HOCs did, but without wrapping the component tree in extra layers.

Hooks have largely replaced render props for pure logic reuse, because a custom hook shares behavior without adding tree nesting or the "wrapper hell" render props can create. But the pattern is still alive where a library needs to hand data to callercontrolled markup — virtualization libraries, some form libraries, and headless UI components frequently use function-as-child.

```jsx
<MouseTracker>
  {({ x, y }) => <p>Cursor at {x}, {y}</p>}
</MouseTracker>
// MouseTracker calls props.children(state)
```

**Gotcha:** An inline render-prop function is recreated every render, so a memoized child inside it can still re-render. And deeply nested render props create a "pyramid of doom." For pure logic sharing, prefer a custom hook.

**78. What are Higher-Order Components, and why did hooks largely replace them?**

A Higher-Order Component is a function that takes a component and returns a new component with added behavior or props — withRouter(Component) , connect(mapState)(Component) . It's a composition pattern for reusing logic: the HOC wraps your component, injects props (data, handlers), and renders it. Before hooks, HOCs and render props were the two primary tools for sharing cross-cutting logic.

HOCs have real downsides. They add wrapper layers to the tree ("wrapper hell"), making the DevTools tree noisy and debugging harder. Injected props are implicit — it's not obvious from the component where router or dispatch came from. Prop name collisions between multiple HOCs are silent bugs. And you must manually forward refs and hoist static properties to preserve behavior.

Hooks solve the same reuse problem more cleanly: a custom hook shares stateful logic without changing the component hierarchy, makes data flow explicit (you see const user = useUser() ), and composes linearly instead of by nesting. That's why most libraries migrated from HOCs to hooks ( connect → useSelector ). HOCs still appear for genuinely component-level concerns like error boundaries or wrapping thirdparty class components.

```jsx
// HOC: implicit injected props, extra wrapper
const Enhanced = withUser(Profile);
// Hook: explicit, no wrapper layer
function Profile() {
  const user = useUser();
  return <span>{user.name}</span>;
}
```

**Gotcha:** Never define an HOC (or call one) inside render — const C = withX(Inner) in the body creates a new component type each render, which remounts the subtree and destroys its state every time.

**79. Why avoid computing derived state inside effects?**

A common anti-pattern is storing values in state and then using a useEffect to keep that state "in sync" with props or other state. For example, keeping fullName in state and updating it in an effect whenever firstName or lastName changes. This is redundant: anything you can compute from existing props/state during render should just be computed during render, not mirrored into state.

The effect approach hurts performance and correctness. It causes an extra render pass: the component renders with stale derived state, the effect runs, it sets state, and the component renders again. It also risks temporary inconsistency (the UI briefly shows the old derived value) and adds a dependency array that's easy to get wrong. React's guidance is explicit: "you don't need an effect to transform data for rendering."

Instead, calculate the value inline during render. If the calculation is genuinely expensive, wrap it in useMemo — still no extra render, still no duplicated source of truth. Reserve effects for synchronizing with external systems (network, subscriptions, DOM), not for reacting to your own state.

```jsx
// Anti-pattern: extra render + duplicated state
const [full, setFull] = useState('');
useEffect(() => setFull(first + ' ' + last), [first, last]);
// Better: derive during render
const full = first + ' ' + last;
```

**Gotcha:** If you need to reset state when a prop changes, don't do it in an effect either — pass a key to remount, or adjust state during render with the "set state while rendering" pattern. Effects are the slowest, buggiest option for both cases.

**80. How do you measure and improve initial load performance?**

Initial load is dominated by how much JavaScript the browser must download, parse, and execute before the app is interactive. Measure it with real metrics: Lighthouse and the web-vitals library for Largest Contentful Paint, Total Blocking Time, and Time to Interactive; and a bundle analyzer ( webpack-bundle-analyzer , rollup-pluginvisualizer ) to see what's actually in each chunk. You can't fix a bundle you haven't measured.

The biggest levers are code splitting and tree-shaking. Split at the route level with React.lazy so users only download the page they land on. Ensure your bundler can tree-shake — that requires ES modules (not CommonJS), "sideEffects": false in package.json where accurate, and importing only what you use ( import { debounce } from 'lodash-es' instead of the whole library). Audit heavy dependencies and replace or defer them.

Other wins: compress with gzip/Brotli, serve modern bundles to modern browsers, defer non-critical work, and consider server-side rendering or static generation so users see content before the JS loads. Preload critical chunks and lazy-load below-thefold or interaction-triggered features. Always re-measure after each change to confirm impact.

```jsx
// Route-level splitting shrinks the initial bundle
const Dashboard = React.lazy(() => import('./Dashboard'));
const Settings  = React.lazy(() => import('./Settings'));
// Import members so unused code is tree-shaken
import { debounce } from 'lodash-es';
```

**Gotcha:** Tree-shaking silently fails on CommonJS packages and on modules with side effects. A single import 'whole-library' or a barrel file re-exporting everything can pull in far more than you use — verify with the analyzer, don't assume.
