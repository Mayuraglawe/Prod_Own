# SOLID Principles — Index

SOLID is an acronym for 5 object-oriented design principles that make code easier to
maintain, extend, and test. Coined by Robert C. Martin ("Uncle Bob"), popularized
through Java/C# codebases, but the ideas apply to Go, TypeScript, Python — any
language with interfaces/abstraction, really.

| # | Principle | One-liner | File |
|---|-----------|-----------|------|
| S | Single Responsibility Principle | A class should have one, and only one, reason to change | [01-single-responsibility-principle.md](./01-single-responsibility-principle.md) |
| O | Open/Closed Principle | Open for extension, closed for modification | [02-open-closed-principle.md](./02-open-closed-principle.md) |
| L | Liskov Substitution Principle | Subtypes must be substitutable for their base types | [03-liskov-substitution-principle.md](./03-liskov-substitution-principle.md) |
| I | Interface Segregation Principle | No client should be forced to depend on methods it doesn't use | [04-interface-segregation-principle.md](./04-interface-segregation-principle.md) |
| D | Dependency Inversion Principle | Depend on abstractions, not concretions | [05-dependency-inversion-principle.md](./05-dependency-inversion-principle.md) |

## Why this matters (short version)

Every principle attacks the same enemy: **tight coupling that makes change expensive.**

| Without SOLID | With SOLID |
|---|---|
| One change ripples across unrelated code | Changes are isolated to one place |
| Adding a feature means editing tested code | Adding a feature means adding new code |
| Hard to unit test (everything is entangled) | Easy to mock/stub dependencies |
| New devs afraid to touch anything | Codebase is predictable, safe to extend |

## Reading order

If you're prepping for interviews, read in this order: **S → D → O → L → I**.
SRP and DIP show up in almost every real interview question ("how would you design
X so it's testable/extensible"). LSP and ISP are asked more rarely but are common
"explain with an example" questions.

## Quick interview-ready definitions (memorize these)

1. **SRP** — A class/module should have only one reason to change.
2. **OCP** — Software entities should be open for extension but closed for modification.
3. **LSP** — Objects of a superclass should be replaceable with objects of a subclass without breaking the application.
4. **ISP** — Many client-specific interfaces are better than one general-purpose interface.
5. **DIP** — High-level modules should not depend on low-level modules; both should depend on abstractions.

Each linked file has the full breakdown: violation code, fixed code, real-world
analogy, common misconceptions, and interview Q&A.
