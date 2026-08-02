## Advanced & Testing

*Total questions: 20*


**81. What is Suspense, and how does it work for both lazy components and data fetching?**

Suspense is a mechanism that lets a component "suspend" rendering while it waits for something asynchronous, showing a declarative fallback UI in the meantime. The WHY: without Suspense, every component that loads something async needs its own isLoading state and conditional JSX, scattering loading logic everywhere. Suspense lifts that concern up to a boundary, so a parent declares the fallback once and any descendant can suspend.

The oldest use is React.lazy . A lazy component returns a promise for its code chunk; while that chunk downloads, the nearest Suspense boundary above it renders the fallback . This is how you code-split routes without manual loading flags.

Suspense for data is the newer, more powerful case. A data source (a framework loader, or the React 19 use() hook) throws a promise; React catches it, shows the fallback, and retries the render when the promise resolves. This enables render-asyou-fetch and streaming SSR, where the server sends HTML for ready parts and streams the rest as data arrives.

```jsx
const Profile = lazy(() => import('./Profile'));
function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Profile />
    </Suspense>
  );
}
```

**Gotcha:** Suspense only catches promises thrown during render, not inside event handlers or effects. You cannot make a bare useEffect + fetch suspend; you need a Suspense-integrated data source. Also, a boundary re-shows its fallback on any suspending update unless you wrap the update in a transition.

**82. What are React Server Components, and how do server and client components differ?**

React Server Components (RSC) are components that run only on the server and never ship their code to the browser. The WHY: much UI is just reading data and producing markup — it does not need interactivity, and sending its JavaScript to the client is pure waste. RSC lets you render that work on the server, send a compact serialized description of the output, and keep the bundle small.

server component can be async , await a database query or file read directly, and access server-only secrets — because its code never leaves the server. What it cannot do is use state, effects, or browser event handlers, since there is no client runtime for it.

client component is the traditional React component, marked with the 'use client' directive at the top of the file. It ships to the browser and can use useState , useEffect , and onClick . Server components can import and render client components (passing serializable props), composing the two into one tree.

```jsx
// Server Component (default in RSC frameworks)
async function Page() {
  const posts = await db.posts.findAll();
  return <PostList posts={posts} />;
}
// Client Component
'use client';
function LikeButton() {
  const [liked, setLiked] = useState(false);
}
```

**Gotcha:** The 'use client' directive marks the boundary, not just one component — everything imported into a client module becomes part of the client bundle. Props passed from server to client components must be serializable, so you cannot pass a function (except server actions) or a class instance across the boundary.

**83. How do Server Components differ from server-side rendering (SSR)?**

They solve different problems and are not alternatives — you often use both. The WHY for the confusion: both "run React on the server," but SSR is about when the initial HTML is produced, while RSC is about where a component's code lives and whether it ships to the client at all.

Traditional SSR takes your normal component tree, renders it to an HTML string on the server for a fast first paint, sends it, and then hydrates — the full JavaScript bundle for every component still downloads to the browser and re-attaches. SSR improves perceived load and SEO, but the client bundle is unchanged.

Server Components change what gets bundled. A server component's code never reaches the browser; only its rendered output (as a serialized payload) and the code for actual client components are sent. So RSC reduces bundle size and lets you fetch data at the component level on the server, while SSR is purely a rendering-timing strategy.

In practice a framework like Next.js renders server components on the server, produces streaming HTML via SSR for the client components within them, and then hydrates only those client parts. RSC and SSR compose: RSC decides what code ships, SSR decides how the first HTML is delivered.

**Gotcha:** Interviewers love "is RSC just SSR?" — the crisp answer is no: SSR still ships every component's JS to hydrate; RSC omits server-only component code from the bundle entirely. A component can be a server component that is also SSR-rendered, but the two concepts are orthogonal.

**84. What is the React 19 use() hook and how is it different from other hooks?**

