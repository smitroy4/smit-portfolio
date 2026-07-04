## From Memory Layout to Advanced Patterns, Rotation to Matrix Traversal

> *The array is the first data structure every programmer meets, and the last one they ever fully outgrow. Nearly every other structure in this series — stacks, queues, heaps, hash tables — is either built directly on top of an array or borrows its core idea of contiguous, indexed memory. This guide starts at "what actually happens in RAM when you write `int[] arr = new int[5]`" and builds all the way up to the algorithmic patterns — sliding window, Kadane's, two pointers, prefix sums — that show up in nearly every array-based interview question you'll ever face.*

---

<a id="s1"></a>
## 1. What is an Array?

An **array** is a collection of elements of the same type, stored in **contiguous memory locations**, and accessed using a single shared name plus a numeric index. Think of it as a row of identical mailboxes bolted together in a single block — each mailbox has the same size, sits right next to its neighbor, and is identified by a number (0, 1, 2, 3...) rather than a name.

```java
int[] marks = {85, 90, 78, 92, 88};
```

This single line creates five contiguous `int` slots in memory, all reachable through the name `marks` and an index from `0` to `4`. Every other property of arrays — fast access, awkward insertion, fixed size — flows directly from this one design decision: elements sit next to each other in memory, in order.

---

<a id="s2"></a>
## 2. Why Arrays Are Important

Arrays matter because they are the **substrate** almost every other data structure is built on top of. A dynamic array (`ArrayList`) is an array with automatic resizing bolted on. A stack and a queue can both be implemented directly on an array. A heap is an array with an implicit tree structure layered over its indices. A hash table's buckets are, underneath, an array. Understanding arrays deeply — not just "how to declare one" but *why* they behave the way they do — is what makes every subsequent data structure in this series make sense instead of feeling like a new set of arbitrary rules.

---

<a id="s3"></a>
## 3. Characteristics of Arrays

- **Fixed size** (in most languages, including Java) — the size is decided at creation and cannot grow or shrink afterward.
- **Homogeneous** — all elements must be the same type.
- **Contiguous memory** — elements are stored back-to-back, with no gaps.
- **Indexed access** — every element has a numeric position, starting at 0 in Java.
- **Random access** — any element can be reached directly in O(1) time, without walking through the others first.
- **Zero-indexed in Java** — the first element is at index `0`, the last at `length - 1`.

---

<a id="s4"></a>
## 4. How Arrays Are Stored in Memory

When you write `int[] arr = new int[5]`, the JVM reserves one continuous block of memory on the heap large enough to hold five `int` values back to back. The variable `arr` itself doesn't hold the data — it holds a **reference** (a memory address) pointing to the start of that block. This is why arrays in Java are objects, and why `arr.length` works — the array object stores its own size as metadata alongside the data block.
Memory (heap):
Address: 1000  1004  1008  1012  1016
Value:    85    90    78    92    88
Index:     0     1     2     3     4

Contiguity is the entire reason array access is O(1): the JVM doesn't need to search for element 3 — it calculates exactly where element 3 lives.

---

<a id="s5"></a>
## 5. Memory Address Calculation

![Array Memory Address Layout](/images/blogs/internals/array-memory-address-layout.png)

The formula behind O(1) access:
address(index) = base_address + (index * size_of_each_element)

For the array above, with `base_address = 1000` and `int` occupying 4 bytes: `address(3) = 1000 + (3 * 4) = 1012`. This single arithmetic operation — no loop, no search — is why `arr[3]` is instant regardless of whether the array has 10 elements or 10 million.

---

<a id="s6"></a>
## 6. Static Arrays vs Dynamic Arrays

A **static array** has a fixed size, decided at creation, that never changes — Java's `int[]` is a static array. A **dynamic array** (Java's `ArrayList`) *appears* to grow and shrink, but internally it's still a static array that gets silently replaced with a bigger one behind the scenes whenever it fills up (covered in depth in Chapter 26).

| | Static Array | Dynamic Array (`ArrayList`) |
|---|---|---|
| Size | Fixed at creation | Grows/shrinks automatically |
| Underlying storage | Contiguous block | Contiguous block, replaced on growth |
| Access speed | O(1) | O(1) |
| Insert at end | Not possible (full) | Amortized O(1) |
| Type | Primitives or objects | Objects only (autoboxed) |

---

<a id="s7"></a>
## 7. One-Dimensional Arrays

The simplest form — a single row of elements, indexed by one number. Every example so far (`marks`) is a 1D array.

---

<a id="s8"></a>
## 8. Two-Dimensional Arrays

A 2D array is an array of arrays — conceptually a grid with rows and columns, indexed by two numbers.

```java
int[][] grid = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
};
System.out.println(grid[1][2]); // 6 — row 1, column 2
```

In Java, this is genuinely an array of array references — `grid[0]`, `grid[1]`, `grid[2]` are each independent 1D `int[]` arrays, which is *why* jagged arrays (Chapter 10) are possible.

---

<a id="s9"></a>
## 9. Multi-Dimensional Arrays

Java supports arrays of arbitrary dimension — 3D, 4D, and beyond — using the same array-of-arrays idea recursively.

```java
int[][][] cube = new int[3][3][3]; // a 3x3x3 cube
cube[0][1][2] = 42;
```

Beyond 3D, these become rare in practice — most real-world "multi-dimensional" data (images, tensors) is better modeled with specialized libraries, but understanding the underlying array-of-arrays concept still applies.

---

<a id="s10"></a>
## 10. Jagged Arrays

A **jagged array** is a 2D (or higher) array where each row can have a *different* length — unlike a true rectangular matrix. Because Java's 2D array is really an array of independent 1D array references, jagged arrays are natural to create:

```java
int[][] jagged = new int[3][];
jagged[0] = new int[]{1};
jagged[1] = new int[]{1, 2, 3};
jagged[2] = new int[]{1, 2};
```

Useful for representing data like adjacency lists in graphs, where each node has a different number of neighbors.

---

<a id="s11"></a>
## 11. Declaring Arrays

```java
int[] a;        // preferred Java style
int a[];        // legal, but C-style — avoid for readability
```

Declaring only creates the *reference variable* — no memory is allocated yet; `a` is `null` until you assign it an actual array.

---

<a id="s12"></a>
## 12. Initializing Arrays

```java
int[] a = new int[5];             // default-initialized: all zeros
int[] b = {10, 20, 30};           // array literal
int[] c = new int[]{10, 20, 30};  // equivalent, explicit form
```

Java automatically fills a newly allocated array with default values — `0` for numeric types, `false` for `boolean`, `null` for object references.

---

<a id="s13"></a>
## 13. Accessing Elements

```java
int value = marks[2]; // reads the element at index 2 → 78
```

Direct, O(1), calculated exactly as described in Chapter 5 — no traversal involved.

---

<a id="s14"></a>
## 14. Updating Elements

```java
marks[2] = 100; // overwrites index 2 in place
```

Because arrays store elements by value at fixed positions, updating is also O(1) — you're writing directly to a known memory address.

---

<a id="s15"></a>
## 15. Traversing an Array

```java
// Index-based — use when you need the position
for (int i = 0; i < marks.length; i++) {
    System.out.println(marks[i]);
}

// Enhanced for-each — cleaner when you only need the value
for (int mark : marks) {
    System.out.println(mark);
}
```

