drop trigger if exists standups_ai;
drop trigger if exists standups_au;
drop trigger if exists standups_ad;

drop table if exists standups_fts;
drop table if exists standups;
create table if not exists standups (
    id INTEGER primary key autoincrement,
    date text not null unique,
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


create trigger standups_ai after insert on standups begin
insert into standups_fts(rowid, date, morning_plan, evening_done)
values (new.id, new.date, new.morning_plan, new.evening_done);
end;


create trigger standups_au after update on standups begin
insert into standups_fts(standups_fts, rowid, date, morning_plan, evening_done)
values ('delete', old.id, old.date, old.morning_plan, old.evening_done);

insert into standups_fts(
rowid, date, morning_plan, evening_done)


values (
new.id, new.date, new.morning_plan, new.evening_done);
end;

create trigger standups_ad after delete on standups begin
    insert into standups_fts(
        standups_fts,
        rowid,
        date,
        morning_plan,
        evening_done
    )
    values (
        'delete',
        old.id,
        old.date,
        old.morning_plan,
        old.evening_done
    );
end;