The use() API reads the value of a resource — a promise or a context — during render. The WHY: before it, reading a promise required Suspense-integrated libraries, and reading context required the rules-of-hooks-bound useContext . use() unifies these and, crucially, relaxes the rules: it may be called conditionally and inside loops.

When you pass a promise to use() , the component suspends until the promise resolves, then use() returns the resolved value; if it rejects, the nearest error boundary catches it. This makes render-as-you-fetch ergonomic and integrates naturally with the nearest Suspense boundary.

Unlike other hooks, use() is not bound by the "call at the top level only" rule — it can appear after an early return or inside an if . This is why it is called an API rather than strictly a hook, though it still must be called during render.

```jsx
function Comments({ commentsPromise }) {
  // suspends until resolved (React 19)
  const comments = use(commentsPromise);
  return comments.map((c) => <p key={c.id}>{c.text}</p>);
}
```

**Gotcha:** Do not create the promise inside the component that calls use() during render — a new promise each render causes an infinite suspend/re-render loop. Create promises in a server component, a cached loader, or an event handler and pass them down.

**85. What are Actions in React 19, and how does useActionState work?**

Actions are async functions React manages for you, tracking pending state, errors, and optimistic updates around a data mutation. The WHY: submitting a form previously meant hand-rolling isPending , try/catch error state, and resetting — boilerplate repeated everywhere. Actions bake this lifecycle into React and integrate with forms and transitions.

useActionState wraps an action function and returns the current state, a wrapped action to dispatch, and a isPending boolean. You give it a reducer-like function (prevState, formData) => newState and an initial state; React runs it inside a transition so the UI stays responsive.

Passing the wrapped action to a form's action prop wires submission automatically — React calls your function with the form data, marks it pending during the await, and updates state with the return value. This works with progressive enhancement in RSC frameworks.

```jsx
const [error, submitAction, isPending] = useActionState(
  async (prev, formData) => {
    const res = await updateName(formData.get('name'));
    if (res.error) return res.error;
    return null;
  },
  null
);
// <form action={submitAction}>
```

**Gotcha:** The first argument to your action is the previous state, not the form data — a common mix-up. Also useActionState was briefly named useFormState in canaries and lived in react-dom ; in React 19 it is useActionState from react .

**86. What problem does useOptimistic solve, and how do you use it?**

useOptimistic lets you show a provisional "optimistic" state immediately while an async action is still in flight, then automatically fall back to the real state when it settles. The WHY: users expect instant feedback — a sent message should appear at once — but the server round-trip takes time, and manually reconciling the temporary UI with the confirmed result is error-prone.

You pass it the actual state and a function that merges an optimistic value into it. It returns the optimistic state to render plus a setter you call inside your action. React shows the optimistic value during the pending transition and, once the action completes and the real state updates, discards the optimistic layer and re-renders with the true value.

The elegance is the automatic revert: you never manually roll back. If the action fails, the optimistic value simply disappears when React re-renders from the confirmed state, so the UI self-corrects.

```jsx
const [optimisticMsgs, addOptimistic] = useOptimistic(
  messages,
  (state, newMsg) => [...state, { text: newMsg, sending: true }]
);
async function send(formData) {
  addOptimistic(formData.get('msg')); // shows instantly
  await sendMessage(formData);       // then reconciles
}
```

**Gotcha:** Optimistic updates only persist while the surrounding transition/action is pending. Call addOptimistic inside an action (or a function wrapped by a transition), not in a raw handler with no pending work, or the optimistic state reverts immediately.

**87. What is createPortal and when do you need it?**

A portal renders children into a different DOM node than the parent component's own DOM position, while keeping them in the same React tree. The WHY: sometimes CSS constraints — overflow: hidden , z-index stacking contexts, or transform on an ancestor — clip or mis-layer content like modals and tooltips. A portal lets you visually escape the parent container by mounting into document.body while preserving React context and event bubbling.

Crucially, a portal only changes the physical DOM placement, not the logical React tree. State, context, and even event propagation still flow through the React parent — a click inside a portaled modal bubbles to handlers on its React ancestor, even though it lives elsewhere in the DOM.