---

<a id="s16"></a>
## 16. Array Indexing

Java arrays are always **zero-indexed** — the first element is `array[0]`, the last valid index is `array.length - 1`. This trips up many beginners coming from 1-indexed everyday counting; internalize it early since it underlies nearly every off-by-one bug you'll ever debug.

---

<a id="s17"></a>
## 17. Array Bounds and Index Out of Range

Accessing an index outside `[0, length - 1]` throws `ArrayIndexOutOfBoundsException` at runtime — Java does not silently return garbage or wrap around.

```java
int[] arr = {1, 2, 3};
System.out.println(arr[5]); // throws ArrayIndexOutOfBoundsException
```

This is deliberately loud and immediate — a design choice that trades a small runtime check on every access for catching bugs early rather than corrupting adjacent memory silently (as can happen in lower-level languages like C).

---

<a id="s18"></a>
## 18. Time and Space Complexity of Array Operations

| Operation | Time Complexity | Notes |
|---|---|---|
| Access by index | O(1) | Direct address calculation |
| Search (unsorted) | O(n) | Must check every element |
| Search (sorted, binary search) | O(log n) | Requires sorted data |
| Insert at end (if space exists) | O(1) | No shifting needed |
| Insert at beginning/middle | O(n) | Must shift subsequent elements |
| Delete from end | O(1) | No shifting needed |
| Delete from beginning/middle | O(n) | Must shift subsequent elements |
| Space | O(n) | n elements, contiguous |

---

<a id="s19"></a>
## 19. Linear Search

Check every element one by one until a match is found or the array ends.

```java
public static int linearSearch(int[] arr, int target) {
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}
```

O(n) time, O(1) space — the only option when the array isn't sorted.

---

<a id="s20"></a>
## 20. Binary Search on Arrays

Requires a **sorted** array. Repeatedly halve the search space by comparing the middle element to the target.

```java
public static int binarySearch(int[] arr, int target) {
    int low = 0, high = arr.length - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;   // avoids overflow vs (low+high)/2
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}
```

O(log n) time — for a 1-million-element array, binary search needs at most ~20 comparisons versus up to 1 million for linear search.

---

<a id="s21"></a>
## 21. Insertion in an Array

Inserting into the *middle* of a static array requires shifting every element after the insertion point one position to the right first, then a resize if the array is full (see Chapter 23).

```java
public static int[] insertAt(int[] arr, int index, int value) {
    int[] result = new int[arr.length + 1];
    System.arraycopy(arr, 0, result, 0, index);
    result[index] = value;
    System.arraycopy(arr, index, result, index + 1, arr.length - index);
    return result;
}
```

O(n) — the shifting dominates the cost.

---

<a id="s22"></a>
## 22. Deletion from an Array

Similarly, deleting from the middle requires shifting all subsequent elements one position left to close the gap.

```java
public static int[] deleteAt(int[] arr, int index) {
    int[] result = new int[arr.length - 1];
    System.arraycopy(arr, 0, result, 0, index);
    System.arraycopy(arr, index + 1, result, index, arr.length - index - 1);
    return result;
}
```

O(n) — same shifting cost as insertion.

---

<a id="s23"></a>
## 23. Resizing an Array

Because Java arrays have a fixed size, "resizing" really means allocating a brand-new, larger array and copying the old contents over.

```java
int[] old = {1, 2, 3};
int[] resized = java.util.Arrays.copyOf(old, 6); // {1, 2, 3, 0, 0, 0}
```

This copy operation is O(n) — the cost that `ArrayList` amortizes cleverly, as explained in Chapter 26.

---

<a id="s24"></a>
## 24. Copying Arrays

```java
int[] a = {1, 2, 3};
int[] b = a.clone();                                   // shallow copy
int[] c = java.util.Arrays.copyOf(a, a.length);         // shallow copy
System.arraycopy(a, 0, c, 0, a.length);                 // manual, fastest for large arrays
```

---

<a id="s25"></a>
## 25. Shallow Copy vs Deep Copy

A **shallow copy** duplicates the array structure but, for arrays of objects, copies only the *references* — both arrays end up pointing to the same underlying objects. A **deep copy** duplicates the objects themselves too, so the two arrays are fully independent.

```java
// Shallow copy — both arrays reference the SAME Employee objects
Employee[] original = {new Employee("Ravi")};
Employee[] shallow = original.clone();
shallow[0].setName("Changed"); // also changes original[0]!

// Deep copy — genuinely independent objects
Employee[] deep = new Employee[original.length];
for (int i = 0; i < original.length; i++) {
    deep[i] = new Employee(original[i].getName()); // new object each time
}
```

For arrays of primitives (`int[]`, `double[]`), shallow and deep copy are identical since primitives are copied by value automatically.

---

<a id="s26"></a>
## 26. Dynamic Array Implementation

This is the mechanism behind `ArrayList`. Internally, it holds a fixed-size backing array. When an insert would overflow that array, it allocates a new array — typically **double the size** — and copies everything over.

```java
class SimpleDynamicArray {
    private int[] data;
    private int size = 0;

    public SimpleDynamicArray() {
        data = new int[4]; // initial capacity
    }

    public void add(int value) {
        if (size == data.length) {
            data = java.util.Arrays.copyOf(data, data.length * 2); // grow
        }
        data[size++] = value;
    }

    public int get(int index) {
        if (index < 0 || index >= size) throw new IndexOutOfBoundsException();
        return data[index];
    }
}
```

Because doubling happens rarely relative to the number of cheap O(1) inserts between resizes, the **amortized** cost of `add()` is O(1) even though any single call might occasionally trigger an O(n) resize.

---

<a id="s27"></a>
## 27. ArrayList / Vector / Dynamic Arrays in Different Languages

| Language | Dynamic Array Type |
|---|---|
| Java | `ArrayList<T>` |
| C++ | `std::vector<T>` |
| Python | `list` (built-in, dynamic by default) |
| JavaScript | `Array` (dynamic by default) |
| C# | `List<T>` |

All of them share the same core mechanism described in Chapter 26 — a backing static array that doubles (or grows by some factor) on overflow.

```java
List<Integer> list = new ArrayList<>();
list.add(10);
list.add(20);
list.remove(0); // shifts remaining elements left, O(n)
```

---

<a id="s28"></a>
## 28. Prefix Sum Arrays

A **prefix sum array** stores, at each index `i`, the sum of all elements from index `0` to `i`. Once built, it answers "what's the sum of elements from index L to R?" in O(1) instead of O(n).

```java
public static int[] buildPrefixSum(int[] arr) {
    int[] prefix = new int[arr.length];
    prefix[0] = arr[0];
    for (int i = 1; i < arr.length; i++) {
        prefix[i] = prefix[i - 1] + arr[i];
    }
    return prefix;
}

// range sum [L, R] inclusive
public static int rangeSum(int[] prefix, int L, int R) {
    return L == 0 ? prefix[R] : prefix[R] - prefix[L - 1];
}
```

This is one of the highest-leverage patterns in array problems — O(n) preprocessing turns many repeated O(n) range queries into O(1) each.

---

<a id="s29"></a>
## 29. Difference Arrays

The mirror image of prefix sums: instead of answering range-sum queries, difference arrays answer **range-update** queries efficiently. To add a value `v` to every element in range `[L, R]`, you only touch two positions:

```java
int[] diff = new int[n + 1];
diff[L] += v;
diff[R + 1] -= v;
// After all updates, take the prefix sum of `diff` to get the final array
```

This turns what would be O(n) per update into O(1) per update, with a single O(n) pass at the end to materialize the result.

---

<a id="s30"></a>
## 30. Frequency Arrays

A frequency array (or "count array") tracks how many times each value appears, typically indexed by the value itself when the range of values is small and known.

```java
int[] freq = new int[101]; // for values 0–100
for (int num : arr) {
    freq[num]++;
}
```

---

<a id="s31"></a>
## 31. Counting Arrays

Closely related to frequency arrays — used as the backbone of **counting sort**, an O(n + k) sorting algorithm for small, bounded integer ranges, and for problems like finding the mode or checking duplicates without hashing overhead.

---

<a id="s32"></a>
## 32. Cumulative Sum Arrays

Another name for prefix sums (Chapter 28) — the running total as you move left to right through the array. Sometimes distinguished from "prefix sum" only by convention in certain textbooks; functionally identical.

---

<a id="s33"></a>
## 33. Sliding Window Technique

Maintains a "window" (a contiguous subrange) over the array and slides it forward, updating a running result incrementally instead of recomputing from scratch — turning many O(n²) brute-force subarray problems into O(n).

```java
// Maximum sum of any subarray of size k
public static int maxSumWindow(int[] arr, int k) {
    int windowSum = 0;
    for (int i = 0; i < k; i++) windowSum += arr[i];

    int maxSum = windowSum;
    for (int i = k; i < arr.length; i++) {
        windowSum += arr[i] - arr[i - k]; // slide: add new, remove old
        maxSum = Math.max(maxSum, windowSum);
    }
    return maxSum;
}
```

---

<a id="s34"></a>
## 34. Two Pointer Technique

![Sliding Window and Two Pointer Visualization](/images/blogs/internals/sliding-window-two-pointer-visual.png)


Uses two indices moving through the array — either toward each other (from both ends) or in the same direction at different speeds — to avoid nested loops.

```java
// Check if a sorted array has two numbers that sum to target
public static boolean hasPairWithSum(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    while (left < right) {
        int sum = arr[left] + arr[right];
        if (sum == target) return true;
        else if (sum < target) left++;
        else right--;
    }
    return false;
}
```

O(n) instead of the O(n²) nested-loop brute force — this pattern relies on the array being sorted so that moving a pointer has a predictable effect on the sum.

---

<a id="s35"></a>
## 35. Kadane's Algorithm

Solves "maximum sum contiguous subarray" in O(n). The core insight: at each position, decide whether to extend the previous subarray or start a fresh one from here — whichever gives a bigger sum.

```java
public static int maxSubArraySum(int[] arr) {
    int maxEndingHere = arr[0];
    int maxSoFar = arr[0];
    for (int i = 1; i < arr.length; i++) {
        maxEndingHere = Math.max(arr[i], maxEndingHere + arr[i]);
        maxSoFar = Math.max(maxSoFar, maxEndingHere);
    }
    return maxSoFar;
}
```

---

<a id="s36"></a>
## 36. Dutch National Flag Algorithm

Sorts an array of three distinct values (classically 0s, 1s, 2s) in a single O(n) pass using three pointers — named after the three-band Dutch flag, since the algorithm partitions the array into three contiguous color bands.

```java
public static void sortColors(int[] arr) {
    int low = 0, mid = 0, high = arr.length - 1;
    while (mid <= high) {
        if (arr[mid] == 0) {
            swap(arr, low++, mid++);
        } else if (arr[mid] == 1) {
            mid++;
        } else {
            swap(arr, mid, high--);
        }
    }
}

private static void swap(int[] arr, int i, int j) {
    int temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
}
```

---

<a id="s37"></a>
## 37. Moore's Voting Algorithm

Finds the **majority element** (appearing more than n/2 times) in O(n) time and O(1) space, without sorting or hashing. The intuition: pair off a "candidate" against every other value; if they cancel out, the candidate resets.

```java
public static int findMajorityElement(int[] arr) {
    int candidate = arr[0], count = 1;
    for (int i = 1; i < arr.length; i++) {
        if (count == 0) {
            candidate = arr[i];
            count = 1;
        } else if (arr[i] == candidate) {
            count++;
        } else {
            count--;
        }
    }
    return candidate; // verify separately if majority is not guaranteed to exist
}
```

---

<a id="s38"></a>
## 38. Boyer-Moore Majority Vote

![Kadane, Dutch National Flag and Moore Voting](/images/blogs/internals/kadane-dutch-flag-moore-voting.png)


The formal name for the algorithm in Chapter 37 — "Moore's Voting Algorithm" and "Boyer-Moore Majority Vote" refer to the same technique, credited jointly to Robert Boyer and J Strother Moore.

---

<a id="s39"></a>
## 39. Binary Search on Answer

A powerful generalization of binary search: instead of searching for a value *inside* the array, you binary search over the space of *possible answers* to a problem, using a feasibility check at each guess. Common in "minimize the maximum" or "maximize the minimum" style problems (e.g., "minimum days to make m bouquets," "split array to minimize the largest sum").

```java
// Skeleton: binary search over possible answer values
int low = minPossibleAnswer, high = maxPossibleAnswer;
while (low < high) {
    int mid = low + (high - low) / 2;
    if (isFeasible(mid)) {
        high = mid;       // try for a smaller/better answer
    } else {
        low = mid + 1;
    }
}
// low is now the optimal answer
```

---

<a id="s40"></a>
## 40. Merge Intervals

Given a collection of intervals, merge all overlapping ones. The standard approach: sort by start time, then sweep through, merging whenever the current interval overlaps the previous one.

```java
public static int[][] mergeIntervals(int[][] intervals) {
    java.util.Arrays.sort(intervals, (a, b) -> a[0] - b[0]);
    List<int[]> merged = new ArrayList<>();
    for (int[] interval : intervals) {
        if (merged.isEmpty() || merged.get(merged.size() - 1)[1] < interval[0]) {
            merged.add(interval);
        } else {
            merged.get(merged.size() - 1)[1] =
                Math.max(merged.get(merged.size() - 1)[1], interval[1]);
        }
    }
    return merged.toArray(new int[0][]);
}
```

---

<a id="s41"></a>
## 41. Sweep Line Basics

A technique for interval and geometry problems: imagine a vertical line sweeping across the number line, processing "events" (interval starts and ends) in sorted order, and maintaining a running count or state as it passes each event. Merge intervals (Chapter 40) is a simple sweep line application; more advanced versions handle problems like "maximum number of overlapping intervals at any point."

---

<a id="s42"></a>
## 42. Coordinate Compression

When values in an array are large or sparse (e.g., coordinates up to 10^9) but you only care about their *relative order*, coordinate compression maps them to a small, dense range (0, 1, 2, ...) based on their sorted rank — letting you use array-indexed structures (like a frequency array or Fenwick tree) that would otherwise need impossibly large arrays.

```java
int[] sorted = arr.clone();
java.util.Arrays.sort(sorted);
Map<Integer, Integer> rank = new HashMap<>();
int r = 0;
for (int val : sorted) {
    if (!rank.containsKey(val)) rank.put(val, r++);
}
// rank.get(x) now gives x's compressed index
```

