## React Fundamentals

*Total questions: 20*


**1. What is React and why would you use it?**

React is a JavaScript library for building user interfaces, created and maintained by Meta. Its core value proposition rests on three ideas: it is declarative, componentbased, and it uses a virtual DOM to reconcile changes efficiently. Understanding the WHY behind these matters more than memorizing the definition.

Declarative means you describe what the UI should look like for a given state, not the step-by-step DOM mutations to get there. Instead of manually calling document.createElement and tracking which nodes changed, you write a function of your data and React figures out the minimal set of updates. This eliminates a whole class of bugs where the DOM and your data drift out of sync.

Component-based means you compose your UI from small, reusable, self-contained pieces that manage their own state and logic. Components compose like functions, which makes large applications tractable. Combined with a strong ecosystem (routing, state management, testing) and a huge community, React became a default choice for interactive web apps.

```jsx
function Welcome({ name }) {
  return <h1>Hello, {name}</h1>;
}
```

**Gotcha:** React is a library, not a full framework. It deliberately leaves routing, data fetching, and global state to the ecosystem or meta-frameworks like Next.js. Interviewers often probe whether you understand that distinction.

**2. What is JSX and how does it compile?**

JSX is a syntax extension to JavaScript that lets you write HTML-like markup inside your code. It is not understood by browsers directly; a compiler like Babel or the TypeScript compiler transforms it into plain JavaScript function calls. Knowing what it compiles to demystifies a lot of React's behavior.

Historically, JSX compiled to React.createElement calls, which is why you used to need import React from 'react' in every file even if you never referenced React explicitly. Each element becomes a call that returns a plain JavaScript object describing the node (its type, props, and children) — this object is a React element.

Since React 17, the new JSX transform lets the compiler import special functions ( jsx / jsxs ) from react/jsx-runtime automatically, so you no longer need to import React just to use JSX. JSX expressions can embed any JavaScript inside curly braces, and attributes use camelCase (e.g. className , onClick ).

```jsx
// This JSX...
<h1 className="title">Hi</h1>
// ...compiles roughly to:
React.createElement("h1", { className: "title" }, "Hi");
```

**Gotcha:** JSX must return a single root element. That is why fragments exist. Also, because JSX is just function calls, you cannot use statements like if directly inside it — only expressions.

**3. What is the difference between function and class components, and why did function components win?**

Both are ways to define a React component. A class component extends React.Component and defines a render method plus lifecycle methods; a function component is just a function that returns JSX. Since the introduction of Hooks in React 16.8, function components can do everything class components can, and they have become the de facto standard.

Function components won for several reasons. They are more concise with less boilerplate — no this binding, no constructor. The this keyword in classes was a persistent source of bugs, especially around event handlers and stale references. Hooks let you extract and reuse stateful logic (custom hooks) in a way that class-based patterns like higher-order components and render props made awkward.

Hooks also colocate related logic. In classes, one concern (say, a subscription) was split across componentDidMount and componentWillUnmount ; with useEffect the setup and cleanup live together. Class components still work and are not deprecated, but new code is written with functions and hooks.

```jsx
// Function component
function Counter() {
  const [n, setN] = useState(0);
  return <button onClick={() => setN(n + 1)}>{n}</button>;
}
```

**Gotcha:** There is no hook equivalent to componentDidCatch yet — error boundaries still require a class component (or a library wrapper). That is the one thing hooks cannot do.

**4. What are props and what are their key characteristics?**

Props (short for properties) are the inputs to a component — the mechanism a parent uses to pass data down to a child. They are the reason components are reusable: the same component renders differently based on the props it receives. The single most important rule is that props are read-only.

component must never mutate its own props. React enforces a one-way (top-down) data flow: data flows from parent to child, never the reverse. If a child needs to communicate upward, the parent passes down a callback function as a prop, and the child calls it. This unidirectional flow makes applications predictable — you can always trace where a piece of data originated.

Props can be any JavaScript value: strings, numbers, objects, arrays, functions, and even other React elements (via children ). Treating props as immutable is what allows React to reason about when to re-render.

```jsx
function Avatar({ user, size = 40 }) {
  return <img src={user.avatarUrl} width={size} alt={user.name} />;
}
// Parent: <Avatar user={me} size={64} />
```

**Gotcha:** Mutating an object or array received via props may appear to work but corrupts shared state and skips re-renders. Always treat props as frozen; create new objects instead of mutating.

**5. What is state and how does useState work?**