Typical use cases: modals, dialogs, dropdowns, tooltips, and toast notifications — anything that must render above or outside its parent's clipping/stacking context.

```jsx
import { createPortal } from 'react-dom';
function Modal({ children }) {
  return createPortal(
    <div className="overlay">{children}</div>,
    document.body
  );
}
```

**Gotcha:** Because events still bubble through the React tree, a click inside a portaled dropdown can trigger an "outside click" handler on a React ancestor even though the DOM node is elsewhere. Account for React-tree bubbling, not just DOM position, when writing dismiss logic.

**88. How do refs and forwardRef work, and what changed in React 19?**

A ref is a mutable container ( { current: ... } ) whose changes do not trigger rerenders. Its two main jobs are holding a reference to a DOM node and storing a mutable value that should survive renders without causing them. The WHY for refs over state: some values (a timer id, a DOM element) are not rendering inputs, so making them state would cause needless re-renders.

Historically, function components could not receive a ref prop directly, so forwardRef wrapped a component to explicitly forward a ref to a child DOM node — letting a parent grab, say, the underlying <input> of a custom component.

React 19 makes ref an ordinary prop for function components, so forwardRef is no longer needed in most cases — you just destructure ref from props. forwardRef still works for backward compatibility but is being deprecated in favor of the direct prop.

```jsx
// React 19: ref as a regular prop
function Input({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}
// Pre-19: needed forwardRef
const Input = forwardRef((props, ref) =>
  <input ref={ref} {...props} />);
```

**Gotcha:** Mutating ref.current does not re-render, so never read a ref value to decide what to render — the UI will be stale. Also do not read or write ref.current during render (except lazy initialization); do it in effects or handlers.

**89. When do you need an Effect, and when might you not?**

Effects are for synchronizing your component with an external system — a subscription, a network connection, a non-React widget, the document title. The WHY this matters: developers overuse effects for logic that belongs elsewhere, causing extra renders, race conditions, and bugs. The React docs literally have a page titled "You Might Not Need an Effect."

The key distinction: code that runs because a specific interaction happened belongs in an event handler; code that runs because the component is displayed and needs to stay in sync with something external belongs in an effect. Submitting a form on click is an event; opening a chat connection while a room is shown is an effect.

Two common anti-patterns: (1) using an effect to transform data for rendering — instead compute it during render, memoizing if expensive; (2) using an effect to reset or adjust state when a prop changes — often better handled with a key to remount, or by computing derived values inline.

```jsx
// Anti-pattern: effect to derive state
useEffect(() => { setFullName(first + ' ' + last); }, [first, last]);
// Better: derive during render
const fullName = first + ' ' + last;
```

**Gotcha:** If an effect has no external system and only reacts to a user action, it is probably misplaced — move it into the handler. A tell-tale smell is an effect whose only job is to call setState based on other state or props.

**90. How does client-side routing work with React Router?**

Client-side routing swaps which components render based on the URL without a full page reload. The WHY: a single-page app loads once, then intercepts navigation to update the view via the History API, keeping state and avoiding server round-trips for each page — giving app-like transitions.

React Router provides a router (e.g. BrowserRouter or a data router via createBrowserRouter ), Routes / Route to map URL paths to elements, and Link / NavLink to navigate without reloading. Routes can nest, and an Outlet renders the matched child inside a shared layout.

Dynamic segments like /users/:id are read with useParams ; programmatic navigation uses useNavigate . Modern data routers add loader functions to fetch data before a route renders and action functions to handle form submissions.

```jsx
import { Routes, Route, Link, useParams } from 'react-router-dom';
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/users/:id" element={<User />} />
</Routes>
// const { id } = useParams();
```

**Gotcha:** Use Link , not a plain <a href> , for internal navigation — a raw anchor triggers a full page reload, discarding app state. Reserve <a> for external URLs.

**91. How do you build accessible React components?**