---

<a id="s43"></a>
## 43. Monotonic Array Concepts

A **monotonic array** is either entirely non-decreasing or entirely non-increasing. Recognizing monotonicity unlocks powerful techniques: binary search only works correctly on sorted (monotonic) data, and a **monotonic stack/deque** (an array-backed structure that maintains increasing or decreasing order as you push/pop) is the standard tool behind Next Greater Element (Chapter 66) and similar problems.

---

<a id="s44"></a>
## 44. Rotating an Array

Shifting every element by `k` positions, with elements that fall off one end reappearing at the other — conceptually treating the array as circular.

---

<a id="s45"></a>
## 45. Reversing an Array

```java
public static void reverse(int[] arr, int start, int end) {
    while (start < end) {
        int temp = arr[start];
        arr[start] = arr[end];
        arr[end] = temp;
        start++;
        end--;
    }
}
```

Reversal is the building block for the elegant O(n) time, O(1) space rotation technique in Chapter 48.

---

<a id="s46"></a>
## 46. Left Rotation

Shifts elements to the left by `k`, with the first `k` elements wrapping around to the end. `[1,2,3,4,5]` rotated left by 2 → `[3,4,5,1,2]`.

---

<a id="s47"></a>
## 47. Right Rotation

Shifts elements to the right by `k`, with the last `k` elements wrapping around to the front. `[1,2,3,4,5]` rotated right by 2 → `[4,5,1,2,3]`.

---

<a id="s48"></a>
## 48. Cyclic Rotation

The elegant **reversal algorithm** rotates an array in O(n) time and O(1) extra space using three reversals — no auxiliary array needed:

```java
public static void rotateLeft(int[] arr, int k) {
    int n = arr.length;
    k = k % n;
    reverse(arr, 0, k - 1);
    reverse(arr, k, n - 1);
    reverse(arr, 0, n - 1);
}
```

---

<a id="s49"></a>
## 49. Rearranging Positive and Negative Numbers

A partitioning problem: rearrange the array so negatives come before positives (or alternate them), typically in a single pass using a variant of the Dutch National Flag idea or two pointers.

---

<a id="s50"></a>
## 50. Moving Zeroes

Move all zeroes in an array to the end while preserving the relative order of non-zero elements, in-place.

```java
public static void moveZeroes(int[] arr) {
    int insertPos = 0;
    for (int num : arr) {
        if (num != 0) arr[insertPos++] = num;
    }
    while (insertPos < arr.length) {
        arr[insertPos++] = 0;
    }
}
```

---

<a id="s51"></a>
## 51. Removing Duplicates

For a **sorted** array, duplicates can be removed in-place in O(n) using two pointers — one scanning, one marking the position of the next unique element.

```java
public static int removeDuplicates(int[] arr) {
    if (arr.length == 0) return 0;
    int uniqueIndex = 0;
    for (int i = 1; i < arr.length; i++) {
        if (arr[i] != arr[uniqueIndex]) {
            arr[++uniqueIndex] = arr[i];
        }
    }
    return uniqueIndex + 1; // new logical length
}
```

---

<a id="s52"></a>
## 52. Finding Duplicate Elements

For an unsorted array, a `HashSet` gives O(n) time at the cost of O(n) space; sorting first gives O(n log n) time but O(1) extra space (if in-place sort is used).

```java
public static boolean hasDuplicate(int[] arr) {
    Set<Integer> seen = new HashSet<>();
    for (int num : arr) {
        if (!seen.add(num)) return true; // add() returns false if already present
    }
    return false;
}
```

---

<a id="s53"></a>
## 53. Missing Number Problems

Given an array containing `n` distinct numbers from `0` to `n` with exactly one missing, find it in O(n) time and O(1) space using the sum formula or XOR.

```java
public static int findMissing(int[] arr) {
    int n = arr.length;
    int expectedSum = n * (n + 1) / 2;
    int actualSum = 0;
    for (int num : arr) actualSum += num;
    return expectedSum - actualSum;
}
```

---

<a id="s54"></a>
## 54. First Missing Positive

Find the smallest missing positive integer in O(n) time and O(1) extra space — the classic trick is to use the array itself as a hash table, placing each value `v` (if in range `[1, n]`) at index `v - 1`.

```java
public static int firstMissingPositive(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n; i++) {
        while (arr[i] > 0 && arr[i] <= n && arr[arr[i] - 1] != arr[i]) {
            int temp = arr[arr[i] - 1];
            arr[arr[i] - 1] = arr[i];
            arr[i] = temp;
        }
    }
    for (int i = 0; i < n; i++) {
        if (arr[i] != i + 1) return i + 1;
    }
    return n + 1;
}
```

---

<a id="s55"></a>
## 55. Leaders in an Array

An element is a "leader" if it's greater than all elements to its right. Scan from the right, tracking the maximum seen so far.

```java
public static List<Integer> findLeaders(int[] arr) {
    List<Integer> leaders = new ArrayList<>();
    int maxFromRight = arr[arr.length - 1];
    leaders.add(maxFromRight);
    for (int i = arr.length - 2; i >= 0; i--) {
        if (arr[i] > maxFromRight) {
            maxFromRight = arr[i];
            leaders.add(maxFromRight);
        }
    }
    Collections.reverse(leaders);
    return leaders;
}
```

---

<a id="s56"></a>
## 56. Equilibrium Index

An index where the sum of elements to its left equals the sum of elements to its right. Solved efficiently using prefix sums (Chapter 28) or a running total from both sides.

---

<a id="s57"></a>
## 57. Pivot Index

Functionally the same idea as the equilibrium index — LeetCode's naming for the same problem (sum of elements strictly left of the index equals sum strictly right of it).

---

<a id="s58"></a>
## 58. Maximum and Minimum Element

A single linear pass tracking both running max and min simultaneously solves this in O(n) time — no need for two separate passes or sorting.

---

<a id="s59"></a>
## 59. Second Largest and Second Smallest

Found in a single O(n) pass by tracking both the largest and second-largest values seen so far (as shown with the dry-run example in the DSA Introduction guide), carefully handling duplicate values so the "second largest" isn't accidentally equal to the largest.

---

<a id="s60"></a>
## 60. Largest Sum Contiguous Subarray

This is precisely the problem Kadane's Algorithm (Chapter 35) solves — the terms are used interchangeably in most textbooks and interview contexts.

---

<a id="s61"></a>
## 61. Maximum Product Subarray

Similar to Kadane's, but harder — because multiplying by a negative number can flip a very small product into a very large one. The fix: track both the running maximum *and* running minimum product at each position, since the minimum could become the maximum after multiplying by a negative.

```java
public static int maxProduct(int[] arr) {
    int maxProd = arr[0], minProd = arr[0], result = arr[0];
    for (int i = 1; i < arr.length; i++) {
        int num = arr[i];
        if (num < 0) {
            int temp = maxProd;
            maxProd = minProd;
            minProd = temp;
        }
        maxProd = Math.max(num, maxProd * num);
        minProd = Math.min(num, minProd * num);
        result = Math.max(result, maxProd);
    }
    return result;
}
```

---

<a id="s62"></a>
## 62. Maximum Difference Problem

