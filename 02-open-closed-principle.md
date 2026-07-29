# Open/Closed Principle (OCP)

> "Software entities (classes, modules, functions) should be open for extension,
> but closed for modification."
> — Bertrand Meyer (popularized by Robert C. Martin)

## 1. What it actually means

- **Open for extension**: you should be able to add new behavior.
- **Closed for modification**: you should do so *without changing existing,
  already-tested source code*.

The mechanism to achieve this is almost always **abstraction + polymorphism**
(interfaces/abstract classes), not editing `if/else` or `switch` chains every time
a new case appears.

## 2. Why it matters

| Problem without OCP | Consequence |
|---|---|
| Adding a new type means editing an existing, tested class | Risk of regressions in code that already worked |
| Big switch/if-else chains scattered across the codebase | Same new case has to be added in 5 different places |
| Every new feature requires touching core logic | Code reviews get riskier, deploys more nerve-wracking |

## 3. Violation Example (Java)

```java
public class DiscountCalculator {

    public double calculateDiscount(String customerType, double amount) {
        if (customerType.equals("REGULAR")) {
            return amount * 0.0;
        } else if (customerType.equals("SILVER")) {
            return amount * 0.05;
        } else if (customerType.equals("GOLD")) {
            return amount * 0.10;
        } else if (customerType.equals("PLATINUM")) {
            return amount * 0.15;
        }
        // Every new customer tier means editing this method again.
        throw new IllegalArgumentException("Unknown customer type");
    }
}
```

**Why this is bad:** Adding a new tier ("DIAMOND") means modifying
`DiscountCalculator`, re-testing the whole method, and risking breaking the
existing tiers. This class is never "closed" — it's permanently open to edits.

## 4. Fixed Example (Java) — Strategy Pattern

```java
public interface DiscountStrategy {
    double apply(double amount);
}

public class RegularDiscount implements DiscountStrategy {
    public double apply(double amount) { return amount * 0.0; }
}

public class SilverDiscount implements DiscountStrategy {
    public double apply(double amount) { return amount * 0.05; }
}

public class GoldDiscount implements DiscountStrategy {
    public double apply(double amount) { return amount * 0.10; }
}

public class PlatinumDiscount implements DiscountStrategy {
    public double apply(double amount) { return amount * 0.15; }
}

// Consumer — never changes when a new tier is added
public class DiscountCalculator {
    public double calculateDiscount(DiscountStrategy strategy, double amount) {
        return strategy.apply(amount);
    }
}
```

Adding "DIAMOND" now means **adding a new class**, `DiamondDiscount`, without
touching `DiscountCalculator` or any existing tier class at all.

```java
public class DiamondDiscount implements DiscountStrategy {
    public double apply(double amount) { return amount * 0.20; }
}
```

## 5. Real-world analogy

A power strip is "closed for modification" (you don't rewire your wall socket to
add a new device) but "open for extension" (you plug a new device into an open
socket). USB ports, browser extensions, and payment gateway plugins work the same
way — extend by plugging in something new, not by editing the core.

## 6. Common misconceptions

| Misconception | Reality |
|---|---|
| "OCP means never editing any file again" | Bug fixes and refactors are fine. OCP targets adding *new behavior/variants*, not all changes forever. |
| "Every if/else violates OCP" | Only recurring "type-based branching that grows over time" is the target — a one-off validation check isn't a violation. |
| "OCP requires inheritance" | Composition (strategy pattern, dependency injection) is usually preferred over inheritance to achieve OCP. |

## 7. How to detect an OCP violation (checklist)

- [ ] Do you see a `switch`/`if-else` chain keyed on a "type" field that has grown over multiple sprints?
- [ ] Does adding a new "kind of X" require touching more than one existing file?
- [ ] Do code reviewers keep saying "just add another case here" as the standard way to extend a feature?
- [ ] Is the same type-check duplicated in multiple unrelated places (validation, calculation, serialization)?

## 8. Interview Q&A

**Q: How do you implement OCP in practice?**
A: Define an abstraction (interface/abstract class), have the "variant" behaviors
implement it, and have the consuming code depend on the abstraction. New variants =
new implementing classes, zero changes to consumer code. Common patterns: Strategy,
Template Method, Decorator, Plugin architecture.

**Q: Isn't the Strategy Pattern the same as OCP?**
A: Strategy Pattern is one of the most common *implementations* of OCP, not the
principle itself. OCP is the goal; Strategy (along with Decorator, Visitor,
Plugin architectures) is a tool to reach it.

**Q: Can you have 100% OCP compliance?**
A: No — some part of the system always has to know how to construct/wire the
concrete implementations (a factory, a DI container, a config-driven registry).
OCP pushes that "knowledge of concrete types" to the smallest possible edge of the
system (e.g., a factory or config file) instead of scattering it through business
logic.

**Q: Real example?**
A (framed generically): An alert-rule engine that evaluates conditions
(threshold breach, new issue, regression) should have each condition type
implement a common `AlertRule` interface, rather than the evaluator having a giant
switch on `rule.type`. Adding "spike detection" as a new rule type means adding one
new class, not touching the evaluator.
