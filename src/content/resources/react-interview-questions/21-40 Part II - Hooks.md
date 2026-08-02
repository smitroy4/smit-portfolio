## Hooks

*Total questions: 20*


**21. What are React Hooks and why were they introduced?**

Hooks are functions that let you "hook into" React state and lifecycle features from function components. Before Hooks (React 16.8, 2019), only class components could hold local state or run lifecycle logic like componentDidMount . Hooks were introduced to solve real pain points, not just to make functions fancier, so understanding the WHY matters more than memorizing the list.

The core problem was reusing stateful logic. In classes, patterns like render props and higher-order components let you share behavior, but they forced you to restructure your component tree and produced "wrapper hell". Hooks let you extract stateful logic into plain reusable functions (custom hooks) without changing your component hierarchy at all.

second problem was that related code got split across lifecycle methods: a subscription's setup lived in componentDidMount and its teardown in componentWillUnmount , while unrelated concerns were jammed together. Hooks organize code by what it does, not by which lifecycle it fires in. They also sidestep JavaScript's confusing this binding and let compilers optimize function components more easily.

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**Gotcha:** Hooks did not deprecate classes; class components still work. But new code, and nearly all library guidance, is written for function components with Hooks.

**22. What are the Rules of Hooks, and why do they exist?**

There are two rules: (1) only call Hooks at the top level of a component or another Hook, never inside loops, conditions, or nested functions; and (2) only call Hooks from React function components or custom Hooks, not from regular JavaScript functions. The WHY comes down to how React tracks Hook state internally.

React does not identify a Hook by a name or key you pass. It relies purely on call order. On each render, React walks a linked list of Hook "slots" in the exact sequence the Hooks are called. The first useState is slot 0, the second is slot 1, and so on. If you call a Hook conditionally, the order can shift between renders, so React associates the wrong state with the wrong Hook, corrupting everything downstream.

The second rule ensures Hooks only run where React has an active render context to attach that linked list to. Calling a Hook from an ordinary helper function means there is no component instance to own the state. The ESLint plugin eslint-plugin-reacthooks enforces both rules statically and also checks dependency arrays, so keep it enabled.

```jsx
// WRONG: conditional Hook breaks slot ordering
if (isLoggedIn) {
  const [name, setName] = useState("");
}
// RIGHT: call unconditionally, branch on the value
const [name, setName] = useState("");
```

**Gotcha:** Early return statements are a sneaky violation: any Hook after a conditional return may be skipped on some renders. Put all Hook calls before any early return.

**23. Explain useState, including functional updates and lazy initialization.**

useState returns a stateful value and a setter. Calling the setter schedules a rerender; it does not mutate the current variable synchronously. The value is preserved across renders because React stores it in the Hook slot, not in the local variable. Understanding two subtleties, functional updates and lazy init, separates a shallow answer from a strong one.

Functional updates matter when the next state depends on the previous state. If you call setN(n + 1) multiple times in one event, each reads the same stale n from that render's closure, so they collapse into one increment. Passing a function, setN(prev => prev + 1) , tells React to apply updates in sequence against the latest queued value, so three calls reliably add three.

Lazy initialization addresses expensive initial values. The argument to useState is evaluated on every render even though it is only used on the first, wasting work. Passing a function, useState(() => expensiveInit()) , makes React call it exactly once, on mount. Also remember state updates are batched and that setting state to the same value (by Object.is ) can bail out of a re-render.

```jsx
const [count, setCount] = useState(() => readFromStorage());
setCount(prev => prev + 1); // functional update
setCount(prev => prev + 1); // both apply: +2 total
```

**Gotcha:** State updates are not merged like this.setState in classes. If state is an object, you must spread the old value yourself: setUser(u => ({ ...u, name })) .

**24. What is useEffect for, and how does the dependency array work?**

useEffect lets you run side effects after render: things that reach outside React's pure render flow, such as network requests, subscriptions, timers, logging, or manually touching the DOM. React deliberately defers effects until after the browser has painted, so rendering stays fast and effects see a committed screen. The WHY: render must be pure, so anything with an external consequence belongs in an effect.