Find the maximum value of `arr[j] - arr[i]` where `j > i` — essentially "best single trade" (buy low, sell high), solved in one pass by tracking the minimum seen so far.

---

<a id="s63"></a>
## 63. Stock Buy and Sell Problems

A family of problems (single transaction, multiple transactions, with cooldown, with transaction fees) all built on the maximum difference idea (Chapter 62), with variations solved using greedy scanning or dynamic programming as constraints get more complex.

```java
// Best Time to Buy and Sell Stock (single transaction)
public static int maxProfit(int[] prices) {
    int minPrice = Integer.MAX_VALUE, maxProfit = 0;
    for (int price : prices) {
        minPrice = Math.min(minPrice, price);
        maxProfit = Math.max(maxProfit, price - minPrice);
    }
    return maxProfit;
}
```

---

<a id="s64"></a>
## 64. Trapping Rain Water

Given an elevation map, compute how much water it can trap after raining. The key insight: water trapped above any bar is limited by the shorter of the tallest bar to its left and the tallest bar to its right.

```java
public static int trap(int[] height) {
    int left = 0, right = height.length - 1;
    int leftMax = 0, rightMax = 0, water = 0;
    while (left < right) {
        if (height[left] < height[right]) {
            leftMax = Math.max(leftMax, height[left]);
            water += leftMax - height[left];
            left++;
        } else {
            rightMax = Math.max(rightMax, height[right]);
            water += rightMax - height[right];
            right--;
        }
    }
    return water;
}
```

O(n) time, O(1) space, using the two-pointer technique from Chapter 34.

---

<a id="s65"></a>
## 65. Container With Most Water

Given heights representing vertical lines, find two lines that, together with the x-axis, form a container holding the most water. Solved with two pointers starting at both ends, always moving the pointer at the *shorter* line inward (since moving the taller one can never improve the area).

```java
public static int maxArea(int[] height) {
    int left = 0, right = height.length - 1, maxArea = 0;
    while (left < right) {
        int area = Math.min(height[left], height[right]) * (right - left);
        maxArea = Math.max(maxArea, area);
        if (height[left] < height[right]) left++; else right--;
    }
    return maxArea;
}
```

---

<a id="s66"></a>
## 66. Next Greater Element (Array Perspective)

For each element, find the first element to its right that's greater. The naive approach is O(n²); a **monotonic stack** solves it in O(n) by maintaining a decreasing stack of "waiting" indices.

```java
public static int[] nextGreaterElement(int[] arr) {
    int[] result = new int[arr.length];
    Arrays.fill(result, -1);
    Deque<Integer> stack = new ArrayDeque<>(); // stores indices

    for (int i = 0; i < arr.length; i++) {
        while (!stack.isEmpty() && arr[stack.peek()] < arr[i]) {
            result[stack.pop()] = arr[i];
        }
        stack.push(i);
    }
    return result;
}
```

---

<a id="s67"></a>
## 67. Previous Greater Element

The mirror of Chapter 66 — scan left to right, but for each element look for the nearest greater element *behind* it, using the same monotonic stack idea processed in the natural left-to-right order (rather than needing to reverse the array).

---

<a id="s68"></a>
## 68. Next Smaller Element

Same monotonic stack pattern as Chapter 66, but the stack is kept increasing instead of decreasing (pop while the top is *greater* than the current element).

---

<a id="s69"></a>
## 69. Previous Smaller Element

![Monotonic Stack - Next Greater Element](/images/blogs/internals/monotonic-stack-next-greater-element.png)


The mirror of Chapter 68 — nearest smaller element to the left, solved with an increasing monotonic stack scanned left to right.

---

<a id="s70"></a>
## 70. Peak Element

A peak is an element strictly greater than its neighbors. Binary search can find *a* peak (not necessarily the global maximum) in O(log n) by moving toward the side with the larger neighbor at each step, since that side is guaranteed to contain a peak.

---

<a id="s71"></a>
## 71. Mountain Array Problems

A "mountain array" strictly increases to a peak, then strictly decreases. Once you know an array has this shape, you can binary search for the peak (Chapter 70) and then binary search separately within each monotonic half for a target value — a compound application of monotonic reasoning.

---

<a id="s72"></a>
## 72. Sorted and Rotated Arrays

An array that was sorted, then rotated at some pivot — e.g., `[4,5,6,7,0,1,2]` was originally `[0,1,2,4,5,6,7]` rotated. These retain a crucial property: **at least one half (left or right of any midpoint) is always properly sorted**, which is what makes modified binary search possible.

---

<a id="s73"></a>
## 73. Finding Rotation Count

The number of positions an array was rotated equals the index of the minimum element — found via binary search by comparing the middle element against the endpoints of the current search range to decide which half is sorted.

```java
public static int findRotationCount(int[] arr) {
    int low = 0, high = arr.length - 1;
    while (low < high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] > arr[high]) low = mid + 1;
        else high = mid;
    }
    return low; // index of the smallest element = rotation count
}
```

---

<a id="s74"></a>
## 74. Searching in Rotated Sorted Array

A modified binary search: at each step, determine which half is properly sorted, then check if the target lies within that half's range — if so, search there; otherwise search the other half.

```java
public static int search(int[] arr, int target) {
    int low = 0, high = arr.length - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;

        if (arr[low] <= arr[mid]) { // left half is sorted
            if (arr[low] <= target && target < arr[mid]) high = mid - 1;
            else low = mid + 1;
        } else { // right half is sorted
            if (arr[mid] < target && target <= arr[high]) low = mid + 1;
            else high = mid - 1;
        }
    }
    return -1;
}
```

Still O(log n) despite the rotation.

---

<a id="s75"></a>
## 75. Merging Two Sorted Arrays

The core step of merge sort: walk both arrays with two pointers, always taking the smaller current element, in O(m + n) time.

```java
public static int[] mergeSorted(int[] a, int[] b) {
    int[] result = new int[a.length + b.length];
    int i = 0, j = 0, k = 0;
    while (i < a.length && j < b.length) {
        result[k++] = (a[i] <= b[j]) ? a[i++] : b[j++];
    }
    while (i < a.length) result[k++] = a[i++];
    while (j < b.length) result[k++] = b[j++];
    return result;
}
```

---

<a id="s76"></a>
## 76. Merging Without Extra Space