State is data that a component owns and can change over time, typically in response to user interaction. Unlike props, which come from the parent, state is local and private to the component. When state changes, React re-renders the component so the UI reflects the new data. The useState hook is how function components declare state.

useState returns an array of exactly two items: the current value and a setter function. You call it with the initial value. Crucially, calling the setter does not immediately change the variable — it schedules a re-render, and on the next render the hook returns the updated value. State updates are asynchronous and may be batched together for performance.

When the new state depends on the previous state, use the functional updater form so you always work from the latest value rather than a stale closure. State must be treated as immutable: replace objects and arrays rather than mutating them, or React will not detect the change.

```jsx
const [count, setCount] = useState(0);
// Correct: functional update avoids stale state
setCount(prev => prev + 1);
// Objects: create a new object, do not mutate
setUser(prev => ({ ...prev, name: "Ada" }));
```

**Gotcha:** Calling setCount(count + 1) three times in one event handler still only increments by one, because all three read the same stale count . The functional form setCount(c => c + 1) fixes this.

**6. What is the difference between props and state?**

This is one of the most common interview questions because it tests whether you understand React's data model. Both are plain JavaScript objects holding data that influences render output, but they serve opposite roles. The key distinction is ownership and mutability.

Props are passed into a component from its parent and are read-only from the component's perspective — the component cannot change them. State is owned and managed by the component itself and can be changed with its setter, triggering a rerender. Props enable configuration and communication between components; state enables interactivity within a component.

useful heuristic: if data comes from above and never changes locally, it is a prop. If it changes over time due to something inside the component (user input, timers, fetches), it is state. Notably, one component's state is frequently passed down as another component's props — that is the whole flow of a React app.

```jsx
// Parent owns state, passes it down as a prop
function Parent() {
  const [text, setText] = useState("");
  return <Child value={text} />; // value is a prop to Child
}
```

**Gotcha:** Do not copy props into state just to store them (e.g. useState(props.value) ) unless you intend to fork it. Doing so causes the "stale state" bug where the copy ignores later prop updates.

**7. What triggers a component to render or re-render?**

Understanding rendering is foundational to reasoning about performance. A "render" is React calling your component function to compute what the UI should look like. There are exactly two reasons a component renders: its initial mount, or a subsequent re-render triggered by a state change.

re-render happens when: (1) the component's own state changes via a setter, (2) its parent re-renders, or (3) a context value it consumes changes. Importantly, when a component re-renders, React by default re-renders all of its descendants regardless of whether their props changed. This surprises people — a parent's state change cascades down the tree.

Rendering is not the same as updating the DOM. React calls your function, produces a new virtual DOM tree, and then reconciles it against the previous one. Only the actual differences are committed to the real DOM. So a re-render is often cheap even when it does not change any pixels. Memoization ( React.memo , useMemo ) can skip rerendering subtrees when it matters for performance.

```jsx
// A parent re-render re-renders Child too, even
// though Child received no changed props.
const Child = React.memo(function Child({ label }) {
  return <span>{label}</span>;
}); // memo skips re-render if props are equal
```

**Gotcha:** Setting state to the same value it already has (by Object.is comparison) causes React to bail out and skip the re-render. But passing a new object literal with the same contents is a different reference and will re-render.

**8. What is the virtual DOM and why does it exist?**

The virtual DOM (VDOM) is a lightweight, in-memory JavaScript representation of the real DOM. When you render, React builds a tree of plain objects describing the UI. On an update, it builds a new tree and diffs it against the previous one — a process called reconciliation — then applies only the minimal set of changes to the real DOM.

It exists because direct DOM manipulation is expensive. Touching the real DOM triggers layout, style recalculation, and repaint. Doing many small mutations, or blowing away and rebuilding large sections, is slow. The VDOM lets React batch and minimize real DOM operations: instead of you hand-optimizing updates, React computes the difference and updates surgically.

Equally important, the VDOM enables the declarative programming model. You describe the target UI for the current state, and React handles the transition from the old UI to the new one. The diffing algorithm uses heuristics (same element type, and keys for lists) to stay roughly O(n) rather than the naive O(n^3) of general tree diffing.

```jsx
// A VDOM node is just a plain object:
{
  type: "button",
  props: { className: "btn", children: "Save" }
}
```

**Gotcha:** The VDOM is not automatically "faster" than optimized vanilla DOM code — it trades a little overhead for developer productivity and predictable performance. Interviewers like candidates who acknowledge this nuance rather than parroting "VDOM is fast."