Accessibility (a11y) means the UI works for assistive technology and keyboard users. The WHY: React outputs the same DOM as any web app, so the same rules apply — but because we build custom widgets from generic div s, it is easy to lose the semantics browsers give for free. Starting from semantic HTML is the single biggest lever.

Prefer real elements: a <button> over a clickable <div> gets focusability, Enter/Space activation, and the right role automatically. Use <label> tied to inputs, headings in order, and lists for lists. In JSX, remember it is htmlFor (not for ) and className .

When you must build custom widgets, add ARIA roles and attributes to fill the semantic gap — aria-label , aria-expanded , role — but ARIA is a last resort, not a substitute for the right element. Manage focus explicitly for modals and route changes (move focus in, trap it, restore it on close) using refs.

```jsx
// Prefer semantics; add ARIA only to fill gaps
<button aria-expanded={open} onClick={toggle}>
  Menu
</button>
<label htmlFor="email">Email</label>
<input id="email" />
```

**Gotcha:** <div onClick> is not keyboard-accessible — it cannot be focused or activated with Enter/Space and exposes no role. The first rule of ARIA is "don't use ARIA": reach for the native element first.

**92. How do you type props, state, and events in React with TypeScript?**

TypeScript adds compile-time safety to React by describing the shapes of props, state, and event objects. The WHY: React's data flow is all about passing typed values through props and callbacks, so a type system catches missing props, wrong shapes, and incorrect event handling before runtime — the most common class of React bugs.

Type props with an interface or type and annotate the component's parameter. For state, useState usually infers from the initial value, but you specify the generic when the initial value is null or a union, e.g. useState<User | null>(null) .

Event handlers use React's synthetic event types, like React.ChangeEvent<HTMLInputElement> or React.MouseEvent<HTMLButtonElement> . For children, use React.ReactNode . Prefer typing the handler's parameter over the whole function so inference stays clean.

```jsx
interface Props {
  label: string;
  onSave: (id: number) => void;
}
function Field({ label, onSave }: Props) {
  const [value, setValue] = useState<string>('');
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setValue(e.target.value);
}
```

**Gotcha:** Avoid React.FC for typing components if you want implicit children control — it was criticized for silently allowing children and complicating generics. Prefer typing props directly on the parameter.

**93. What is the testing philosophy behind React Testing Library?**

React Testing Library (RTL) is built on one principle: "the more your tests resemble the way your software is used, the more confidence they give you." The WHY: tests coupled to implementation details — internal state, method names, component structure — break on every refactor even when behavior is unchanged, and they pass even when the user-facing behavior is broken. RTL steers you to test behavior instead.

Concretely, you query the rendered output the way a user perceives it — by visible text, labels, and roles — and you interact the way a user does — clicking, typing. You avoid reaching into the instance to read state or call methods, which RTL deliberately makes hard.

The payoff is refactor-resistant tests: rename a state variable, switch from a class to hooks, or restructure the JSX, and a behavior-focused test keeps passing as long as the user sees the same thing. This makes the test suite a safety net rather than a maintenance burden.

```jsx
// Test what the user sees, not internals
render(<Counter />);
await userEvent.click(screen.getByRole('button', { name: /increment/i }));
expect(screen.getByText('Count: 1')).toBeInTheDocument();
```

**Gotcha:** If a test asserts on internal state or a component's private methods, it is testing implementation, not behavior — a red flag. A good heuristic: could a user observe what you are asserting? If not, reconsider the assertion.

**94. How do RTL queries work, and why prefer user-event over fireEvent?**

RTL queries come in three families with different behaviors: getBy throws if not found (for elements that should exist), queryBy returns null (for asserting absence), and findBy returns a promise that retries (for elements appearing asynchronously). The WHY: choosing the right variant makes the intent explicit and gives good failure messages.

There is also a priority order for which query to use. Prefer accessible queries — getByRole , getByLabelText , getByText — because they mirror how users and assistive tech find things. Fall back to getByTestId only when nothing accessible works, since test ids are invisible to users.

