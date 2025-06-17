CREATE TABLE IF NOT EXISTS guestbook_entries (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  author TEXT NOT NULL,
  content TEXT NOT NULL
) STRICT;