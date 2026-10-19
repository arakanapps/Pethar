#!/usr/bin/env python3
"""
Lightweight PostgreSQL (psql) CLI Client
Connects to PostgreSQL using psycopg2. Supports standard psql flags:
-h host, -p port, -U user, -d database, -c "query", and PGPASSWORD environment variable.
"""

import os
import sys
import getpass
import glob

# Ensure user site-packages are discovered even when HOME is shadowed by subshells
for path in glob.glob("/Users/*/Library/Python/*/lib/python/site-packages") + glob.glob("/Users/*/.local/lib/python*/site-packages"):
    if path not in sys.path:
        sys.path.append(path)

try:
    import psycopg2
except ImportError:
    print("Error: psycopg2 is required. Install with: pip3 install psycopg2-binary", file=sys.stderr)
    sys.exit(1)


from urllib.parse import urlparse

def parse_args():
    # Environment variable defaults
    host = os.getenv("PGHOST", "127.0.0.1")
    port = int(os.getenv("PGPORT", "5432"))
    user = os.getenv("PGUSER", os.getenv("USER", "postgres"))
    password = os.getenv("PGPASSWORD", "")
    database = os.getenv("PGDATABASE", "postgres")
    query = None

    db_url = os.getenv("DATABASE_URL")
    if db_url:
        try:
            parsed = urlparse(db_url)
            if parsed.hostname:
                host = parsed.hostname
            if parsed.port:
                port = parsed.port
            if parsed.username:
                user = parsed.username
            if parsed.password:
                password = parsed.password
            if parsed.path and len(parsed.path) > 1:
                database = parsed.path.lstrip("/")
        except Exception:
            pass

    args = sys.argv[1:]
    i = 0
    prompt_pwd = False

    while i < len(args):
        arg = args[i]
        if arg == "-h" and i + 1 < len(args):
            host = args[i + 1]
            i += 2
        elif arg.startswith("-h"):
            host = arg[2:]
            i += 1
        elif arg == "-p" and i + 1 < len(args):
            port = int(args[i + 1])
            i += 2
        elif arg.startswith("-p"):
            port = int(arg[2:])
            i += 1
        elif arg == "-U" and i + 1 < len(args):
            user = args[i + 1]
            i += 2
        elif arg.startswith("-U"):
            user = arg[2:]
            i += 1
        elif arg == "-d" and i + 1 < len(args):
            database = args[i + 1]
            i += 2
        elif arg.startswith("-d"):
            database = arg[2:]
            i += 1
        elif (arg == "-c" or arg == "--command") and i + 1 < len(args):
            query = args[i + 1]
            i += 2
        elif arg.startswith("-c"):
            query = arg[2:]
            i += 1
        elif arg == "-W":
            prompt_pwd = True
            i += 1
        elif arg == "--version" or arg == "-V":
            print("psql (PeThar psycopg2 Client) v16.15-compatible")
            sys.exit(0)
        elif not arg.startswith("-"):
            database = arg
            i += 1
        else:
            i += 1

    if prompt_pwd and not password:
        password = getpass.getpass("Password: ")

    return host, port, user, password, database, query


def main():
    host, port, user, password, database, query = parse_args()

    # Try connecting with sslmode='prefer' or 'require'
    conn = None
    ssl_options = ["require", "prefer", "disable"]
    last_err = None

    for sslmode in ssl_options:
        try:
            conn = psycopg2.connect(
                host=host,
                port=port,
                user=user,
                password=password,
                dbname=database,
                sslmode=sslmode,
                connect_timeout=10
            )
            break
        except Exception as e:
            last_err = e

    if conn is None:
        print(f"psql: error: connection to server at \"{host}\", port {port} failed: {last_err}", file=sys.stderr)
        sys.exit(1)

    conn.autocommit = True
    cur = conn.cursor()

    if query:
        # Run query passed with -c
        try:
            cur.execute(query)
            if cur.description:
                headers = [d[0] for d in cur.description]
                rows = cur.fetchall()
                # Print table
                col_widths = [max(len(h), max((len(str(r[idx])) for r in rows), default=0)) for idx, h in enumerate(headers)]
                header_line = " | ".join(h.ljust(w) for h, w in zip(headers, col_widths))
                sep_line = "-+-".join("-" * w for w in col_widths)
                print(header_line)
                print(sep_line)
                for r in rows:
                    print(" | ".join(str(val).ljust(w) for val, w in zip(r, col_widths)))
                print(f"({len(rows)} row{'s' if len(rows) != 1 else ''})")
            conn.close()
        except Exception as e:
            print(f"ERROR: {e}", file=sys.stderr)
            conn.close()
            sys.exit(1)
        return

    # Interactive REPL
    print(f"psql (16.15)\nType \"help\" for help.\n")
    while True:
        try:
            prompt = f"{database}=> "
            sql = input(prompt).strip()
        except (EOFError, KeyboardInterrupt):
            print("\n")
            break

        if not sql:
            continue
        if sql.lower() in ("exit", "quit", "\\q"):
            break

        if sql.lower() in ("\\l", "\\l+"):
            sql = "SELECT datname FROM pg_database WHERE datistemplate = false;"
        elif sql.lower() in ("\\dt", "\\dt+"):
            sql = "SELECT tablename FROM pg_tables WHERE schemaname = 'public';"

        try:
            cur.execute(sql)
            if cur.description:
                headers = [d[0] for d in cur.description]
                rows = cur.fetchall()
                col_widths = [max(len(h), max((len(str(r[idx])) for r in rows), default=0)) for idx, h in enumerate(headers)]
                header_line = " | ".join(h.ljust(w) for h, w in zip(headers, col_widths))
                sep_line = "-+-".join("-" * w for w in col_widths)
                print(header_line)
                print(sep_line)
                for r in rows:
                    print(" | ".join(str(val).ljust(w) for val, w in zip(r, col_widths)))
                print(f"({len(rows)} row{'s' if len(rows) != 1 else ''})")
            else:
                print(f"Query OK: {cur.statusmessage or 'Success'}")
        except Exception as e:
            print(f"ERROR: {e}")

    conn.close()


if __name__ == "__main__":
    main()
