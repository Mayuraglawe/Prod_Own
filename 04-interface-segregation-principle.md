# Interface Segregation Principle (ISP)

> "Clients should not be forced to depend on methods they do not use."
> — Robert C. Martin

## 1. What it actually means

Prefer several small, focused, client-specific interfaces over one large,
general-purpose ("fat") interface. If a class is forced to implement methods it
has no use for, it usually means the interface was designed around what the
*implementer* has (a big grab-bag of capabilities) rather than what each
*client/consumer* actually needs.

## 2. Why it matters

| Problem without ISP | Consequence |
|---|---|
| Classes implement empty/stub/throwing methods for unused parts of an interface | Fragile, confusing code (see LSP violations — ISP and LSP are closely linked) |
| Changing one method in a fat interface forces recompiling/retesting every implementer | Ripple effects across unrelated classes |
| Consumers depend on methods they never call | Unnecessary coupling — a change to a method you don't even use can still break your code |

## 3. Violation Example (Java)

```java
public interface Worker {
    void work();
    void eat();
    void sleep();
}

public class HumanWorker implements Worker {
    public void work() { System.out.println("Working"); }
    public void eat() { System.out.println("Eating lunch"); }
    public void sleep() { System.out.println("Sleeping at night"); }
}

public class RobotWorker implements Worker {
    public void work() { System.out.println("Working 24/7"); }

    public void eat() {
        // Robots don't eat — forced to implement a meaningless method
        throw new UnsupportedOperationException("Robots don't eat");
    }

    public void sleep() {
        // Robots don't sleep either
        throw new UnsupportedOperationException("Robots don't sleep");
    }
}
```

**Why this is bad:** `RobotWorker` is forced to depend on (implement) `eat()` and
`sleep()` — methods it fundamentally cannot support. Any code that holds a
`Worker` reference and calls `eat()` will crash if it happens to receive a
`RobotWorker`. This is the same failure mode as an LSP violation — ISP violations
very often *cause* LSP violations.

## 4. Fixed Example (Java) — split into role-specific interfaces

```java
public interface Workable {
    void work();
}

public interface Eatable {
    void eat();
}

public interface Sleepable {
    void sleep();
}

public class HumanWorker implements Workable, Eatable, Sleepable {
    public void work() { System.out.println("Working"); }
    public void eat() { System.out.println("Eating lunch"); }
    public void sleep() { System.out.println("Sleeping at night"); }
}

public class RobotWorker implements Workable {
    public void work() { System.out.println("Working 24/7"); }
    // No eat()/sleep() — because it's genuinely not a robot's responsibility
}
```

Now code that only cares about "can this thing work?" depends on `Workable` —
nothing more. It has zero coupling to `eat()`/`sleep()`, and `RobotWorker` never
has to fake support for behavior it doesn't have.

## 5. A backend-flavored example

```java
// BAD: one fat repository interface
public interface UserRepository {
    User findById(String id);
    void save(User user);
    void delete(String id);
    List<User> generateMonthlyReport();  // reporting concern leaked in
    void sendWelcomeEmail(User user);    // notification concern leaked in
}
```

```java
// GOOD: segregated by concern
public interface UserReadWrite {
    User findById(String id);
    void save(User user);
    void delete(String id);
}

public interface UserReportGenerator {
    List<User> generateMonthlyReport();
}

public interface UserNotifier {
    void sendWelcomeEmail(User user);
}
```

A class that only needs to fetch/save users (e.g., an auth service) depends on
`UserReadWrite` alone — it's never affected by changes to reporting or
notification logic, and it never has to stub out methods it has no business
implementing.

## 6. Real-world analogy

A universal remote control with 50 buttons for every possible device feature is
harder to use and more fragile than 3 separate remotes: one for the TV, one for
the AC, one for the soundbar. Each device (client) only depends on the buttons
(methods) it actually needs.

## 7. Common misconceptions

| Misconception | Reality |
|---|---|
| "ISP just means 'small interfaces'" | Size isn't the goal — cohesion by *client need* is. A small interface with unrelated methods still violates ISP. |
| "ISP and SRP are the same thing" | SRP is about a class having one reason to change. ISP is about *interfaces* not forcing unrelated methods on implementers. They're related but distinct — ISP is essentially SRP applied to interface design. |
| "Splitting interfaces always adds unnecessary complexity" | Only if taken to extremes (one interface per method with no cohesion). The goal is grouping by *actual client usage patterns*, not maximal fragmentation. |

## 8. How to detect an ISP violation (checklist)

- [ ] Does any implementing class have a method that throws, is empty, or returns a dummy/null value just to satisfy the interface?
- [ ] Do different client classes each use only a small, non-overlapping subset of a large interface's methods?
- [ ] Does changing one method in an interface force recompiling/retesting classes that never even call that method?
- [ ] Are there comments like `// not applicable for this implementation` next to overridden methods?

## 9. Interview Q&A

**Q: How is ISP different from SRP?**
A: SRP focuses on a class's reasons to change. ISP focuses on interface design —
making sure consumers only depend on the methods relevant to them, so an
interface itself doesn't force unrelated responsibilities onto every
implementer. ISP is often described as "SRP for interfaces."

**Q: How does ISP relate to LSP?**
A: A fat interface often *causes* LSP violations — implementers forced to support
methods they can't honestly fulfill end up throwing exceptions or faking
behavior, which breaks substitutability. Segregating interfaces properly is one
of the most effective ways to prevent LSP violations from happening in the first
place.

**Q: Real example?**
A (framed generically): A payment-gateway interface used across multiple
providers (cards, UPI, wallets) should not have a single `PaymentProvider`
interface with methods for refunds, recurring billing, and dispute handling all
mandatory — a provider that doesn't support recurring billing shouldn't be
forced to implement (or stub-throw) that method. Segregate into
`Payable`, `Refundable`, `RecurringBillable` and let each provider implement only
what it actually supports.
