alter table app_users add column revoked_at timestamp with time zone;

create table publication_preview_tokens (
    id uuid primary key,
    user_id uuid not null references app_users(id) on delete cascade,
    record_id uuid not null references profile_records(id) on delete cascade,
    version_id uuid not null references record_versions(id) on delete cascade,
    candidate_visibility varchar(16) not null,
    token_hash char(64) not null unique,
    expires_at timestamp with time zone not null,
    consumed_at timestamp with time zone,
    created_at timestamp with time zone not null,
    constraint publication_preview_visibility check (candidate_visibility in ('private', 'public'))
);

create index publication_preview_validation
    on publication_preview_tokens(token_hash, user_id, record_id, version_id, expires_at);
