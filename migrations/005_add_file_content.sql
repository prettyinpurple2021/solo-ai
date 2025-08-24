-- Add content indexing table for full-text search
CREATE TABLE IF NOT EXISTS file_content (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  file_id TEXT NOT NULL REFERENCES briefcase_files(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  word_count INTEGER DEFAULT 0,
  page_count INTEGER,
  author TEXT,
  title TEXT,
  created_date TEXT,
  modified_date TEXT,
  indexed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  content_hash TEXT, -- SHA-256 hash of content for change detection
  parsing_status TEXT DEFAULT 'success' CHECK (parsing_status IN ('success', 'failed', 'pending')),
  parsing_error TEXT,
  
  UNIQUE(file_id)
);

-- Create full-text search index
CREATE VIRTUAL TABLE IF NOT EXISTS file_content_fts USING fts5(
  file_id UNINDEXED,
  content,
  content=file_content,
  content_rowid=rowid
);

-- Triggers to keep FTS index in sync
CREATE TRIGGER IF NOT EXISTS file_content_ai AFTER INSERT ON file_content BEGIN
  INSERT INTO file_content_fts(rowid, file_id, content) 
  VALUES (new.rowid, new.file_id, new.content);
END;

CREATE TRIGGER IF NOT EXISTS file_content_ad AFTER DELETE ON file_content BEGIN
  INSERT INTO file_content_fts(file_content_fts, rowid, file_id, content) 
  VALUES('delete', old.rowid, old.file_id, old.content);
END;

CREATE TRIGGER IF NOT EXISTS file_content_au AFTER UPDATE ON file_content BEGIN
  INSERT INTO file_content_fts(file_content_fts, rowid, file_id, content) 
  VALUES('delete', old.rowid, old.file_id, old.content);
  INSERT INTO file_content_fts(rowid, file_id, content) 
  VALUES (new.rowid, new.file_id, new.content);
END;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_file_content_file_id ON file_content(file_id);
CREATE INDEX IF NOT EXISTS idx_file_content_indexed_at ON file_content(indexed_at);
CREATE INDEX IF NOT EXISTS idx_file_content_status ON file_content(parsing_status);