The dependency array controls when the effect re-runs. React compares each dependency with the previous render's value using Object.is . With no array, the effect runs after every render. With an empty array [] , it runs only once after mount. With [a, b] , it re-runs whenever a or b changed since the last render.

The mental model is not "run on mount/update" but "synchronize with these values." Every value from the component scope that the effect reads (props, state, functions) should be in the array. Effects are meant to keep some external system in sync with your React state; when a dependency changes, React re-synchronizes by cleaning up and running again.

```jsx
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id); // cleanup
}, [tick]);
```

**Gotcha:** Not every bit of logic needs an effect. If you can compute a value during render from existing props/state, do that instead; effects for derived data cause extra renders and bugs.

**25. How does effect cleanup work, and when do effects run and re-run?**

An effect may return a cleanup function. React runs it before the next execution of that same effect and once more when the component unmounts. The purpose is to undo whatever the effect set up: unsubscribe, clear a timer, abort a request, remove an event listener. Skipping cleanup is the classic source of memory leaks and duplicate subscriptions.

The precise timing on an update is: React renders, commits the new DOM, then before running the effect again it runs the previous render's cleanup, then runs the new effect. So on every dependency change you get "clean up the old, set up the new." This is why an effect that subscribes to userId correctly detaches from the old user before attaching to the new one.

Effects fire after paint (asynchronously), so the user never sees an intermediate state flash from an effect. In development with Strict Mode, React intentionally mounts, unmounts, and remounts each component once, running your effect twice, to surface missing cleanup. Correctly written effects (setup fully reversed by cleanup) are resilient to this double invocation.

```jsx
useEffect(() => {
  const handler = () => setWidth(window.innerWidth);
  window.addEventListener("resize", handler);
  return () => window.removeEventListener("resize", handler);
}, []);
```

**Gotcha:** Strict Mode's double-invoke only happens in development, never production. If code breaks under it, the effect has a real cleanup bug; do not "fix" it by disabling Strict Mode.

**26. What are the most common useEffect mistakes, like missing deps and infinite loops?**

The frequent mistakes are: omitting dependencies, creating infinite loops, and overusing effects for logic that belongs in render or event handlers. Each stems from misunderstanding that an effect re-synchronizes whenever its dependencies change.

Missing dependencies cause stale values: the effect closes over an old prop or state and never updates. The lint rule flags these; the correct fix is almost never to silence the rule but to include the dependency, or to remove the need for it (functional updates, moving a function inside the effect, or wrapping it in useCallback ). Suppressing the warning tends to hide real bugs.

Infinite loops happen when an effect updates state that is (directly or indirectly) one of its dependencies, or when a dependency is a new object/array/function created every render. Each render creates a fresh reference, so Object.is sees a change, the effect re-runs, updates state, re-renders, and repeats forever. Fixes: use functional updates, memoize the dependency, or move object creation out. Also avoid using effects to compute derived state you could calculate during render.

```jsx
// Infinite loop: options is a new object each render
useEffect(() => { fetchData(options); }, [options]);
// Fix: memoize or depend on primitive fields
const options = useMemo(() => ({ id }), [id]);
```

**Gotcha:** Responding to a user event? Put the logic in the event handler, not an effect. Effects are for synchronizing with external systems, not for reacting to interactions.

**27. Explain useContext and the Context pattern.**

Context provides a way to pass data through the component tree without threading props manually at every level ("prop drilling"). You create a context with createContext , wrap a subtree in its Provider with a value , and any descendant reads that value with useContext . It is ideal for broadly needed, relatively stable data like theme, current user, or locale.

The WHY: prop drilling couples intermediate components to data they do not use, purely to forward it. Context removes that intermediary burden. A consumer subscribes directly to the nearest matching Provider above it, so adding or removing middle layers no longer requires rewiring props.

The key performance caveat: every consumer re-renders when the Provider's value changes, by Object.is comparison. If you pass an inline object as value , it is a new reference every render and forces all consumers to re-render. Memoize the value, and split unrelated data into separate contexts so a change to one does not rerender consumers of the other. Context is for sharing, not a full state manager.