user-event is preferred over fireEvent because it simulates full interactions the way a real user triggers them: typing dispatches keydown, keypress, input, and keyup, and clicking checks that the element is not disabled and fires the correct sequence. fireEvent dispatches a single raw event, missing the surrounding reality.

```jsx
const input = screen.getByLabelText('Email');
await userEvent.type(input, 'a@b.com'); // realistic keystrokes
const toast = await screen.findByText(/saved/i); // waits for async
expect(screen.queryByRole('alert')).not.toBeInTheDocument();
```

**Gotcha:** Modern user-event (v14+) is async — every interaction returns a promise you must await . Forgetting the await causes assertions to run before the UI updates, producing flaky or false-passing tests.

**95. How do you test custom hooks and asynchronous UI updates?**

Custom hooks cannot be called outside a component, so you test them with renderHook from React Testing Library, which mounts a tiny host component and returns the hook's result in result.current . The WHY: this lets you exercise a hook's logic directly without inventing a throwaway wrapper, while still running it inside React's real rendering.

To trigger updates, wrap state-changing calls in act (or use the async act ) so React flushes effects and re-renders before you assert. After an update, read the new value from result.current again — it points to the latest render.

For async UI, prefer findBy* queries or waitFor , which poll until the expectation passes or times out, instead of arbitrary timeouts. This handles data that arrives after a promise resolves without hardcoding delays.

```jsx
const { result } = renderHook(() => useCounter());
act(() => result.current.increment());
expect(result.current.count).toBe(1);
// async UI
render(<Profile />);
expect(await screen.findByText('Ada')).toBeInTheDocument();
```

**Gotcha:** An "not wrapped in act(...)" warning usually means a state update happened after the test finished — often an un-awaited async update. Use findBy / waitFor to await the settled state rather than ignoring the warning.

**96. How do you mock modules and network requests in React tests?**

Mocking replaces a real dependency with a controlled fake so tests are fast, deterministic, and isolated from the network. The WHY: hitting a real API makes tests slow, flaky, and dependent on external state; mocking lets you assert how your component behaves given specific responses, including errors.

For module mocking, Jest's jest.mock('./api') (or Vitest's vi.mock ) swaps a module with a fake whose functions you control via mockResolvedValue or mockRejectedValue . This is good for unit-level isolation of a specific dependency.

For network requests, the modern best practice is Mock Service Worker (MSW), which intercepts requests at the network layer rather than stubbing fetch . Because it mocks the actual HTTP boundary, your component and data-fetching code run unchanged, giving higher-confidence tests that survive refactors of the fetch implementation.

```jsx
// Module mock
jest.mock('./api');
api.getUser.mockResolvedValue({ name: 'Ada' });
// MSW handler (network-level)
http.get('/api/user', () =>
  HttpResponse.json({ name: 'Ada' }));
```

**Gotcha:** Reset mocks between tests ( jest.clearAllMocks or restoreHandlers ) or state leaks across tests and causes order-dependent failures. Prefer MSW over stubbing global.fetch so tests survive switching to axios or React Query.

**97. What are common React anti-patterns to avoid?**

The recurring theme in React anti-patterns is fighting the framework's data flow instead of working with it. The WHY: React expects unidirectional data flow, pure renders, and state as the single source of truth; violating those produces stale UI, unnecessary renders, and hard-to-trace bugs.

Frequent offenders: mutating state directly instead of producing a new value (React compares by reference and skips the update); duplicating props into state, which then goes stale when the prop changes; and overusing effects to sync state that could be derived during render.

Others: defining components inside another component's body (remounts and loses state every render); doing side effects during render (render must be pure); propdrilling many levels instead of using context or composition; and premature memoization that adds complexity without measured benefit.

```jsx
// Anti-pattern: mutate then set
state.items.push(x); setItems(state.items); // same ref, no update
// Correct: new reference
setItems([...state.items, x]);
```

**Gotcha:** Defining a component inside another component looks harmless but recreates the type every render, so React unmounts and remounts the subtree each time — losing its state and effects. Hoist components to module scope.

**98. Why is using the array index as a key an anti-pattern?**

