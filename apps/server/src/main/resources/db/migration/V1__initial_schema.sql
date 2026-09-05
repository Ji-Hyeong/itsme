create table app_users (
    id uuid primary key,
    email varchar(320) not null unique,
    password_hash varchar(100) not null,
    display_name varchar(80) not null,
    intro varchar(180),
    slug varchar(48) not null unique,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    constraint app_users_email_normalized check (email = lower(email)),
    constraint app_users_slug_format check (slug ~ '^[a-z0-9][a-z0-9-]{2,47}$')
);

create table user_sessions (
    id uuid primary key,
    user_id uuid not null references app_users(id) on delete cascade,
    token_hash char(64) not null unique,
    expires_at timestamp with time zone not null,
    last_used_at timestamp with time zone not null,
    revoked_at timestamp with time zone,
    created_at timestamp with time zone not null
);

create index user_sessions_active_lookup on user_sessions(token_hash, expires_at);

create table questions (
    id varchar(80) primary key,
    category varchar(24) not null,
    chapter varchar(120) not null,
    title varchar(120) not null,
    prompt varchar(300) not null,
    kind varchar(16) not null,
    guidance varchar(300),
    placeholder varchar(300),
    sort_order integer not null unique,
    active boolean not null default true,
    constraint questions_category check (category in ('preference', 'personality', 'value', 'strength', 'learning', 'support')),
    constraint questions_kind check (kind in ('choice', 'text'))
);

create table question_options (
    question_id varchar(80) not null references questions(id) on delete cascade,
    option_order integer not null,
    label varchar(120) not null,
    option_value varchar(120) not null,
    swatch varchar(16),
    primary key (question_id, option_order)
);

create table profile_records (
    id uuid primary key,
    user_id uuid not null references app_users(id) on delete cascade,
    question_id varchar(80) not null references questions(id),
    category varchar(24) not null,
    title varchar(120) not null,
    visibility varchar(16) not null default 'private',
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    unique (user_id, question_id),
    constraint profile_records_category check (category in ('preference', 'personality', 'value', 'strength', 'learning', 'support')),
    constraint profile_records_visibility check (visibility in ('private', 'public'))
);

create table record_versions (
    id uuid primary key,
    record_id uuid not null references profile_records(id) on delete cascade,
    version_number integer not null,
    answer varchar(600) not null,
    context varchar(1200),
    changed_because varchar(1200),
    next_step varchar(600),
    recorded_at timestamp with time zone not null,
    unique (record_id, version_number),
    constraint record_versions_answer_nonblank check (length(trim(answer)) > 0),
    constraint record_versions_positive_version check (version_number > 0)
);

create index profile_records_owner_order on profile_records(user_id, updated_at desc);
create index profile_records_public on profile_records(user_id, visibility, updated_at desc);
create index record_versions_current on record_versions(record_id, version_number desc);