```jsx
const ThemeContext = createContext("light");
function Toolbar() {
  const theme = useContext(ThemeContext);
  return <div className={theme}/>;
}
```

**Gotcha:** component reading context re-renders whenever the value changes even if it only uses one field. For high-frequency updates, prefer a store (Redux, Zustand) or split contexts finely.

**28. What is useRef used for, both DOM refs and mutable values?**

useRef returns a mutable object { current: initialValue } that persists for the component's full lifetime. It has two distinct uses: accessing DOM nodes, and holding any mutable value that should survive renders without triggering one. The defining property: mutating ref.current does not cause a re-render.

For DOM access, you attach the ref to an element via the ref attribute; after commit, ref.current points to the DOM node, letting you focus an input, measure size, or integrate a non-React library. React sets the node during commit and clears it to null on unmount.

For mutable instance values, a ref is like a class instance field: a timer ID, a previous value, a flag indicating whether the component is mounted, or the latest value of a prop for a stale-closure workaround. Because writing it does not re-render, never read a ref during rendering to compute output; that makes render impure and unpredictable. Use state when a change should be reflected on screen; use a ref when it should not.

```jsx
const inputRef = useRef(null);
useEffect(() => { inputRef.current?.focus(); }, []);
return <input ref={inputRef} />;
```

**Gotcha:** Do not initialize a ref with an expensive call: useRef(new Heavy()) constructs on every render (the arg is evaluated each time), even though only the first result is kept. Guard it or use lazy assignment.

**29. What does useMemo memoize, and when should you use it?**

useMemo caches the result of a computation between renders. You give it a function and a dependency array; React runs the function and stores its return value, re-running it only when a dependency changes. Otherwise it returns the cached value. The purpose is to skip expensive recalculations and, just as importantly, to preserve object/array reference identity across renders.

Two legitimate reasons to reach for it: first, an expensive calculation (filtering a large list, heavy math) that would otherwise run every render. Second, referential stability: if a memoized value is passed to a React.memo child or used as another Hook's dependency, keeping the same reference prevents unnecessary re-renders or effect re-runs.

The WHY behind restraint: memoization is not free. It costs memory and a dependency comparison on every render, and the cache can be dropped by React at any time, so it is an optimization, not a guarantee. For cheap computations the overhead outweighs the benefit. Profile first; do not wrap everything reflexively. Note the compiler ("React Compiler") can automate much of this in newer setups.

```jsx
const sorted = useMemo(
  () => items.slice().sort(compare),
  [items]
);
```

**Gotcha:** useMemo memoizes a value; it does not memoize the component's render. If the component re-renders for another reason, the memoized value is reused but the surrounding JSX still rebuilds.

**30. What is useCallback, and how does it differ from useMemo?**

useCallback memoizes a function reference across renders. Without it, every render creates a brand-new function object, even if the body is identical. useCallback(fn, deps) returns the same function instance until a dependency changes. It is literally a specialization of useMemo : useCallback(fn, deps) equals useMemo(() => fn, deps) .

The difference in one line: useMemo caches the value a function returns; useCallback caches the function itself. Use useMemo for a computed result, use useCallback for a callback you will pass down.

The WHY: a stable function reference only matters when identity is observed. That happens when the function is passed to a React.memo -wrapped child (so the child does not re-render on a new reference) or listed as a dependency of another effect/memo (so it does not re-fire). If a function is only called locally and never handed off, wrapping it in useCallback adds cost with no benefit. Remember its own dependencies must be complete, or you reintroduce stale closures.

```jsx
const handleClick = useCallback(
  () => onSelect(id),
  [onSelect, id]
);
// stable ref => memoized child skips re-render
```

**Gotcha:** useCallback only helps if the consumer actually compares the reference. Passing a memoized callback to a plain, non-memoized child changes nothing; that child rerenders with its parent regardless.

**31. What is React.memo and how does it pair with useCallback?**

