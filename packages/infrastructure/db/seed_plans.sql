-- This script inserts the default monthly subscription plans for the platform.
-- It can be safely run multiple times without causing duplicates because of the ON CONFLICT clause.

INSERT INTO "SubscriptionPlan" (
    "id", 
    "tierCode", 
    "name", 
    "price", 
    "currency", 
    "isPopular", 
    "features", 
    "isActive", 
    "createdAt", 
    "updatedAt"
) VALUES 
(
    'plan_cl_starter_01', 
    'starter', 
    'Starter Plan', 
    9900, 
    'INR', 
    true, 
    '["100,000 Log Events per month", "7 Days Data Retention", "Up to 3 Team Members", "Community Support"]'::jsonb, 
    true, 
    NOW(), 
    NOW()
),
(
    'plan_cl_pro_01', 
    'pro', 
    'Pro Plan', 
    49900, 
    'INR', 
    false, 
    '["500,000 Log Events per month", "30 Days Data Retention", "Unlimited Team Members", "Priority Email Support", "Custom Webhooks"]'::jsonb, 
    true, 
    NOW(), 
    NOW()
)
ON CONFLICT ("tierCode") DO UPDATE SET 
    "name" = EXCLUDED."name",
    "price" = EXCLUDED."price",
    "features" = EXCLUDED."features",
    "isPopular" = EXCLUDED."isPopular",
    "updatedAt" = EXCLUDED."updatedAt";