**9. How does event handling work in React?**

In React you attach event handlers directly in JSX using camelCase props like onClick , onChange , and onSubmit , passing a function (not a string). Under the hood React does not attach a listener to every node; instead it uses a synthetic event system with event delegation at the root container.

SyntheticEvent is React's cross-browser wrapper around the native event. It normalizes behavior so your code works consistently across browsers, and exposes the familiar API ( e.preventDefault() , e.stopPropagation() , e.target ). Since React 17, events are attached to the React root rather than the document, improving compatibility when embedding React in larger pages.

You pass a reference to the handler, not a call: onClick={handleClick} , not onClick={handleClick()} (the latter calls it during render). To pass arguments, wrap it in an arrow function. Be mindful that creating a new arrow function each render is usually fine, but can matter for memoized children.

```jsx
function Button({ id, onRemove }) {
  return (
    <button onClick={(e) => {
      e.preventDefault();
      onRemove(id);
    }}>Remove</button>
  );
}
```

**Gotcha:** Returning false from a React handler does not prevent default behavior like it does in inline HTML. You must call e.preventDefault() explicitly.

**10. What are the common patterns for conditional rendering?**

Because JSX is just JavaScript expressions, you render conditionally using ordinary JS. There is no special template syntax. The main patterns are the ternary operator, logical && short-circuiting, early returns, and assigning JSX to a variable ahead of the return.

Use the ternary ( cond ? a : b ) when you choose between two branches. Use logical AND ( cond && <X /> ) to render something or nothing. For complex logic, compute the element in a variable or return early from the function — this keeps JSX readable. Returning null from a component renders nothing.

The classic bug with && is that if the left operand is 0 (a number), React will render the 0 rather than nothing, because 0 is falsy but is still a valid React child. Guard with a real boolean, e.g. items.length > 0 && ... .

```jsx
function Cart({ items }) {
  if (items.length === 0) return <p>Empty</p>;
  return (
    <div>
      {items.length > 0 && <span>{items.length} items</span>}
    </div>
  );
}
```

**Gotcha:** {count && <Badge />} renders a literal 0 when count is zero. Convert to a boolean: {!!count && <Badge />} or {count > 0 && ...} .

**11. How do you render lists and why do keys matter?**

You render lists by mapping an array of data to an array of elements, typically with Array.prototype.map . React can render an array of elements directly. Each element in such a list must have a unique key prop among its siblings, and this key is central to correct and efficient updates.

Keys give each item a stable identity across renders. During reconciliation, React uses keys to match elements between the old and new lists so it can tell which items were added, removed, moved, or merely reordered — and reuse DOM nodes and component state accordingly. Without stable keys, React falls back to index-based matching, which can misassociate state and cause subtle bugs.

Use a stable, unique ID from your data as the key. Avoid using the array index as a key when the list can reorder, filter, or have items inserted, because the index of an item changes and React will associate the wrong state with the wrong item. Index keys are acceptable only for static lists that never change order.

```jsx
function List({ users }) {
  return (
    <ul>
      {users.map((u) => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  );
}
```

**Gotcha:** Keys must be unique among siblings, not globally. They are also not accessible as a prop inside the component — reading props.key returns undefined. Pass the id separately if you need it.

**12. What is the difference between controlled and uncontrolled components?**

This distinction applies to form inputs. In a controlled component, React state is the single source of truth: the input's value is driven by state via the value prop, and every keystroke fires onChange to update that state. In an uncontrolled component, the DOM itself holds the value, and you read it when needed using a ref.

Controlled inputs give you full control: you can validate, transform, or conditionally disable input on every keystroke, and the state always reflects what the user sees. This is the recommended default. The trade-off is more code and a re-render per keystroke. Uncontrolled inputs are simpler for basic cases and integrate more easily with nonReact code, at the cost of losing React-driven control.

An uncontrolled input can still have an initial value via defaultValue (or defaultChecked ), which sets the DOM's starting value without controlling it thereafter. Mixing a value without an onChange makes the field read-only and triggers a warning.

```jsx
// Controlled
const [name, setName] = useState("");
<input value={name} onChange={(e) => setName(e.target.value)} />
// Uncontrolled
const ref = useRef();
<input defaultValue="hi" ref={ref} />
```

**Gotcha:** Switching an input from uncontrolled to controlled (e.g. value starts as undefined then becomes a string) triggers React's "changing an uncontrolled input to be controlled" warning. Initialize state to "" , not undefined .

**13. How do you build forms with controlled inputs?**

