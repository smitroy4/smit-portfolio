## State & Data

*Total questions: 20*


**41. What is prop drilling, and how do you avoid it?**

Prop drilling is passing data through many intermediate components that do not use it themselves, purely to reach a deeply nested consumer. It is a symptom, not a sin: a prop passed one or two levels is fine and explicit. It becomes a problem when a value threads through five or six layers, coupling components to data they neither read nor care about, making refactors painful and signatures noisy.

The reason it hurts is that every intermediate component now depends on the prop's name and type. Rename or reshape the data and every link in the chain must change. It also obscures intent: reading a mid-level component, you cannot tell what it actually uses versus what it merely forwards.

Solutions, in order of weight: lift state only as high as needed; use component composition so children are passed as children or render props rather than data through props; use React Context for truly cross-cutting concerns like theme or auth; or reach for a state library when the shared state is large and frequently updated. Composition is the most underused fix.

```jsx
// Composition sidesteps drilling: Layout never sees `user`
function App() {
  return (
    <Layout sidebar={<Profile user={user} />}>
      <Dashboard user={user} />
    </Layout>
  );
}
```

**Gotcha:** Reaching for Context or Redux at the first sign of two-level passing is over-engineering. Try composition first; it keeps data flow local and testable without a global scope.

**42. How does the Context API work, from Provider to Consumer?**

Context provides a way to share a value across a subtree without passing it explicitly at each level. You create a context with createContext(defaultValue) , wrap part of the tree in its Provider with a value prop, and any descendant reads that value with the useContext hook. The default value is only used when a component consumes the context with no matching Provider above it.

The mental model is a wormhole: the Provider defines a value at one point in the tree, and consumers anywhere below tap into it directly, skipping the intermediate components entirely. When the Provider's value changes, every consuming component re-renders, regardless of whether an intervening component re-rendered.

The older Context.Consumer render-prop API still exists and is occasionally useful in class components or when you need to consume conditionally in JSX, but in modern function components useContext is the idiomatic choice: cleaner, and it composes with other hooks.

```jsx
const ThemeContext = createContext('light');
function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Toolbar />
    </ThemeContext.Provider>
  );
}
function Button() {
  const theme = useContext(ThemeContext); // "dark"
  return <button className={theme} />;
}
```

**Gotcha:** Consumers read the nearest Provider above them. Nesting Providers of the same context is legal and lets you override the value for a subtree, which surprises people expecting a single global value.

**43. Why does Context cause unnecessary re-renders, and how do you fix it?**

When a Provider's value changes by reference, every component that calls useContext for that context re-renders, even if it only uses a slice of the value that did not change. Context has no selector mechanism: it is all-or-nothing subscription. This is the root of most Context performance complaints.

The most common self-inflicted wound is passing a fresh object literal as value on every render. Because { user, setUser } is a new reference each time, consumers re-render on every parent render even when nothing meaningful changed. Wrap the value in useMemo so its identity is stable between renders.

For genuinely distinct concerns, split one big context into several smaller ones so a change to theme does not re-render auth consumers. If you need selector-style subscriptions where a consumer re-renders only when its slice changes, that is where libraries like Redux (with useSelector ) or Zustand shine, or the use-contextselector library.

```jsx
const value = useMemo(
  () => ({ user, setUser }),
  [user]
);
return <UserContext.Provider value={value}>{children}
</UserContext.Provider>;
```

**Gotcha:** React.memo on a consumer does not stop re-renders triggered by a context value change. memo only guards against parent prop changes; context updates bypass it entirely.

**44. When should you use Context versus a dedicated state management library?**

Context is a dependency-injection tool, not a state manager. It excels at distributing values that are read often but change rarely: theme, locale, the current user, a configured client. When the shared data changes frequently or is read by many components that each care about different slices, Context's lack of selective subscription becomes a performance liability, and that is the signal to reach for a library.