Keys tell React's reconciler which list items are the same across renders so it can match, reuse, and reorder elements correctly. The WHY the index is dangerous: when the list can reorder, insert, or delete, an item's index changes, so React associates a DOM node and its internal state with the wrong data — producing subtle bugs.

The classic symptom: a list of inputs keyed by index. Delete the first row, and every remaining row's index shifts down by one, so React thinks row 1 is still row 1 and keeps its DOM node — but now it holds the next item's data, while the typed input value stays attached to the wrong entry. Checkbox and focus state leak between rows the same way.

The fix is a stable, unique identifier tied to the data itself — a database id or a generated uuid created when the item is added. Index keys are acceptable only for static lists that never reorder, filter, or change length.

```jsx
// Risky: index as key on a mutable list
{items.map((it, i) => <Row key={i} item={it} />)}
// Safe: stable id
{items.map((it) => <Row key={it.id} item={it} />)}
```

**Gotcha:** Do not paper over it with key={Math.random()} — a new key every render forces React to destroy and recreate every item, killing performance and blowing away state and focus. Keys must be stable and unique.

**99. How do class lifecycle methods map to hooks?**

When reading legacy class code, it helps to translate lifecycle methods into their hook equivalents. The WHY: hooks reorganize logic by concern rather than by timing — a single useEffect can express setup and teardown together, whereas classes split related logic across componentDidMount and componentWillUnmount .

componentDidMount maps to useEffect(fn, []) — runs once after mount. componentDidUpdate maps to useEffect(fn, [deps]) that runs when a dependency changes. componentWillUnmount maps to the cleanup function returned from an effect. Together, one effect covers the full mount/update/unmount cycle for a given concern.

Other mappings: this.state / setState become useState or useReducer ; shouldComponentUpdate becomes React.memo ; expensive per-render computation becomes useMemo . There is no direct hook for getSnapshotBeforeUpdate or error boundaries — error boundaries still require a class.

```jsx
// componentDidMount + componentWillUnmount
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id); // cleanup = unmount
}, []);
```

**Gotcha:** An effect is not a perfect 1:1 for a lifecycle method — it runs after paint and re-runs whenever dependencies change, so thinking "this is just componentDidUpdate" can mislead. Think in terms of synchronization, not timing.

**100. How should you reason about a React interview question you have never seen?**

The meta-skill is reducing any unfamiliar question to a few durable first principles rather than recalling a memorized answer. The WHY: React's surface area keeps growing, but it rests on a small core — UI is a pure function of state, data flows down, and effects synchronize with the outside world. Almost every "why" traces back to these.

reliable framework: (1) state the core mental model — UI = f(state) ; (2) ask what triggers a re-render — a state or prop change, or a parent re-rendering; (3) ask about identity and equality — React compares by reference, which explains keys, memoization, and dependency arrays; (4) separate render (must be pure) from effects (side effects, cleanup); (5) consider the boundary — what is React's job versus the external system's.

When stuck, reason out loud from these principles and connect the specific API to the model. Interviewers value seeing you derive an answer from fundamentals over reciting one — it demonstrates you can handle the API you have not memorized.

Finally, tie behavior to the "why": explain that immutability enables cheap reference comparison, that keys enable correct reconciliation, that effects run after render because render must stay pure. Grounding answers in causes, not rules, is what distinguishes a senior response.

**Gotcha:** Do not bluff a specific API name you are unsure of. It is stronger to say "I would reach for something that synchronizes with an external system here — an effect with cleanup" and reason from the model than to confidently cite a hook that does not exist. You made it to 100. If you can explain most of these out loud, you are ready for almost any React interview. The strongest candidates are not the ones who memorized hook signatures, they are the ones who can reason about why React re-renders and what a pattern costs. When you hit a question that is not here, walk it the same way: what problem does this solve, and what is the trade-off? Found this useful? This is part of a series of deep-dive interview guides. Follow for the next one, a new technology every few days. Save this PDF and share it with someone who is interviewing.
