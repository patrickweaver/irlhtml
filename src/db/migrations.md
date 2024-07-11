# Database Migrations

This is not functional and is just a record

1
2023-06-03

```SQL
CREATE TABLE IF NOT EXISTS Pages (
    id text NOT NULL PRIMARY KEY,
    source_code text NOT NULL,
    date_created text NOT NULL,
    date_updated text NOT NULL
);
```

2
2024-07-10

```SQL
ALTER TABLE Pages
ADD slug text
;
UPDATE Pages
SET slug = substr(id, 0, 5)
;
ALTER TABLE Pages
ADD author text
;
```

3
2024-07-10

```SQL
UPDATE Pages
SET author = "Patrick"
WHERE id = "1c2e169b-b929-47e5-8fb4-266ff703abe6"
;
```