state library like Redux, Zustand, or Jotai adds selectors (subscribe to a slice, rerender only on relevant change), devtools, middleware, and a structured update model. These matter when state is complex, updated from many places, or benefits from timetravel debugging and predictable transitions.

pragmatic rule: start with local useState , promote to Context for low-frequency global values, and adopt a library when you feel Context re-render pain or need async orchestration, caching, or a formal action log. Do not skip straight to Redux for a theme toggle.

**Gotcha:** Context plus useReducer is often pitched as a Redux replacement, but it still lacks selective subscription. It works for small apps yet re-renders all consumers on every dispatch, so it does not scale the way people assume.

**45. Explain Redux's core concepts and its one-way data flow.**

Redux centralizes application state in a single immutable object called the store. You never mutate it directly. Instead you dispatch an action, a plain object describing what happened (with a type and optional payload ), and a reducer, a pure function (state, action) => newState , computes the next state. The store then notifies subscribers, and the UI re-renders.

The value is predictability. Because reducers are pure and state changes only through dispatched actions, every state transition is explicit, replayable, and inspectable. This is what enables time-travel debugging and makes complex state flows auditable: you can log every action and reconstruct exactly how the app reached its current state.

The one-way flow is the discipline that makes it work: UI dispatches action, reducer produces new state, store updates, UI reflects new state. Data never flows backward or sideways. This unidirectional cycle is what keeps large applications from becoming a tangle of two-way bindings.

