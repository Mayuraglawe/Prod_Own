# Single Responsibility Principle (SRP)

> "A class should have one, and only one, reason to change."
> — Robert C. Martin

## 1. What it actually means

SRP is **not** "a class should do one thing" in the sense of "one method." It's about
**one axis of change**. A class can have multiple methods and still be SRP-compliant,
as long as all those methods change for the same reason (i.e., they serve the same
"actor" or stakeholder).

The word "responsibility" = **a reason to change**, tied to **one actor/stakeholder**.

If a class's code would need to be edited because of decisions from two different
people/departments (e.g., Finance changes the tax calculation rules, and IT changes
how reports are formatted) — that class has two responsibilities and violates SRP.

## 2. Why it matters

| Problem without SRP | Consequence |
|---|---|
| Class handles business logic + persistence + formatting | Changing DB schema breaks business logic tests |
| Multiple teams touch the same file for unrelated reasons | Merge conflicts, regressions |
| Hard to unit test | You can't test "calculate total" without mocking file I/O |
| Hard to reuse | You wanted just the calculation, but you're forced to drag persistence code with it |

## 3. Violation Example (Java)

```java
public class Invoice {

    private List<Item> items;

    public Invoice(List<Item> items) {
        this.items = items;
    }

    // Reason to change #1: Finance changes how tax/discount is calculated
    public double calculateTotal() {
        double total = 0;
        for (Item item : items) {
            total += item.getPrice() * item.getQuantity();
        }
        return total;
    }

    // Reason to change #2: Product team changes what the printed invoice looks like
    public void printInvoice() {
        System.out.println("---- INVOICE ----");
        for (Item item : items) {
            System.out.println(item.getName() + " x " + item.getQuantity());
        }
        System.out.println("Total: " + calculateTotal());
    }

    // Reason to change #3: DBA changes the storage engine/schema
    public void saveToDatabase() {
        String sql = "INSERT INTO invoices (...) VALUES (...)";
        // JDBC / Hibernate code here
    }
}
```

**Why this is bad:** `Invoice` now changes if:
1. Tax calculation rules change (finance)
2. Invoice print format changes (product/design)
3. Database schema or persistence tech changes (infra/DBA)

Three unrelated teams can each force a change to this one file. Testing
`calculateTotal()` now requires a live/mocked DB connection just to construct the
class in some designs, or at least drags persistence concerns into the same file
you're trying to unit-test.

## 4. Fixed Example (Java)

```java
// Responsibility 1: Pure business logic — what the invoice IS and its total
public class Invoice {
    private final List<Item> items;

    public Invoice(List<Item> items) {
        this.items = items;
    }

    public List<Item> getItems() {
        return items;
    }

    public double calculateTotal() {
        double total = 0;
        for (Item item : items) {
            total += item.getPrice() * item.getQuantity();
        }
        return total;
    }
}

// Responsibility 2: How the invoice is displayed/printed
public class InvoicePrinter {
    public void print(Invoice invoice) {
        System.out.println("---- INVOICE ----");
        for (Item item : invoice.getItems()) {
            System.out.println(item.getName() + " x " + item.getQuantity());
        }
        System.out.println("Total: " + invoice.calculateTotal());
    }
}

// Responsibility 3: How the invoice is persisted
public class InvoiceRepository {
    public void save(Invoice invoice) {
        String sql = "INSERT INTO invoices (...) VALUES (...)";
        // JDBC / Hibernate code here
    }
}
```

Now:
- Finance changes tax logic → edit `Invoice` only.
- Design changes print layout → edit `InvoicePrinter` only.
- DBA changes storage tech → edit `InvoiceRepository` only.
- Unit testing `calculateTotal()` needs zero mocks.

## 5. Real-world analogy

Think of a restaurant: the **chef** cooks, the **waiter** serves, the **cashier**
bills. If one person did all three, a change in menu, service style, or payment
processor would all disrupt the same person's workflow. Splitting these roles means
each role changes independently.

## 6. Common misconceptions

| Misconception | Reality |
|---|---|
| "SRP means one method per class" | False. A class can have many methods, as long as they share one reason to change. |
| "SRP means classes must be tiny" | Size is a side effect, not the goal. Focus on "reasons to change," not line count. |
| "Utility/helper classes violate SRP because they have many static methods" | Only if those methods serve unrelated actors. A `StringUtils` class with only string-manipulation helpers is fine. |
| "SRP applies only to classes" | It applies to modules, functions, and even microservices at a higher level. |

## 7. How to detect an SRP violation (checklist)

- [ ] Can you describe the class's job with an "AND" ("this class calculates totals **and** saves to DB **and** formats output")? → violation.
- [ ] Do two different teams/stakeholders request changes to this same file for unrelated reasons?
- [ ] Does testing one method force you to mock unrelated infrastructure (DB, network, file system)?
- [ ] Does the class import libraries from very different domains (e.g., `java.sql.*` next to `javax.mail.*` next to core business types)?

## 8. Interview Q&A

**Q: How is SRP different from "a class should do only one thing"?**
A: SRP is about reasons to change tied to actors/stakeholders, not literal task
count. A class handling all order-validation logic can have 10 methods and still be
SRP-compliant if all 10 exist because of the same business rule owner.

**Q: Give a real example from a project you've built.**
A (framed generically): In a backend service, keep the fingerprint/grouping logic
(business rule: how errors get deduplicated) separate from the persistence layer
(how it's stored in Postgres) and separate from the delivery layer (how alerts get
sent via webhook). Each layer changes independently — grouping algorithm tweaks
don't touch the DB layer, webhook format changes don't touch grouping logic.

**Q: Does SRP hurt performance by creating too many small classes?**
A: Marginally, if at all — most overhead is negligible compared to the maintainability
win. The real cost of violating SRP is compounding technical debt, not the cost of an
extra object.

**Q: What's the relationship between SRP and cohesion?**
A: SRP is essentially a formalization of high cohesion — grouping together things
that change for the same reason, and separating things that don't.