A form in React is typically a set of controlled inputs whose values live in state, plus an onSubmit handler on the <form> element. On submit you call e.preventDefault() to stop the browser's default full-page reload, then process the state values (validate, send to an API, etc.).

For multiple fields, a common pattern is a single state object and a shared change handler that keys off the input's name attribute. This scales better than one useState per field. Each input reads its value from state and writes back through onChange , keeping the form fully in sync with React state.

Attaching the submit handler to the form (rather than the button's click) ensures the form also submits on Enter key, which is important for accessibility. Modern React (19+) also adds form action support and hooks like useActionState , but the controlled-input pattern remains the fundamental technique to know.

```jsx
function SignupForm() {
  const [form, setForm] = useState({ email: "", pass: "" });
  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const onSubmit = (e) => { e.preventDefault(); /* submit */ };
  return (
    <form onSubmit={onSubmit}>
      <input name="email" value={form.email} onChange={onChange} />
    </form>
  );
}
```

**Gotcha:** Computed property names ( [e.target.name] ) require every input to have a matching name attribute. Forgetting it makes the key undefined and silently overwrites the wrong field.

**14. What does "lifting state up" mean and when do you do it?**

Lifting state up is the pattern of moving shared state to the closest common ancestor of the components that need it. When two sibling components must stay in sync or read the same data, you cannot pass data sideways between them — data only flows down. So you hoist the state into their shared parent and pass it down as props.

The parent owns the state and passes both the value and a setter (or a more specific callback) down to each child. Children read the value via props and request changes by invoking the callback. This keeps a single source of truth: there is exactly one place the data lives, which prevents the two copies from diverging.

This is the direct consequence of React's one-way data flow. When lifting causes deeply nested prop-passing ("prop drilling"), that is the signal to reach for Context or a state-management library — but lifting state up is the first, simplest tool and often sufficient.

```jsx
function Parent() {
  const [temp, setTemp] = useState(0);
  return (
    <>
      <Input value={temp} onChange={setTemp} />
      <Display value={temp} />
    </>
  );
}
```

**Gotcha:** Do not lift state higher than necessary. Over-lifting makes the top component a "god component" and causes broad re-renders. Keep state as local as it can be while still shared where needed.

**15. Why does React favor composition over inheritance?**

React strongly recommends composition over class inheritance for reusing code between components. Rather than having a component extend another to share behavior, you compose components by nesting them and passing content through props — most notably the special children prop.

The children prop contains whatever JSX you place between a component's opening and closing tags, letting you build generic "container" components (cards, modals, layouts) that do not know what they will hold. This is more flexible than inheritance: a component can accept multiple slots as props (e.g. header , footer ), compose freely, and avoid rigid class hierarchies.

Meta's team has stated they found no use cases where component inheritance offered advantages over composition and props. If you want to reuse non-visual logic, extract a custom hook or a plain JavaScript function rather than a base class. Composition keeps components loosely coupled and easy to reason about.

```jsx
function Card({ title, children }) {
  return (
    <section className="card">
      <h2>{title}</h2>
      <div>{children}</div>
    </section>
  );
}
// <Card title="Hi"><p>Body</p></Card>
```

**Gotcha:** children can be anything — a string, an array, a function (render prop), or nothing. Do not assume it is always a single element; use React.Children utilities if you must inspect or map over it.

**16. What are Fragments and why are they needed?**

A component must return a single root element, because JSX compiles to a single function call that returns one node. When you want to return several sibling elements without introducing an extra wrapper in the DOM, you use a Fragment. It groups children without adding any node to the rendered output.

The long form is <React.Fragment>...</React.Fragment> , and the shorthand is the empty tag <>...</> . Fragments matter because a wrapping <div> can break CSS layouts like flexbox and grid, or produce invalid HTML — for example, a <td> must be a direct child of a <tr> , so you cannot wrap table cells in a div.

When rendering a list of fragments you need keys, and only the explicit <React.Fragment key={...}> form accepts a key — the shorthand <> cannot take props. Fragments keep the DOM clean and semantic.

```jsx
function Row() {
  return (
    <>
      <td>Name</td>
      <td>Email</td>
    </>
  );
}
```

**Gotcha:** The shorthand <> cannot receive a key . Inside a .map you must switch to <React.Fragment key={id}> .

**17. What is React.StrictMode and what does it do?**

<StrictMode> is a development-only wrapper component that activates extra checks and warnings for its subtree. It renders no visible UI and has zero effect in production builds — it exists purely to help you catch bugs early and write code that will be compatible with future React features.

Its most noticeable behavior is that, in development, React intentionally doubleinvokes certain functions — component render bodies, state updater functions, and effect setup/cleanup. This is deliberate: it surfaces components that are not pure or effects that lack proper cleanup. If double-rendering breaks your component, it has a hidden side effect that should be fixed.

StrictMode also warns about deprecated APIs and legacy patterns (like the old string refs or unsafe lifecycle methods). Because the double-invocation only happens in development, the mysterious "my effect runs twice" behavior developers report is StrictMode doing its job — the fix is to make effects idempotent with cleanup, not to remove StrictMode.

```jsx
import { StrictMode } from "react";
createRoot(el).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

**Gotcha:** The double-render trips people up when they put side effects (fetches, mutations) directly in the render body or without cleanup in an effect. Do not disable StrictMode to hide this — it is a signal of a real impurity.

**18. How do you set default prop values and validate props?**

For function components, the idiomatic way to provide defaults is default parameter values via destructuring: function Btn({ size = "md" }) . This is cleaner than the legacy Component.defaultProps static property, which is deprecated for function components in React 19.

For runtime validation, the classic tool is the prop-types package. You attach a Component.propTypes object declaring the expected type of each prop; in development, React warns in the console when a prop is missing or has the wrong type. PropTypes checks are stripped in production and add no runtime cost there.

In modern codebases, TypeScript has largely replaced PropTypes. TypeScript validates props at compile time using an interface or type for the props, catching mismatches before the code ever runs and providing editor autocompletion. This is strictly more powerful than PropTypes' runtime-only checking, which is why new projects overwhelmingly choose TypeScript.

```jsx
import PropTypes from "prop-types";
function Badge({ label, count = 0 }) {
  return <span>{label}: {count}</span>;
}
Badge.propTypes = {
  label: PropTypes.string.isRequired,
  count: PropTypes.number,
};
```

**Gotcha:** PropTypes only runs in development and only warns — it never blocks rendering. It cannot replace TypeScript's compile-time guarantees, and mixing both is redundant. Pick one (usually TypeScript).

**19. What are the main ways to style React components?**

React is unopinionated about styling, so there are several approaches, each with trade-offs. The most basic is the className prop pointing at plain CSS classes (React uses className instead of class because class is a reserved JavaScript keyword).

CSS Modules scope class names locally to a component by hashing them at build time, preventing global name collisions — you import the styles object and reference styles.button . Inline styles use the style prop, which takes a JavaScript object with camelCased properties ( backgroundColor , not background-color ); good for dynamic values but limited (no media queries or pseudo-selectors).

CSS-in-JS libraries (styled-components, Emotion) let you write component-scoped styles in JS with dynamic props. Utility-first frameworks like Tailwind CSS apply prebuilt classes directly in markup and are hugely popular. The right choice depends on team preference, performance needs (runtime vs zero-runtime), and tooling.

```jsx
import styles from "./Button.module.css";
function Button() {
  return (
    <button
      className={styles.primary}
      style={{ marginTop: 8 }}
    >Go</button>
  );
}
```

**Gotcha:** The style prop takes an object, not a string, hence the double braces: the outer {} is JSX interpolation and the inner {} is the object literal. Numeric values default to pixels for most properties.

**20. What does it mean that components should be pure functions of their props and state?**

React expects your component render logic to be pure: given the same props and state, it must return the same JSX, and it must not produce side effects during rendering. A pure function does not mutate anything outside its scope, does not mutate its inputs, and does not perform I/O while computing its result.

Purity is what makes React's model work. Because rendering is side-effect-free, React is free to call your component whenever it wants, to bail out of renders, to render in the background, or (in Concurrent features) to pause and restart a render. If your render had side effects, these optimizations would produce inconsistent behavior — hence StrictMode's double-render that flushes out impurity.

Side effects belong outside render: event handlers (which run in response to user actions) and the useEffect hook (which runs after commit). The React.memo higherorder component (the modern successor to the class PureComponent ) leverages purity by shallow-comparing props and skipping re-render when they are unchanged.

```jsx
// Pure: same props => same output, no mutation
function Price({ amount, rate }) {
  const total = amount * rate; // derive, do not mutate
  return <span>${total.toFixed(2)}</span>;
}
```

**Gotcha:** Mutating a prop or a module-level variable during render is impure even if it "works." React.memo and Concurrent rendering assume purity — impure components can render stale or duplicated output.
