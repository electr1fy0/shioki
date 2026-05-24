create table if not exists standups (
    id INTEGER primary key autoincrement,
    date text not null,
    morning_plan text,
    evening_done text,
    created_at datetime default current_timestamp
);

create virtual table if not exists standups_fts using fts5 (
    date,
    morning_plan,
    evening_done,
    content='standups',
    content_rowid='id'
);
