# discord.js_PG

Discord chat logger with PostgreSQL

## Installation

* Clone the repo and edit the index.js file 



## Usage

You will need to run this query first for now.

```SQL
CREATE TABLE message_logs (
                              id SERIAL PRIMARY KEY,
                              server_id TEXT NOT NULL,
                              server_name TEXT NOT NULL,
                              channel_name TEXT NOT NULL,
                              username TEXT NOT NULL,
                              user_id TEXT NOT NULL,
                              channel_id TEXT NOT NULL,
                              message_content TEXT NOT NULL,
                              created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```