React.memo is a higher-order component that memoizes a component's rendered output. It shallow-compares the new props with the previous props and, if they are equal, skips re-rendering, reusing the last result. Its purpose is to prevent a child from re-rendering when its parent re-renders but the child's props have not actually changed.

The catch is shallow comparison combined with referential inequality. If a parent passes an inline object, array, or function as a prop, that prop is a new reference on every parent render, so the shallow check always reports "changed" and React.memo is defeated. This is exactly where useCallback and useMemo come in: they preserve stable references for function and object props so the memo comparison can succeed.

So the trio works together: React.memo on the child skips work when props are equal; useCallback / useMemo in the parent keep those props referentially stable. Missing either half breaks the optimization. Use it where a component is genuinely expensive or re-renders often with the same props; sprinkling it everywhere adds comparison overhead for no gain.

```jsx
const Row = React.memo(function Row({ onPick, label }) {
  return <li onClick={onPick}>{label}</li>;
});
```

**Gotcha:** You can pass a custom comparison as the second argument, but returning true means "props are equal, skip render" which is the opposite polarity of shouldComponentUpdate . Easy to invert by mistake.

**32. What are custom Hooks, and how do they help reuse logic?**

A custom Hook is a JavaScript function whose name starts with use and that calls other Hooks. It lets you extract stateful, reusable logic out of a component into a shareable function. This is the payoff of the whole Hooks model: sharing behavior without wrapper components or changing the tree, which HOCs and render props could not do cleanly.

The crucial insight is that custom Hooks share logic, not state. Each call to a custom Hook gets its own fully independent state and effects. If two components both call useFormInput() , they do not share a value; each instance is isolated, just as calling useState twice yields two separate states.

The use prefix is not cosmetic: it signals to the linter that Rules of Hooks apply, so it can verify the function is called correctly and that its internal Hooks obey the ordering rules. Good custom Hooks have a clear single responsibility, return exactly what callers need (a value, a tuple, or an object), and compose freely, one custom Hook calling another.

```jsx
function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  const toggle = useCallback(() => setOn(v => !v), []);
  return [on, toggle];
}
```

**Gotcha:** function that does not call any Hook does not need the use prefix, and misusing the prefix on a plain helper misleads the linter. Reserve use for functions that actually use Hooks.

**33. What is useReducer, and when should you prefer it over useState?**

useReducer manages state through a reducer function: (state, action) => newState . You call dispatch(action) , React runs the reducer with the current state and that action, and the return value becomes the next state. It is an alternative to useState for more complex state logic, following the same pattern Redux popularized but built into React.

Prefer it when the next state depends on intricate rules, when multiple sub-values change together, or when several actions update the same state in different ways. Centralizing transitions in one pure reducer makes them easier to read, test in isolation, and reason about than a scatter of setState calls. It also shines when the update logic is complex enough that keeping it out of the component improves clarity.

practical performance and correctness benefit: dispatch has a stable identity and never changes across renders, so you can safely pass it to memoized children or omit it from dependency arrays. It also cooperates well with Context, letting deeply nested components dispatch actions without prop drilling. Both Hooks are equivalent in power; the choice is about which makes the logic clearer.

```jsx
function reducer(state, action) {
  switch (action.type) {
    case "inc": return { count: state.count + 1 };
    default: return state;
  }
}
const [state, dispatch] = useReducer(reducer, { count: 0 });
```

**Gotcha:** Reducers must be pure: no fetches, no mutations, no side effects. Returning the exact same state object (not a new one) lets React bail out of re-rendering.

**34. How does useLayoutEffect differ from useEffect?**

Both run side effects, but at different times relative to the browser paint. useEffect runs asynchronously after the browser has painted the new frame. useLayoutEffect runs synchronously after the DOM mutations but before the browser paints. That timing distinction is the entire point.

