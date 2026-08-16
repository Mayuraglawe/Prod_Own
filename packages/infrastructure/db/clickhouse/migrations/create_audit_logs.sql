CREATE TABLE IF NOT EXISTS global_audit_logs (
    id UUID,
    timestamp DateTime64(3),
    actor_id UUID,
    actor_email String,
    action_type Enum8('SUSPEND_ORG' = 1, 'TIER_UPGRADE' = 2, 'USER_DELETE' = 3, 'FEATURE_FLAG_TOGGLE' = 4),
    target_resource_id String,
    old_state JSON,
    new_state JSON,
    ip_address String,
    user_agent String
) ENGINE = MergeTree()
ORDER BY (timestamp, action_type);

