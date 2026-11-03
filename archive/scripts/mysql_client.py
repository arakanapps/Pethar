#!/usr/bin/env python3
"""
Lightweight MySQL CLI Client
Connects to MySQL using PyMySQL. Supports standard CLI flags:
-h host, -P port, -u user, -p[password], -e "query", and MYSQL_PWD environment variable.
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
    import pymysql
except ImportError:
    print("Error: pymysql is required. Install with: pip3 install pymysql", file=sys.stderr)
    sys.exit(1)


def parse_args():
    host = os.getenv("MYSQL_HOST", "127.0.0.1")
    port = int(os.getenv("MYSQL_PORT", "3306"))
    user = os.getenv("MYSQL_USERNAME", os.getenv("USER", "root"))
    password = os.getenv("MYSQL_PWD", os.getenv("MYSQL_PASSWORD", ""))
    database = os.getenv("MYSQL_DATABASE", None)
    query = None

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
        elif arg == "-P" and i + 1 < len(args):
            port = int(args[i + 1])
            i += 2
        elif arg.startswith("-P"):
            port = int(arg[2:])
            i += 1
        elif arg == "-u" and i + 1 < len(args):
            user = args[i + 1]
            i += 2
        elif arg.startswith("-u"):
            user = arg[2:]
            i += 1
        elif arg == "-p":
            prompt_pwd = True
            i += 1
        elif arg.startswith("-p"):
            password = arg[2:]
            i += 1
        elif arg == "-e" and i + 1 < len(args):
            query = args[i + 1]
            i += 2
        elif arg.startswith("-e"):
            query = arg[2:]
            i += 1
        elif arg == "--version" or arg == "-V":
            print("mysql (PeThar PyMySQL Client) v8.4.11-compatible")
            sys.exit(0)
        elif not arg.startswith("-"):
            database = arg
            i += 1
        else:
            i += 1

    if prompt_pwd and not password:
        password = getpass.getpass("Enter password: ")

    return host, port, user, password, database, query


def main():
    host, port, user, password, database, query = parse_args()

    try:
        conn = pymysql.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database=database,
            charset="utf8mb4",
            autocommit=True
        )
    except Exception as e:
        print(f"ERROR: Cannot connect to MySQL server at {host}:{port}: {e}", file=sys.stderr)
        sys.exit(1)

    cursor = conn.cursor()

    if query:
        # Execute query passed via -e
        try:
            cursor.execute(query)
            if cursor.description:
                headers = [d[0] for d in cursor.description]
                print("\t".join(headers))
                for row in cursor.fetchall():
                    print("\t".join(str(val) for val in row))
            conn.close()
        except Exception as e:
            print(f"ERROR: {e}", file=sys.stderr)
            conn.close()
            sys.exit(1)
        return

    # Interactive REPL
    print(f"Welcome to the MySQL monitor. Connected to {host}:{port}")
    if database:
        print(f"Database: {database}")
    print("Type 'exit' or 'quit' to quit.\n")

    while True:
        try:
            sql = input(f"mysql [{database or 'none'}]> ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nBye")
            break

        if not sql:
            continue
        if sql.lower() in ("exit", "quit", "\\q"):
            print("Bye")
            break

        if sql.lower().startswith("use "):
            new_db = sql[4:].strip().rstrip(";")
            try:
                conn.select_db(new_db)
                database = new_db
                print(f"Database changed to {database}")
            except Exception as e:
                print(f"ERROR: {e}")
            continue

        try:
            cursor.execute(sql)
            if cursor.description:
                headers = [d[0] for d in cursor.description]
                print("\t".join(headers))
                print("-" * (len("\t".join(headers)) + 10))
                rows = cursor.fetchall()
                for row in cursor.fetchall():
                    print("\t".join(str(val) for val in row))
                print(f"({len(rows)} rows)")
            else:
                print(f"Query OK, {cursor.rowcount} rows affected")
        except Exception as e:
            print(f"ERROR: {e}")

    conn.close()


if __name__ == "__main__":
    main()