function counterReducer(state = { count: 0 }, action) {

```jsx
  switch (action.type) {
    case 'INCREMENT':
```

      return { count: state.count + 1 };

```jsx
    default:
      return state;
  }
}
```

**Gotcha:** Reducers must be pure: no API calls, no mutation, no Date.now() or random values. Side effects and impurity break time-travel and make the same action produce different results, defeating Redux's core guarantee.

**46. Why did Redux Toolkit replace classic Redux, and what is createSlice?**

Classic Redux was correct but ceremonial: hand-written action-type constants, action creators, switch-statement reducers, and manual immutable updates with spread operators. This boilerplate discouraged people and invited bugs. Redux Toolkit (RTK) is now the official, recommended way to write Redux, collapsing that ceremony into a fraction of the code.

The centerpiece is createSlice , which generates action creators and action types automatically from the reducer names you define. Crucially, it uses Immer under the hood, so you write what looks like mutating code inside reducers and Immer produces the correct immutable update behind the scenes. That single feature eliminates the most error-prone part of classic Redux.

RTK also bundles configureStore (with sensible defaults, devtools, and thunk middleware preinstalled) and createAsyncThunk for async flows. The result is less code, fewer mistakes, and no loss of Redux's predictability guarantees.

```jsx
const counterSlice = createSlice({
  name: 'counter',
```

  initialState: { count: 0 },

```jsx
  reducers: {
```

    increment: (state) => { state.count += 1; }, // Immer makes this safe

```jsx
  },
});
export const { increment } = counterSlice.actions;
```

**Gotcha:** The "mutating" syntax only works inside createSlice / createReducer where Immer wraps it. Mutate state anywhere else, or return a value and mutate in the same reducer, and you get broken updates.

**47. How do useSelector and useDispatch connect components to the store?**

These are the React-Redux hooks that replaced the older connect higher-order component. useSelector takes a selector function that extracts a slice of state and subscribes the component to just that slice. useDispatch returns the store's dispatch function so the component can send actions.

The key behavior of useSelector is that it re-renders the component only when the selected value changes, compared with a strict-equality ( === ) check by default. This selective subscription is what Context lacks and is a major reason Redux scales. If your selector returns a new object or array literal each call, the reference always differs and you re-render every time, so return primitives or memoize.

useDispatch returns a stable reference, so it is safe to omit from or include in dependency arrays without concern. Together they give a component a precise read/write channel to global state.

```jsx
const count = useSelector((s) => s.counter.count);
const dispatch = useDispatch();
return <button onClick={() => dispatch(increment())}>{count}</button>;
```

**Gotcha:** Returning { a, b } from a selector re-renders on every dispatch because the object is new each time. Use separate useSelector calls, or pass shallowEqual as the second argument, or use RTK's createSelector .

**48. What is Redux middleware, and how do thunks handle async logic?**

Reducers must be pure, so async work like API calls cannot live inside them. Middleware sits between dispatching an action and the moment it reaches the reducer, intercepting each action to log it, transform it, delay it, or perform side effects. It is the official extension point for anything impure.

thunk is the standard async pattern, enabled by redux-thunk (bundled by default in RTK). Instead of dispatching a plain object, you dispatch a function. The thunk middleware detects that the action is a function and calls it with dispatch and getState , letting you run async logic and dispatch real actions when it resolves, typically pending/fulfilled/rejected phases.

RTK's createAsyncThunk formalizes this: you give it a type prefix and an async function, and it auto-dispatches pending , fulfilled , and rejected actions you handle in extraReducers . That covers loading and error states without hand-rolled bookkeeping.

```jsx
const fetchUser = createAsyncThunk(
  'user/fetch',
  async (id) => {
    const res = await fetch(`/api/users/${id}`);
    return res.json();
  }
);
```

**Gotcha:** Thunks work but are verbose for server data. For fetching, caching, and re-fetching, RTK Query or React Query is a better fit than managing loading/error/cache state by hand in Redux.

**49. How do you choose between Redux, Context, and local state?**

Match the tool to the state's scope and change frequency. Local useState is the default for anything a single component or a small subtree owns: form inputs, toggles, hover state. Keeping state local is cheapest, most encapsulated, and easiest to reason about, so lift it out only when you must.

Context fits low-frequency global values read widely but written rarely, such as theme, language, or the authenticated user. It distributes without drilling but re-renders all consumers on change, so it is a poor fit for hot, frequently updated data.

library like Redux earns its keep when state is genuinely global, updated from many places, complex enough to benefit from a formal action log and devtools, or shared across distant parts of the tree with selective subscription. The honest modern caveat: much of what teams once put in Redux is really server state, better handled by React Query, shrinking Redux's remaining role to true client state.

**Gotcha:** Do not globalize state out of habit. Every value in a global store is a value any component can change from anywhere, which erodes the locality that makes bugs easy to trace. Prefer the smallest scope that works.

**50. What are Zustand and Jotai, and how do they differ from Redux?**

Both are lightweight state libraries that trade Redux's ceremony for a minimal API while keeping selective subscription. They exist because Redux, even with Toolkit, can feel heavy for apps that just need a shared store without actions, reducers, and boilerplate.

Zustand uses a single store defined by a hook. You call create with a function that returns state and updater functions, then read slices with a selector inside the hook. Components subscribe only to the slices they select, so re-renders stay narrow, and there is no Provider to wrap the tree. It follows a store-centric model much like Redux but with a fraction of the code.

Jotai takes an atomic, bottom-up approach inspired by Recoil: state is composed of small independent atom s, and components subscribe to individual atoms with useAtom . Derived atoms compute from other atoms. It suits state that is naturally granular and interdependent, where a single big store would feel awkward.

```jsx
// Zustand: store as a hook, no Provider needed
const useStore = create((set) => ({
```

  count: 0,   inc: () => set((s) => ({ count: s.count + 1 })),

```jsx
}));
const count = useStore((s) => s.count);
```

**Gotcha:** These solve client state, not server state. Pairing Zustand or Jotai with React Query (server data) rather than stuffing fetched data into the store is the pattern that keeps both concerns clean.

**51. What is the distinction between client state and server state?**

This distinction reshaped how modern React apps manage data. Client state is owned entirely by the browser: form inputs, modal open/closed, selected tab, theme. It is synchronous, always up to date, and only your app touches it. Server state is data that lives on a remote server, which your app merely borrows a cached copy of: user records, product lists, anything fetched over the network.

The reason this matters is that server state has properties client state never has. It is asynchronous, it can become stale the instant you fetch it because someone else may change it, it is shared across clients, and it needs caching, background re-fetching, and de-duplication. Treating it like client state, by dumping fetched data into Redux or useState , forces you to hand-build all of that machinery.

Recognizing that most of your "global state" is actually cached server state is the insight behind React Query, SWR, and RTK Query. Once separated, client state shrinks to a small amount of genuinely local UI concerns, and the fetching, caching, and syncing is delegated to a purpose-built tool.

**Gotcha:** The classic anti-pattern is copying server data into local state with useEffect plus useState . You then own staleness, refetch, and cache invalidation manually, reinventing a fragile version of what a data library gives you for free.

**52. What problem does React Query (TanStack Query) solve?**

React Query manages server state: fetching, caching, synchronizing, and updating remote data. The problem it solves is that the naive approach, useEffect to fetch plus useState for data, loading, and error, is repetitive and quietly wrong. It ignores caching, refetching, request de-duplication, and background updates, so every screen reinvents them inconsistently.

You wrap a request in useQuery with a query key and a fetch function, and it returns data , isLoading , error , and more, while handling caching by key, de-duplicating concurrent requests for the same key, refetching stale data in the background, and retrying failures. Mutations go through useMutation .

The result is dramatically less code and a better UX: cached data shows instantly while fresh data loads behind the scenes, multiple components requesting the same key share one request, and the cache stays coherent. It replaces a large amount of what teams previously built in Redux for data fetching.

```jsx
const { data, isLoading, error } = useQuery({
  queryKey: ['user', id],
  queryFn: () => fetch(`/api/users/${id}`).then((r) => r.json()),
});
```

**Gotcha:** The query key is the cache identity. Forgetting to include a variable like id in the key means different requests share one cache entry, so you see stale or wrong data when the variable changes.

**53. How do caching, staleness, and invalidation work in React Query?**

React Query caches each query's result under its key and governs freshness with two timers. staleTime is how long data is considered fresh; while fresh, it is served from cache with no refetch. Once it passes staleTime it becomes stale and eligible for background refetching on triggers like window refocus, remount, or reconnect. The default staleTime is 0, so data is stale immediately unless you raise it.

Separately, gcTime (formerly cacheTime ) controls how long an unused query's data lingers in memory after no component is using it, before garbage collection. Staleness governs refetching; gcTime governs eviction. Conflating the two is a common source of confusion.

Invalidation is the explicit push mechanism: after a mutation you call queryClient.invalidateQueries with the affected key, marking those queries stale and triggering a refetch so the UI reflects the server's new truth. This keeps the cache coherent after writes without manually patching cached values.

```jsx
const qc = useQueryClient();
useMutation({
  mutationFn: updateUser,
  onSuccess: () => qc.invalidateQueries({ queryKey: ['user'] }),
});
```

**Gotcha:** Leaving staleTime at 0 can cause surprisingly frequent refetches on every focus and remount. Tune it to your data's real volatility; user profiles tolerate minutes, a live price feed does not.

**54. What are optimistic updates, and how do you implement them safely?**

An optimistic update applies a change to the UI immediately, before the server confirms it, assuming the request will succeed. It makes an app feel instant: a liked post fills in the moment you click rather than after a network round trip. The tradeoff is that you must handle the case where the server actually rejects the change.

The safe pattern has three phases. Before mutating, cancel in-flight refetches and snapshot the current cache so you can restore it. Then optimistically write the expected new value into the cache. If the mutation fails, roll back to the snapshot; on settle, invalidate the query to resync with the server's authoritative state. React Query exposes exactly these hooks: onMutate , onError , and onSettled .

The reason rollback is non-negotiable is that without it a failed request leaves the UI showing a change that never persisted, silently lying to the user. Optimism must always be paired with a correction path.

```jsx
useMutation({
  mutationFn: toggleLike,
  onMutate: async (next) => {
    await qc.cancelQueries({ queryKey: ['post'] });
    const prev = qc.getQueryData(['post']);
    qc.setQueryData(['post'], next);
    return { prev }; // context for rollback
  },
  onError: (e, v, ctx) => qc.setQueryData(['post'], ctx.prev),
});
```

**Gotcha:** Skipping the pre-mutation cancelQueries lets an in-flight background refetch resolve after your optimistic write and overwrite it with stale server data, undoing the update mid-flight.

**55. Why must React state be immutable, and how do you update nested state?**

React decides whether to re-render by comparing the previous and next state references with Object.is , a shallow check. If you mutate an object or array in place, its reference does not change, so React sees no difference and skips the render, even though the contents changed. Immutability, creating a new object/array for every change, is what makes change detection work.

To update, you produce a copy with the change applied rather than editing the original. For flat state this is a spread. For nested state you must copy every level along the path to the changed value, because a shallow copy of the outer object still shares references to inner objects, and mutating those inner objects is still a mutation.

Deep nesting makes manual spreading verbose and bug-prone, which is why Immer exists: you write mutating-looking code against a draft and Immer produces the correct immutable copy. Redux Toolkit builds this in. A flatter state shape also reduces the depth you have to spread through.

```jsx
// Update nested value immutably
setUser((u) => ({
  ...u,
  address: { ...u.address, city: 'Berlin' },
}));
// Arrays: map/filter/concat, never push/splice on state
setItems((items) => items.map((i) =>
```

  i.id === id ? { ...i, done: true } : i

```jsx
));
```

**Gotcha:** const copy = { ...state } is only a shallow copy. copy.nested.x = 1 mutates the original's nested object because both share the same reference, a silent bug that skips renders.

**56. What does it mean to normalize state, and why do it?**

Normalizing state means storing collections as a lookup table keyed by id plus an array of ids for ordering, rather than as nested arrays of full objects. It borrows the idea from database design: each entity lives in exactly one place, referenced elsewhere by id. This avoids duplication and the inconsistencies duplication breeds.

The problem it solves appears when the same entity is nested in multiple places, say a user embedded in several posts. Update that user and you must find and patch every copy, and any you miss goes stale. With a normalized byId map, the entity exists once, so an update touches a single location and every reference sees it.

Normalization also makes lookups O(1) by id instead of scanning an array, and simplifies immutable updates because you change one keyed entry rather than mapping over a nested tree. Redux Toolkit's createEntityAdapter provides this shape and its reducers out of the box.

```jsx
// Normalized shape
{
  byId: {
    'a1': { id: 'a1', title: 'Hello' },
    'a2': { id: 'a2', title: 'World' },
  },
  allIds: ['a1', 'a2'],
}
```

**Gotcha:** Do not normalize everything reflexively. For small, self-contained, non-shared data, nested arrays are simpler and clearer. Normalization pays off mainly with relational, shared, or frequently updated entities.

**57. What is derived state, and how do you avoid redundant state?**

Derived state is any value you can compute from existing state or props rather than storing separately. The guiding principle is that state should hold the minimal source of truth; anything calculable from it should be calculated during render, not duplicated into its own state variable. Redundant state is the root of a whole class of sync bugs.

The failure mode is storing a full name alongside first and last, or a filtered list alongside the raw list plus filter. Now two things must be kept in step, and the moment one updates without the other, they diverge and the UI shows contradictory data. Deriving on render makes divergence impossible because there is only one source.

Just compute the value inline during render. If the computation is genuinely expensive and the inputs change rarely, wrap it in useMemo as a performance optimization, but that is caching a derivation, not storing state. Reserve useState for values that cannot be derived.

```jsx
// Redundant: fullName can drift from first/last
const [fullName, setFullName] = useState(''); // avoid
// Derived: single source of truth
const fullName = `${first} ${last}`;
const visible = items.filter((i) => i.active);
```

**Gotcha:** Syncing props into state with useEffect to "derive" a value is an anti-pattern: it renders once with stale data, then again after the effect. Compute during render instead of mirroring props into state.

**58. React Hook Form versus controlled state: which and why?**

Fully controlled forms bind every input's value to state and update it on every keystroke via onChange . This is fine for a few fields, but at scale each keystroke rerenders the whole form, and you hand-manage validation, errors, and touched state. The re-render cost and boilerplate grow with field count.

React Hook Form takes an uncontrolled approach: it registers inputs with refs and reads their values directly from the DOM, so typing does not trigger React re-renders for the whole form. This keeps large forms fast and cuts boilerplate, since validation, error tracking, and submission are handled by the library. You subscribe to only the pieces you need.

Choose controlled state when you need React to react to every keystroke, for example live cross-field computation or tightly coupled UI. Choose React Hook Form (or similar) for larger forms where performance and reduced boilerplate matter, which is most realworld forms. It also integrates schema validation via resolvers like Zod or Yup.

```jsx
const { register, handleSubmit, formState: { errors } } = useForm();
return (
  <form onSubmit={handleSubmit(onValid)}>
```

    <input {...register('email', { required: true })} />

```jsx
    {errors.email && <span>Required</span>}
  </form>
);
```

**Gotcha:** Mixing paradigms trips people up: passing value without onChange makes an input read-only and logs a warning. With React Hook Form, use register (uncontrolled) or the Controller wrapper for controlled components, not raw value .

**59. How do you debounce and throttle input in React, and what is the difference?**

Both limit how often a rapidly-firing handler actually does expensive work, but differently. Debouncing waits until activity stops: it fires only after a quiet gap of N milliseconds, so a search box triggers one request after the user pauses typing, not on every keystroke. Throttling instead fires at most once per interval regardless of how many events arrive, which suits continuous streams like scroll or resize.

In React the subtlety is that a naive debounced function recreated on every render loses its internal timer, so it never actually debounces. You must keep the debounced function stable across renders with useMemo / useRef , or debounce a value with a useEffect plus setTimeout and cleanup.

The value-debounce pattern is the most idiomatic: hold the raw input in state, and in an effect start a timer to copy it into a debounced value, clearing the timer on each change so only the final value after the pause survives. Downstream effects then depend on the debounced value.

function useDebounced(value, delay = 300) {

```jsx
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id); // reset on each change
  }, [value, delay]);
  return v;
}
```

**Gotcha:** Defining debounce(fn) inline in the component body creates a brand-new debounced function every render, so its timer never persists and nothing is actually debounced. Stabilize it with a ref or memo.

**60. What do error boundaries catch, and what do they not catch?**

An error boundary is a component that catches JavaScript errors thrown during rendering, in lifecycle methods, and in constructors of the components below it, then renders a fallback UI instead of letting the whole React tree unmount. Without one, an uncaught render error crashes the entire app to a blank screen, so boundaries contain failures to a section.

They are still class components: you implement static getDerivedStateFromError to render the fallback and componentDidCatch to log the error. There is no hook equivalent yet, so people typically use a small class boundary or the react-errorboundary library, which wraps this in a friendlier API.

Crucially, boundaries do not catch errors in event handlers, in asynchronous code like setTimeout or promise callbacks, during server-side rendering, or thrown by the boundary itself. Those fall outside React's render pipeline, so you handle them with ordinary try/catch . That gap surprises people who expect a boundary to catch everything.

```jsx
class ErrorBoundary extends React.Component {
```

  state = { hasError: false };

```jsx
  static getDerivedStateFromError() {
```

    return { hasError: true };

```jsx
  }
  componentDidCatch(error, info) { logError(error, info); }
  render() {
    return this.state.hasError
      ? <Fallback />
      : this.props.children;
  }
}
```

**Gotcha:** Event-handler errors are the big blind spot. A click handler that throws is not caught by any boundary; wrap it in try/catch and set error state yourself, or route it through react-error-boundary 's reset API.