Use useLayoutEffect when you must read layout (measure a node's size or position) and then synchronously re-render or mutate the DOM before the user sees anything. Because it blocks paint, React applies your change in the same frame, so the user never observes a flicker or an intermediate position. The classic case is measuring a tooltip and repositioning it before it appears.

The trade-off: it blocks painting, so heavy work there hurts perceived performance. The default should be useEffect ; reach for the layout variant only to prevent a visual flash caused by reading and adjusting layout. Note that on the server, useLayoutEffect does not run and React warns about it; guard it or prefer useEffect for isomorphic code.

```jsx
useLayoutEffect(() => {
  const { height } = ref.current.getBoundingClientRect();
  setHeight(height); // applied before paint, no flicker
}, []);
```

**Gotcha:** If you see content flash at the wrong size or position for one frame, switching that measurement effect from useEffect to useLayoutEffect usually fixes it.

**35. What are stale closures in Hooks, and how do you fix them?**

A stale closure is when a function captures variables from a past render and keeps using those old values after state has moved on. Because each render creates fresh functions bound to that render's props and state, a callback stored somewhere (an interval, an event listener, an effect with missing deps) may "freeze" the values it closed over. This is a consequence of JavaScript closures interacting with React's render-per-state model.

The classic example is a setInterval set up once in an empty-dependency effect that reads count . The interval callback captured count as 0 forever, so it always logs 0 even as the state increases, because the effect never re-ran to capture a newer value.

Fixes, in order of preference: (1) use a functional updater so you never read the stale value at all, setCount(c => c + 1) ; (2) include the value in the dependency array so the effect re-subscribes with fresh values; or (3) store the latest value in a ref and read ref.current inside the callback, since refs are mutable and always current. The lint rule catches most cases before they bite.

```jsx
useEffect(() => {
  const id = setInterval(() => {
    setCount(c => c + 1); // no stale read
  }, 1000);
  return () => clearInterval(id);
}, []);
```

**Gotcha:** Do not "solve" a stale closure by disabling the exhaustive-deps lint rule. That silences the symptom while leaving the frozen value in place.

**36. How do you fetch data with useEffect, and what are the pitfalls?**

A basic pattern runs a fetch inside useEffect keyed on the query dependencies, stores the result in state, and renders it. It works, but doing it correctly requires handling several pitfalls that naive versions ignore: race conditions, cleanup, loading/error states, and duplicate requests.

The biggest hazard is a race condition. If the dependency changes quickly, an earlier request may resolve after a later one and overwrite fresh data with stale results. The fix is to track whether the effect is still current, via a boolean flag in the cleanup, or better an AbortController that cancels the outdated request. You should also handle errors, set a loading flag, and remember Strict Mode will run the effect twice in development.

Because these concerns are easy to get wrong, the ecosystem largely moved to dedicated libraries such as React Query (TanStack Query) or SWR, and to framework data loaders and Server Components. They provide caching, deduplication, retries, and cancellation for free. Raw useEffect fetching is fine for simple cases but is not the recommended default for serious apps.

```jsx
useEffect(() => {
  const ctrl = new AbortController();
  fetch(`/api/user/${id}`, { signal: ctrl.signal })
    .then(r => r.json()).then(setUser)
    .catch(e => { if (e.name !== "AbortError") setError(e); });
  return () => ctrl.abort();
}, [id]);
```

**Gotcha:** Without cancellation or an "ignore" flag, switching between two IDs fast can leave you showing the wrong user. Always guard against out-of-order responses.

**37. What is useId and why does it exist?**

useId generates a unique, stable string ID that is consistent between the serverrendered and client-rendered output. Its main purpose is accessibility: linking a form label to its input with htmlFor / id , or wiring aria-describedby , without hardcoding IDs that could collide when a component appears multiple times on a page.

The WHY is server-side rendering hydration. If you generated an ID with a counter or Math.random() during render, the server and client would produce different strings, and React's hydration would detect a mismatch and warn or misbehave. useId produces the same deterministic value on both sides because React derives it from the component's position in the tree.

It is explicitly not for generating keys in a list; list keys should come from your data. Nor is it a random-value generator. For multiple related IDs in one component, call it once and append suffixes to the single base value rather than calling the Hook many times.

```jsx
function Field() {
  const id = useId();
  return (
    <>
      <label htmlFor={id}>Name</label>
      <input id={id} />
    </>
  );
}
```

**Gotcha:** The generated string contains colons (like :r0: ) and is not a valid CSS selector by default. Use it as an attribute value, not in querySelector without escaping.

**38. What is useImperativeHandle, and how does it work with forwardRef?**

useImperativeHandle customizes the value that a parent receives when it attaches a ref to your component. Normally a ref to a component exposes nothing useful (or, with forwardRef , a raw DOM node). This Hook lets you expose a deliberate imperative API instead, such as focus() , scrollToTop() , or reset() , hiding internal details.

It must be paired with ref forwarding. Historically you wrapped the component in forwardRef so the parent's ref reaches the child; inside, useImperativeHandle(ref, () => ({ ... }), deps) defines the object the parent sees. In React 19, ref can be passed as a regular prop, so forwardRef is often no longer needed, but the concept is identical.

The WHY, and the caution: React is declarative, so imperative handles should be rare. They are justified for genuinely imperative actions the DOM itself models, focus, text selection, media playback, animations, where expressing the action through props would be awkward. Overusing them signals that data should probably flow through props and state instead. Expose the smallest surface you can.

```jsx
const Input = forwardRef((props, ref) => {
  const inner = useRef(null);
  useImperativeHandle(ref, () => ({
    focus: () => inner.current.focus(),
  }), []);
  return <input ref={inner} />;
});
```

**Gotcha:** Reach for props/state first. If a parent needs to "tell" a child something, an imperative handle is usually a last resort, not the first tool.

**39. What do useTransition and useDeferredValue do in concurrent React?**

Both are concurrent-feature Hooks that let you mark some UI updates as lower priority, so urgent updates (like typing) stay responsive while expensive updates (like filtering a huge list) happen without blocking. They address the problem that a single heavy state update can freeze the input the user is interacting with.

useTransition gives you [isPending, startTransition] . You wrap a state update in startTransition to mark it non-urgent; React can interrupt and defer that render to keep urgent updates smooth, and isPending lets you show a subtle loading indicator. Use it when you control the state update and want to deprioritize the work it triggers.

useDeferredValue takes a value and returns a deferred copy that lags behind during heavy work. You use it when you receive a value (a prop or state you do not set yourself) and want to render an expensive view from a "stale but stable" version while the fresh value catches up. Roughly: useTransition defers an update you trigger; useDeferredValue defers a value you consume. Neither replaces debouncing entirely, but both reduce jank by yielding to the browser.

```jsx
const [isPending, startTransition] = useTransition();
startTransition(() => setQuery(next)); // low priority
const deferredQuery = useDeferredValue(query);
```

**Gotcha:** Only non-urgent updates belong in a transition. Never wrap a controlled input's own value update in startTransition , or the field will feel laggy.

**40. What is useSyncExternalStore and when do you need it?**

useSyncExternalStore is the official Hook for subscribing a component to an external store, any mutable data source outside React such as a Redux store, a browser API, or a global event emitter. It exists so libraries can integrate with React's concurrent rendering safely, avoiding a class of bugs called "tearing" where different parts of the UI momentarily show inconsistent values from the same source.

It takes three arguments: a subscribe function that registers a callback and returns an unsubscribe function; a getSnapshot function that returns the store's current value; and an optional getServerSnapshot for SSR. React calls getSnapshot to read the value and re-renders whenever subscribe signals a change, guaranteeing the whole tree reads a single consistent snapshot per render.

The WHY behind it over a manual effect-plus-state pattern: with concurrent rendering, React can pause and resume work, and an ad-hoc subscription can read the store at inconsistent moments, tearing the UI. This Hook coordinates reads with React's scheduler. Most app developers never call it directly; it is primarily a building block that state-management libraries use under the hood.

```jsx
const width = useSyncExternalStore(
  (cb) => { window.addEventListener("resize", cb);
            return () => window.removeEventListener("resize", cb); },
  () => window.innerWidth
);
```

**Gotcha:** getSnapshot must return a cached, referentially stable value when nothing changed. Returning a fresh object each call causes an infinite render loop.