When one array has enough trailing empty space to hold both merged results (a common interview variant, and exactly the shape of Java's `Arrays.merge`-style helper problems), you can merge in-place by filling from the **back** of both arrays forward, avoiding overwriting unprocessed elements.

---

<a id="s77"></a>
## 77. Union of Two Arrays

All distinct elements present in either array. Typically solved by inserting both arrays' elements into a `HashSet` or `TreeSet` (for sorted output) — O(m + n) time.

---

<a id="s78"></a>
## 78. Intersection of Two Arrays

Elements present in **both** arrays. Solved by putting one array's elements into a `HashSet`, then scanning the other and keeping matches.

```java
public static List<Integer> intersection(int[] a, int[] b) {
    Set<Integer> set = new HashSet<>();
    for (int num : a) set.add(num);
    List<Integer> result = new ArrayList<>();
    for (int num : b) {
        if (set.remove(num)) result.add(num); // remove to avoid duplicate matches
    }
    return result;
}
```

---

<a id="s79"></a>
## 79. Difference of Two Arrays

Elements present in array A but **not** in array B — computed by checking membership of each element of A against a `HashSet` built from B.

---

<a id="s80"></a>
## 80. Symmetric Difference

Elements present in exactly one of the two arrays (in A but not B, plus in B but not A) — the union minus the intersection.

---

<a id="s81"></a>
## 81. Subarrays

A **contiguous** slice of an array — order and adjacency both matter. An array of length `n` has `n(n+1)/2` possible subarrays.

---

<a id="s82"></a>
## 82. Subsequences

A selection of elements that preserves relative order but does **not** need to be contiguous — you can skip elements. An array of length `n` has `2^n` possible subsequences (including the empty one).

---

<a id="s83"></a>
## 83. Subsets

Conceptually identical to subsequences for an array context (any combination of elements, order usually irrelevant) — also `2^n` in count, typically generated via bitmasking or recursive backtracking.

```java
// Generate all subsets using bitmasking
public static List<List<Integer>> subsets(int[] arr) {
    List<List<Integer>> result = new ArrayList<>();
    int n = arr.length;
    for (int mask = 0; mask < (1 << n); mask++) {
        List<Integer> subset = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            if ((mask & (1 << i)) != 0) subset.add(arr[i]);
        }
        result.add(subset);
    }
    return result;
}
```

---

<a id="s84"></a>
## 84. Contiguous vs Non-Contiguous Problems

The single biggest branch point when reading a new array problem: does it ask about a **subarray** (contiguous — often solvable with sliding window, prefix sum, or Kadane's-style single pass) or a **subsequence/subset** (non-contiguous — often requiring dynamic programming or backtracking)? Misidentifying this early is one of the most common reasons a solution attempt goes in entirely the wrong direction.

---

<a id="s85"></a>
## 85. Maximum Sum of Fixed-Size Subarray

The canonical fixed-window sliding window problem (shown fully in Chapter 33) — window size `k` never changes as it slides.

---

<a id="s86"></a>
## 86. Variable Size Sliding Window Problems

Unlike the fixed-size version, the window's size grows and shrinks dynamically based on a condition (e.g., "smallest subarray with sum ≥ target", "longest substring without repeating characters"). The general pattern: expand the right pointer to grow the window, and shrink from the left whenever the window violates the condition.

```java
// Smallest subarray with sum >= target
public static int minSubArrayLen(int target, int[] arr) {
    int left = 0, sum = 0, minLen = Integer.MAX_VALUE;
    for (int right = 0; right < arr.length; right++) {
        sum += arr[right];
        while (sum >= target) {
            minLen = Math.min(minLen, right - left + 1);
            sum -= arr[left++];
        }
    }
    return minLen == Integer.MAX_VALUE ? 0 : minLen;
}
```

---

<a id="s87"></a>
## 87. Prefix XOR Arrays

Same idea as prefix sums (Chapter 28), but using XOR instead of addition. Since XOR is its own inverse (`a ^ a = 0`), it enables O(1) range-XOR queries and clever duplicate/missing-number tricks.

```java
int[] prefixXor = new int[arr.length];
prefixXor[0] = arr[0];
for (int i = 1; i < arr.length; i++) {
    prefixXor[i] = prefixXor[i - 1] ^ arr[i];
}
// XOR of range [L, R] = prefixXor[R] ^ (L == 0 ? 0 : prefixXor[L-1])
```

---

<a id="s88"></a>
## 88. XOR-Based Array Problems

A family of clever O(n) time, O(1) space problems relying on XOR's self-canceling property — e.g., "find the single number that appears once while all others appear twice" is solved by simply XOR-ing every element together; every paired value cancels to zero, leaving only the unique one.

```java
public static int singleNumber(int[] arr) {
    int result = 0;
    for (int num : arr) result ^= num;
    return result;
}
```

---

<a id="s89"></a>
## 89. Hashing with Arrays

Using a `HashMap` or `HashSet` alongside array traversal is one of the single most common ways to convert an O(n²) brute-force array algorithm into O(n) — trading space for time by remembering what you've already seen (as in the "two sum" style problems referenced throughout this guide).

---

<a id="s90"></a>
## 90. Counting Frequencies Efficiently

For a bounded range of values, a plain array (frequency array, Chapter 30) beats a `HashMap` — no hashing overhead, guaranteed O(1) access, and better cache locality. For an unbounded or sparse range of values, a `HashMap<Integer, Integer>` is the more practical choice.

---

<a id="s91"></a>
## 91. Majority Element Problems

The family of problems asking for an element appearing more than n/2 times (or more than n/3, in the extended variant) — solved optimally with Moore's Voting Algorithm (Chapters 37–38), or more simply (but with extra space) via a frequency map.

---

<a id="s92"></a>
## 92. Kth Largest Element

Multiple approaches exist, each with different trade-offs: full sort (O(n log n)), a min-heap of size k (O(n log k)), or Quickselect (average O(n), covered in Chapter 100).

```java
// Using a min-heap of size k
public static int findKthLargest(int[] arr, int k) {
    PriorityQueue<Integer> minHeap = new PriorityQueue<>();
    for (int num : arr) {
        minHeap.offer(num);
        if (minHeap.size() > k) minHeap.poll();
    }
    return minHeap.peek();
}
```

---

<a id="s93"></a>
## 93. Kth Smallest Element

The mirror of Chapter 92 — use a max-heap of size k instead, or apply Quickselect targeting the k-th smallest position directly.

---

<a id="s94"></a>
## 94. Top K Frequent Elements

Combine a frequency map (Chapter 90) with a heap of size k, keyed by frequency instead of value — O(n log k) overall, notably faster than fully sorting all distinct values by frequency when k is small.

---

<a id="s95"></a>
## 95. Median of an Array

For a static array, sort it and pick the middle element (or average the two middle elements for even length) — O(n log n). For a **stream** of numbers where the median is needed repeatedly as elements arrive, a two-heap approach (a max-heap for the lower half, a min-heap for the upper half) gives O(log n) per insertion.

---

<a id="s96"></a>
## 96. Median of Two Sorted Arrays

A notoriously tricky interview classic: find the median of the combined set of two already-sorted arrays without fully merging them, in O(log(min(m, n))) using a binary-search partition approach that finds a split point in the smaller array such that the combined left and right halves are correctly balanced and ordered.

---

<a id="s97"></a>
## 97. Inversion Count

An inversion is a pair `(i, j)` where `i < j` but `arr[i] > arr[j]` — effectively a measure of "how far from sorted" the array is. Counted efficiently in O(n log n) using a modified merge sort that counts cross-inversions during the merge step.

---

<a id="s98"></a>
## 98. Reverse Pairs

A more specific inversion-style problem: count pairs `(i, j)` where `i < j` and `arr[i] > 2 * arr[j]`. Solved with the same modified merge-sort technique as Chapter 97, adjusted for the doubled comparison condition.

---

<a id="s99"></a>
## 99. Merge Sort Applications on Arrays

Beyond sorting itself, the merge step of merge sort is a reusable building block for counting inversions (Chapter 97), reverse pairs (Chapter 98), and any "count cross-boundary relationships while merging two sorted halves" problem — recognizing this pattern saves significant design time.

---

<a id="s100"></a>
## 100. Quick Select Algorithm

A variant of quicksort's partitioning step used to find the k-th smallest/largest element without fully sorting the array — average O(n) time, since after each partition step you only recurse into the *one* side that contains the target rank, rather than both sides.

```java
public static int quickSelect(int[] arr, int left, int right, int k) {
    int pivotIndex = partition(arr, left, right);
    if (pivotIndex == k) return arr[pivotIndex];
    else if (pivotIndex < k) return quickSelect(arr, pivotIndex + 1, right, k);
    else return quickSelect(arr, left, pivotIndex - 1, k);
}
```

---

<a id="s101"></a>
## 101. Partition Algorithms

The core routine behind both quicksort and quickselect: pick a pivot, then rearrange the array so everything smaller than the pivot ends up on its left and everything larger ends up on its right.

```java
private static int partition(int[] arr, int left, int right) {
    int pivot = arr[right];
    int i = left - 1;
    for (int j = left; j < right; j++) {
        if (arr[j] < pivot) {
            i++;
            int temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
        }
    }
    int temp = arr[i + 1]; arr[i + 1] = arr[right]; arr[right] = temp;
    return i + 1;
}
```

---

<a id="s102"></a>
## 102. Stable vs Unstable Rearrangements

A **stable** sort or partition preserves the relative order of equal elements; an **unstable** one does not guarantee it. Merge sort is stable; the classic in-place quicksort partition above is not. This distinction matters whenever you're sorting objects by one field but need to preserve their original order for ties (e.g., sorting employees by department while keeping same-department employees in their original listing order).

---

<a id="s103"></a>
## 103. Sparse Arrays

An array where the overwhelming majority of elements are a single default value (usually zero) and only a few positions hold meaningful data. Storing a sparse array as a plain array wastes memory; representing it instead as a list of `(index, value)` pairs or a `HashMap<Integer, Value>` is far more space-efficient when the array is large but mostly empty.

---

<a id="s104"></a>
## 104. Circular Arrays

An array conceptually treated as wrapping around — the element after the last index is the first index again. Implemented using the **modulo operator**: `next = (current + 1) % length`. This underlies circular buffers, circular queues, and round-robin scheduling.

---

<a id="s105"></a>
## 105. Circular Subarray Problems

Problems like "maximum sum circular subarray" extend Kadane's Algorithm (Chapter 35) by considering two cases: the maximum subarray doesn't wrap around (plain Kadane's), or it does wrap around (computed cleverly as `total sum - minimum subarray sum`).

---

<a id="s106"></a>
## 106. Matrix as a 2D Array

A matrix is simply the mathematical name for a 2D array — rows and columns, accessed as `matrix[row][col]`. Every matrix algorithm is, underneath, an array algorithm operating on nested indices.

---

<a id="s107"></a>
## 107. Matrix Traversal

The two most common traversal orders are **row-major** (left to right, top to bottom — Java's natural iteration order) and **column-major** (top to bottom, left to right) — plus specialized traversal orders covered next (spiral, diagonal, boundary).

```java
// Row-major traversal
for (int i = 0; i < matrix.length; i++) {
    for (int j = 0; j < matrix[i].length; j++) {
        System.out.print(matrix[i][j] + " ");
    }
}
```

---

<a id="s108"></a>
## 108. Spiral Matrix

Traverse a matrix in a spiral order — right across the top row, down the right column, left across the bottom row, up the left column, then shrink the boundary inward and repeat.

```java
public static List<Integer> spiralOrder(int[][] matrix) {
    List<Integer> result = new ArrayList<>();
    int top = 0, bottom = matrix.length - 1;
    int left = 0, right = matrix[0].length - 1;

    while (top <= bottom && left <= right) {
        for (int j = left; j <= right; j++) result.add(matrix[top][j]);
        top++;
        for (int i = top; i <= bottom; i++) result.add(matrix[i][right]);
        right--;
        if (top <= bottom) {
            for (int j = right; j >= left; j--) result.add(matrix[bottom][j]);
            bottom--;
        }
        if (left <= right) {
            for (int i = bottom; i >= top; i--) result.add(matrix[i][left]);
            left++;
        }
    }
    return result;
}
```

---

<a id="s109"></a>
## 109. Diagonal Traversal

Traverses a matrix diagonal by diagonal rather than row by row — common in problems like "diagonal sum" or LeetCode's zigzag diagonal traversal. Elements on the same diagonal share the property `row - col = constant` (for one diagonal direction) or `row + col = constant` (for the other).

---

<a id="s110"></a>
## 110. Matrix Rotation

![Spiral Matrix and Matrix Rotation](/images/blogs/internals/spiral-matrix-rotation-traversal.png)

Rotating a square matrix 90° clockwise **in-place** is done in two steps: transpose the matrix (Chapter 111), then reverse each row.

```java
public static void rotate90Clockwise(int[][] matrix) {
    int n = matrix.length;
    // Step 1: transpose
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            int temp = matrix[i][j];
            matrix[i][j] = matrix[j][i];
            matrix[j][i] = temp;
        }
    }
    // Step 2: reverse each row
    for (int[] row : matrix) {
        for (int left = 0, right = n - 1; left < right; left++, right--) {
            int temp = row[left]; row[left] = row[right]; row[right] = temp;
        }
    }
}
```

---

<a id="s111"></a>
## 111. Matrix Transpose

Flips a matrix over its main diagonal — `transpose[j][i] = original[i][j]`. For a square matrix, this can be done in-place by swapping symmetric pairs, as shown as step 1 in Chapter 110.

---

<a id="s112"></a>
## 112. Prefix Sum Matrix (2D Prefix Sum)

Extends the 1D prefix sum idea (Chapter 28) to two dimensions, letting you compute the sum of any rectangular sub-region of a matrix in O(1) after O(rows × cols) preprocessing.

```java
// prefix[i][j] = sum of all elements in the rectangle (0,0) to (i-1,j-1)
public static int[][] build2DPrefixSum(int[][] matrix) {
    int rows = matrix.length, cols = matrix[0].length;
    int[][] prefix = new int[rows + 1][cols + 1];
    for (int i = 1; i <= rows; i++) {
        for (int j = 1; j <= cols; j++) {
            prefix[i][j] = matrix[i-1][j-1]
                + prefix[i-1][j]
                + prefix[i][j-1]
                - prefix[i-1][j-1];
        }
    }
    return prefix;
}
```

---

<a id="s113"></a>
## 113. Difference Matrix

The 2D extension of the difference array (Chapter 29) — allows applying a value to an entire rectangular sub-region in O(1) per update, materialized into the final matrix using a 2D prefix sum pass at the end.

---

<a id="s114"></a>
## 114. Searching in a Matrix

For a matrix sorted row-wise and column-wise, the classic efficient approach starts at the **top-right corner** and moves left (if the current value is too big) or down (if too small) — O(rows + cols) instead of a full scan.

```java
public static boolean searchMatrix(int[][] matrix, int target) {
    int row = 0, col = matrix[0].length - 1;
    while (row < matrix.length && col >= 0) {
        if (matrix[row][col] == target) return true;
        else if (matrix[row][col] > target) col--;
        else row++;
    }
    return false;
}
```

---

<a id="s115"></a>
## 115. Matrix Boundary Traversal

Traverses only the outermost "ring" of a matrix — the top row, right column, bottom row, and left column — commonly needed for problems that process a matrix layer by layer (a simpler cousin of the spiral traversal in Chapter 108, without the inward shrinking).

---

<a id="s116"></a>
## 116. Common Interview Patterns Using Arrays

The recurring toolkit that covers the overwhelming majority of array interview questions: **two pointers** (Chapter 34), **sliding window** (Chapter 33), **prefix sums** (Chapter 28), **monotonic stack** (Chapters 66–69), **binary search / binary search on answer** (Chapters 20, 39), and **hashing** (Chapter 89). Recognizing which pattern a new problem maps to is the single highest-leverage interview skill for this topic.

---

<a id="s117"></a>
## 117. Common Mistakes with Arrays

- Forgetting Java arrays are zero-indexed, causing off-by-one errors at the boundaries.
- Not checking for empty arrays before accessing `arr[0]`.
- Assuming an array is sorted when applying binary search or two-pointer techniques that require it.
- Confusing subarrays (contiguous) with subsequences (non-contiguous), leading to the wrong algorithmic approach entirely (see Chapter 84).
- Modifying an array while iterating over it with a for-each loop, causing unexpected skipped elements or exceptions.
- Ignoring integer overflow when summing large arrays (use `long` for sums that could exceed `Integer.MAX_VALUE`).
- Doing `(low + high) / 2` in binary search, which can overflow for very large indices — prefer `low + (high - low) / 2`.

---

<a id="s118"></a>
## 118. Array Optimization Techniques

- Precompute prefix sums when the same range-sum query is asked repeatedly.
- Use two pointers instead of nested loops whenever the array is sorted or the problem has a monotonic structure.
- Reach for a monotonic stack whenever a problem mentions "next/previous greater/smaller element."
- Use the array itself as a hash table (Chapter 54's technique) when values are bounded within `[1, n]` and O(1) extra space is required.
- Prefer `System.arraycopy()` over manual loops for bulk copying — it's implemented as a highly optimized native operation.

---

<a id="s119"></a>
## 119. Real-World Applications of Arrays

- **Image processing** — pixels are stored as 2D (or 3D, with color channels) arrays.
- **Spreadsheets** — rows and columns are conceptually a 2D array/matrix.
- **Audio buffers** — raw audio samples are stored as arrays for playback and processing.
- **Database result sets** — often materialized as arrays of rows internally before further processing.
- **Game boards** — chessboards, Sudoku grids, and tile-based game maps are almost universally 2D arrays.
- **Scientific computing** — matrices and tensors, the backbone of machine learning, are fundamentally structured, multi-dimensional arrays.

---

<a id="s120"></a>
## 120. Practice Problems (Easy)

- Find the maximum and minimum element in an array
- Reverse an array in place
- Move all zeroes to the end
- Find the second largest element
- Check if an array is sorted

---

<a id="s121"></a>
## 121. Practice Problems (Medium)

- Kadane's Algorithm — maximum subarray sum
- Rotate an array by k positions
- Find the missing number in a range
- Search in a rotated sorted array
- Merge overlapping intervals
- Find the majority element (Moore's Voting)

---

<a id="s122"></a>
## 122. Practice Problems (Hard)

- Trapping Rain Water
- Median of Two Sorted Arrays
- First Missing Positive
- Count Inversions using Merge Sort
- Maximum Sum Circular Subarray

---

<a id="s123"></a>
## 123. Summary

Arrays are the foundation of nearly every other data structure — contiguous memory and O(1) indexed access are what make them fast for reading, but the same contiguity is precisely what makes insertion and deletion in the middle expensive. Most of "getting good at arrays" isn't learning more syntax — it's building fluency in a compact set of patterns (two pointers, sliding window, prefix sums, monotonic stacks, binary search on sorted or rotated data) that reappear, in disguise, across hundreds of distinct-looking problems. Once these patterns are second nature, unfamiliar array problems stop feeling unfamiliar — they start looking like a known pattern wearing a new costume.

---

<a id="s124"></a>
## 124. Key Takeaways

**Foundations**
- Arrays store elements **contiguously in memory**, which is why access is O(1) but insertion/deletion in the middle is O(n) due to shifting
- Java arrays are **fixed-size** and **zero-indexed**; `ArrayList` simulates dynamic sizing by silently reallocating and copying to a larger backing array (amortized O(1) `add()`)

**Core Techniques**
- **Prefix sums** turn repeated O(n) range-sum queries into O(1) each after O(n) preprocessing
- **Two pointers** and **sliding window** convert many O(n²) brute-force approaches into O(n)
- **Monotonic stacks** are the standard tool for "next/previous greater/smaller element" problems
- **Binary search** works on any monotonic structure — not just sorted arrays, but also on rotated sorted arrays and on the *answer space* itself (binary search on answer)

**Interview Readiness**
- Distinguishing **contiguous (subarray)** from **non-contiguous (subsequence/subset)** problems early prevents applying the wrong algorithmic family entirely
- A small set of recurring algorithms — Kadane's, Dutch National Flag, Moore's Voting, Quickselect — cover a disproportionate share of classic array interview questions

---

<a id="s125"></a>
## 125. Frequently Asked Questions (FAQ)

**Q: Why are Java arrays fixed-size when other languages seem to have flexible arrays?**
Other languages' "arrays" (Python lists, JavaScript arrays) are actually dynamic arrays under the hood, functionally closer to Java's `ArrayList` than to Java's raw `int[]`. Java exposes both: a true fixed-size array and a dynamic `ArrayList` built on top of one.

**Q: When should I use `int[]` versus `ArrayList<Integer>`?**
Use `int[]` when the size is known upfront and fixed, and you want to avoid the memory/performance overhead of autoboxing primitives into `Integer` objects. Use `ArrayList` when the collection needs to grow or shrink, or when you need the richer API (`contains`, `remove`, streams).

**Q: Is binary search really always faster than linear search?**
Only on sorted data — and only when the array is large enough that O(log n) meaningfully beats O(n). For very small arrays (say, under ~10-20 elements), the constant-factor overhead of binary search can make linear search just as fast or faster in practice, though this rarely matters for correctness-focused interview answers.

**Q: How do I know if a problem wants a subarray or a subsequence approach?**
Read the problem statement carefully for the word "contiguous" or "subarray" (implies two pointers/sliding window/prefix sums) versus "subsequence" or "select any elements" (implies dynamic programming or backtracking, since order-preserving-but-non-adjacent selections don't move with a simple sliding window).

**Q: Do I need to memorize all these algorithms (Kadane's, Dutch Flag, Moore's Voting, etc.) by name?**
Knowing the names helps you communicate quickly in interviews ("this looks like a monotonic stack problem"), but the actual skill is recognizing the **underlying pattern** from the problem's shape — the name is a label for a pattern you should be able to re-derive, not a magic formula to recall verbatim.

**Q: What's the single most important array pattern to master first?**
Two pointers and sliding window, in that order — together they unlock a huge fraction of both easy and medium-difficulty array problems, and nearly every later pattern in this guide (Kadane's, trapping rain water, container with most water) is a specific application of one of these two ideas.

---

*Every array in this guide — every window that slides, every pointer that walks toward its partner, every prefix sum that answers instantly — is the same contiguous block of memory from Chapter 1, just being asked a slightly cleverer question.*