# Dependency Inversion Principle (DIP)

> "High-level modules should not depend on low-level modules. Both should depend
> on abstractions. Abstractions should not depend on details. Details should
> depend on abstractions."
> — Robert C. Martin

## 1. What it actually means

Two rules bundled into one principle:

1. **High-level modules** (business logic — the "what" and "why") should not
   directly depend on **low-level modules** (implementation details — the "how":
   a specific database driver, a specific email provider, a specific file system
   API). Both should depend on an **abstraction** (an interface) sitting between
   them.
2. The abstraction itself should be owned by/shaped around the high-level
   module's needs — not dictated by whatever the low-level implementation
   happens to expose.

This is called "inversion" because normally you'd think high-level code depends
on low-level code (business logic calls the database directly). DIP inverts
that: both sides depend on an interface, and the low-level module is the one
that has to conform to it — not the other way around.

**Important distinction:** DIP (a design principle) is not the same as
**Dependency Injection** (a technique/pattern for supplying dependencies from
outside). DI is one common *way* to achieve DIP, but you can apply DIP without a
DI framework, and you can use a DI framework while still violating DIP if you're
injecting concrete classes instead of abstractions.

## 2. Why it matters

| Problem without DIP | Consequence |
|---|---|
| Business logic directly instantiates a specific DB/HTTP client class | Swapping databases/providers means rewriting business logic |
| Unit tests require a real database/network connection | Slow, flaky tests; can't isolate logic from infrastructure |
| High-level policy is entangled with low-level detail | Changes to low-level detail (e.g., library upgrade) can break business rules unexpectedly |

## 3. Violation Example (Java)

```java
// Low-level module (implementation detail)
public class MySQLUserRepository {
    public User findById(String id) {
        // raw JDBC / SQL against MySQL
        return new User(id, "Mayur");
    }
}

// High-level module (business logic) — directly depends on a concrete low-level class
public class UserService {
    private final MySQLUserRepository repository = new MySQLUserRepository();

    public User getUser(String id) {
        return repository.findById(id);
    }
}
```

**Why this is bad:**
- `UserService` (business logic, "high-level") is hard-wired to `MySQLUserRepository`
  ("low-level", implementation detail).
- Want to switch to PostgreSQL, add a cache layer, or write a fast in-memory unit
  test? You must edit `UserService` itself.
- You cannot unit-test `UserService`'s logic without a real (or heavily mocked
  via reflection/bytecode tricks) MySQL connection.

## 4. Fixed Example (Java) — depend on an abstraction

```java
// Abstraction — owned conceptually by the high-level module's needs
public interface UserRepository {
    User findById(String id);
}

// Low-level module — depends on (implements) the abstraction
public class MySQLUserRepository implements UserRepository {
    public User findById(String id) {
        // raw JDBC / SQL against MySQL
        return new User(id, "Mayur");
    }
}

// Another low-level module — can swap in freely
public class InMemoryUserRepository implements UserRepository {
    private final Map<String, User> store = new HashMap<>();

    public User findById(String id) {
        return store.get(id);
    }
}

// High-level module — depends only on the abstraction, injected from outside
public class UserService {
    private final UserRepository repository;

    public UserService(UserRepository repository) { // constructor injection
        this.repository = repository;
    }

    public User getUser(String id) {
        return repository.findById(id);
    }
}
```

```java
// Wiring — usually done in one place: main(), a DI container, or a factory
UserService prodService = new UserService(new MySQLUserRepository());
UserService testService = new UserService(new InMemoryUserRepository());
```

Now:
- `UserService` never changes when the storage tech changes.
- Unit tests use `InMemoryUserRepository` (or a mock) — no real DB needed, tests
  run in milliseconds.
- Swapping MySQL → PostgreSQL means writing a new `PostgresUserRepository` and
  changing exactly one line at the wiring/composition-root level.

## 5. Real-world analogy

A wall socket is the abstraction. Your lamp (high-level) doesn't care whether the
power behind the wall comes from a coal plant, a solar farm, or a generator
(low-level details) — it just plugs into the standard socket interface. The
power company can change its generation method entirely without your lamp ever
knowing or needing to change.

## 6. Common misconceptions

| Misconception | Reality |
|---|---|
| "DIP means using a DI framework (Spring, Guice, etc.)" | DI frameworks are a *convenience* for wiring dependencies. DIP is the design principle; you can follow it with plain constructor injection and zero frameworks. |
| "Depending on any interface satisfies DIP" | Only if the interface is shaped around the high-level module's needs, not simply an auto-extracted wrapper around a concrete class's existing methods (that's just indirection, not inversion). |
| "DIP means never using `new`" | Some part of the system (the composition root — `main()`, a factory, a DI container config) always has to `new` up concrete classes. DIP pushes that to one designated place, not zero places. |

## 7. How to detect a DIP violation (checklist)

- [ ] Does a business-logic class directly `new` up a database client, HTTP client, file writer, or third-party SDK class?
- [ ] Can you unit-test the class's logic without spinning up a real DB/network/file system?
- [ ] If you swapped a library/provider, would you need to edit business-logic files (not just a factory/config)?
- [ ] Are import statements in your "business logic" package full of framework/infrastructure-specific types (`java.sql.*`, a specific vendor SDK)?

## 8. Interview Q&A

**Q: What's the difference between DIP and Dependency Injection?**
A: DIP is the *design principle*: depend on abstractions, not concretions. DI is
a *technique* for supplying those abstraction implementations from the outside
(constructor injection, setter injection, or a DI container) rather than
constructing them inside the class. DI is how you typically implement DIP in
practice, but they aren't interchangeable terms.

**Q: Who "owns" the interface — the high-level or low-level module?**
A: The high-level (business logic) module should own/define the interface,
shaped around what it needs. The low-level module then implements that
interface. This is the "inversion" — normally you'd expect the low-level
module's API to dictate the interface, but DIP flips that ownership toward the
consumer's needs.

**Q: Real example?**
A (framed generically): A worker/queue processor (high-level: "process this job")
shouldn't directly import a specific queue library's client type in its core
logic. Define a `JobQueue` interface with `enqueue()`/`dequeue()`, implement it
once against the specific queue library, and inject that implementation. Later,
swapping the underlying queue technology touches only the adapter implementing
`JobQueue` — the core processing logic is untouched.

**Q: How does DIP relate to OCP?**
A: They reinforce each other. DIP's abstraction layer is often exactly *how* you
achieve OCP's "open for extension, closed for modification" — new low-level
implementations can be added (extension) without modifying the high-level module
that depends on the abstraction (closed for modification).
