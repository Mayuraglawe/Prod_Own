# Liskov Substitution Principle (LSP)

> "Objects of a superclass should be replaceable with objects of its subclasses
> without breaking the correctness of the program."
> — Barbara Liskov

## 1. What it actually means

If class `B` extends (or implements) class/interface `A`, then anywhere the code
expects an `A`, you should be able to pass a `B` **and the program should still
behave correctly** — no surprising exceptions, no broken invariants, no
silently-wrong output.

This is stricter than "the code compiles." Compilation only checks method
signatures. LSP is about **behavioral compatibility**:
- Preconditions cannot be strengthened in the subclass (don't demand more than the parent did).
- Postconditions cannot be weakened in the subclass (don't guarantee less than the parent did).
- Invariants of the parent must be preserved.
- The subclass shouldn't throw new exceptions the caller isn't prepared for.

## 2. Why it matters

| Problem without LSP | Consequence |
|---|---|
| Subclass throws `UnsupportedOperationException` for inherited methods | Runtime crashes in code that "should" work via polymorphism |
| Subclass silently changes behavior/semantics of a parent method | Bugs that are hard to trace — code "looks" correct but isn't |
| Client code has to `instanceof`-check and special-case subclasses | Defeats the entire purpose of polymorphism/abstraction |

## 3. Violation Example (Java) — the classic Rectangle/Square problem

```java
public class Rectangle {
    protected int width;
    protected int height;

    public void setWidth(int width) { this.width = width; }
    public void setHeight(int height) { this.height = height; }
    public int getArea() { return width * height; }
}

public class Square extends Rectangle {
    // A square must keep width == height, so it overrides both setters
    @Override
    public void setWidth(int width) {
        this.width = width;
        this.height = width; // forces height to match
    }

    @Override
    public void setHeight(int height) {
        this.width = height;
        this.height = height; // forces width to match
    }
}
```

```java
public void resizeAndTest(Rectangle r) {
    r.setWidth(5);
    r.setHeight(10);
    assert r.getArea() == 50; // Passes for Rectangle, FAILS for Square (area = 100)
}
```

**Why this is bad:** `Square` technically "is-a" `Rectangle` geometrically, but
behaviorally it violates the parent's contract: setting width and height
independently is a documented, expected behavior of `Rectangle` that `Square`
silently breaks. Any code written against `Rectangle` that relies on
independent width/height mutation will misbehave when handed a `Square`.

## 4. Fixed Example (Java) — don't force an inheritance relationship that doesn't hold behaviorally

```java
public interface Shape {
    int getArea();
}

public class Rectangle implements Shape {
    private final int width;
    private final int height;

    public Rectangle(int width, int height) {
        this.width = width;
        this.height = height;
    }

    public int getArea() { return width * height; }
}

public class Square implements Shape {
    private final int side;

    public Square(int side) {
        this.side = side;
    }

    public int getArea() { return side * side; }
}
```

Now neither class makes false promises about the other's behavior. Both simply
promise "I can compute my area" via the `Shape` interface — a promise both can
honestly keep. Objects are immutable here too, which sidesteps the
independent-width/height mutation problem entirely.

## 5. A more common real-world violation: throwing on inherited methods

```java
public interface FileStorage {
    void save(String path, byte[] data);
    void delete(String path);
}

public class S3Storage implements FileStorage {
    public void save(String path, byte[] data) { /* upload to S3 */ }
    public void delete(String path) { /* delete from S3 */ }
}

public class ReadOnlyArchiveStorage implements FileStorage {
    public void save(String path, byte[] data) { /* archive write */ }

    public void delete(String path) {
        throw new UnsupportedOperationException("Archive is append-only");
        // LSP VIOLATION: any code that calls delete() on a FileStorage
        // reference will crash if it happens to receive this implementation.
    }
}
```

**Fix:** don't force `ReadOnlyArchiveStorage` to implement a `delete()` method it
can't honor. Split the interface (this also demonstrates ISP, covered next):

```java
public interface Writable {
    void save(String path, byte[] data);
}

public interface Deletable {
    void delete(String path);
}

public class S3Storage implements Writable, Deletable { /* implements both */ }

public class ReadOnlyArchiveStorage implements Writable { /* only implements save */ }
```

Now nothing that holds a `Writable` reference can ever be surprised by a missing
or throwing `delete()` — the type system itself prevents the misuse.

## 6. Real-world analogy

If a device is advertised as a "USB-C charger" (the parent contract), every actual
charger you plug in (subclass) must actually deliver power through that port
without secretly requiring a proprietary adapter or catching fire. If a specific
charger needs special handling, it shouldn't have been advertised as fitting the
same contract.

## 7. Common misconceptions

| Misconception | Reality |
|---|---|
| "LSP is only about geometry examples (Rectangle/Square)" | That's just the textbook illustration. LSP applies anywhere subclassing/implementing an interface changes behavior, not just shape hierarchies. |
| "If it compiles, LSP is satisfied" | Compilation checks signatures only. LSP is a semantic/behavioral contract, invisible to the compiler. |
| "LSP only applies to inheritance (`extends`)" | It applies equally to interface implementation — any "is-a" relationship. |

## 8. How to detect an LSP violation (checklist)

- [ ] Does a subclass override a method to throw `UnsupportedOperationException`/`NotImplementedException`?
- [ ] Does client code contain `if (obj instanceof SpecificSubclass) { ... special case ... }`?
- [ ] Does a subclass silently narrow what inputs it accepts, or change what output range it returns, versus the parent's documented contract?
- [ ] Would a unit test written against the base type/interface fail if you swapped in a specific subclass?

## 9. Interview Q&A

**Q: How is LSP different from just "using interfaces correctly"?**
A: Using an interface is a syntactic act; satisfying LSP is a *behavioral*
guarantee. You can implement an interface with 100% correct method signatures and
still violate LSP if the behavior doesn't honor the contract callers reasonably
expect (e.g., throwing where the base type never would, or ignoring documented
invariants).

**Q: How does LSP relate to "design by contract"?**
A: LSP formalizes design-by-contract rules for subtyping: subclasses may weaken
preconditions (accept a superset of valid inputs) and strengthen postconditions
(guarantee a subset/more specific result), but never the reverse.

**Q: Real example?**
A (framed generically): If a notification-sender interface promises
`send(message) -> boolean success`, an implementation that instead throws an
uncaught exception on failure (rather than returning `false`) breaks LSP for any
caller written against the interface's documented contract.
