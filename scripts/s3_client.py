#!/usr/bin/env python3
"""
Lightweight S3 CLI Client for Tigris / InstaCloud Object Storage
Supports commands:
- s3 ls [s3://bucket/prefix]
- s3 cp <local_file> s3://bucket/key  (upload)
- s3 cp s3://bucket/key <local_file>  (download)
- s3 rm s3://bucket/key               (delete)
- s3 presign <key> [--expires <sec>]  (generate presigned URL)
Also supports being called as: aws s3 <command> ...
"""

import os
import sys
import glob
import warnings

warnings.filterwarnings("ignore")

# Ensure user site-packages are discovered even when HOME is shadowed by subshells
for path in glob.glob("/Users/*/Library/Python/*/lib/python/site-packages") + glob.glob("/Users/*/.local/lib/python*/site-packages"):
    if path not in sys.path:
        sys.path.append(path)

try:
    import boto3
    from botocore.config import Config
except ImportError:
    print("Error: boto3 is required. Install with: pip3 install boto3", file=sys.stderr)
    sys.exit(1)

# S3 Configuration (Tigris / S3 compatible)
ENDPOINT_URL = os.getenv("AWS_ENDPOINT_URL_S3", os.getenv("AWS_ENDPOINT_URL", "https://t3.storage.dev"))
ACCESS_KEY = os.getenv("AWS_ACCESS_KEY_ID", "")
SECRET_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "")
REGION = os.getenv("AWS_REGION", "auto")
DEFAULT_BUCKET = os.getenv("BUCKET_NAME", "pethar-kyc-storage")


def get_client():
    return boto3.client(
        "s3",
        endpoint_url=ENDPOINT_URL,
        aws_access_key_id=ACCESS_KEY,
        aws_secret_access_key=SECRET_KEY,
        region_name=REGION,
        config=Config(signature_version="s3v4")
    )


def parse_s3_uri(uri):
    if uri.startswith("s3://"):
        uri = uri[5:]
        parts = uri.split("/", 1)
        bucket = parts[0]
        key = parts[1] if len(parts) > 1 else ""
        return bucket, key
    return DEFAULT_BUCKET, uri


def cmd_ls(args):
    s3 = get_client()
    bucket = DEFAULT_BUCKET
    prefix = ""

    if args:
        target = args[0]
        b, k = parse_s3_uri(target)
        if b:
            bucket = b
        prefix = k

    try:
        paginator = s3.get_paginator("list_objects_v2")
        count = 0
        total_size = 0
        for page in paginator.paginate(Bucket=bucket, Prefix=prefix):
            for obj in page.get("Contents", []):
                count += 1
                total_size += obj["Size"]
                last_mod = obj["LastModified"].strftime("%Y-%m-%d %H:%M:%S")
                print(f"{last_mod}  {obj['Size']:>10}  {obj['Key']}")

        if count == 0:
            print(f"(bucket '{bucket}' is empty or no objects matched prefix '{prefix}')")
        else:
            print(f"\nTotal: {count} objects, {total_size} bytes ({total_size / (1024*1024):.2f} MB)")
    except Exception as e:
        print(f"Error listing bucket '{bucket}': {e}", file=sys.stderr)
        sys.exit(1)


def cmd_cp(args):
    if len(args) < 2:
        print("Usage: s3 cp <src> <dst>", file=sys.stderr)
        sys.exit(1)

    src, dst = args[0], args[1]
    s3 = get_client()

    if src.startswith("s3://"):
        # Download
        bucket, key = parse_s3_uri(src)
        local_path = dst
        if os.path.isdir(local_path):
            local_path = os.path.join(local_path, os.path.basename(key))
        try:
            print(f"Downloading s3://{bucket}/{key} -> {local_path}...")
            s3.download_file(bucket, key, local_path)
            print(f"✅ Download complete: {local_path}")
        except Exception as e:
            print(f"Error downloading: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        # Upload
        if not os.path.isfile(src):
            print(f"Error: local file '{src}' not found", file=sys.stderr)
            sys.exit(1)
        bucket, key = parse_s3_uri(dst)
        if not key or key.endswith("/"):
            key = (key or "") + os.path.basename(src)
        try:
            print(f"Uploading {src} -> s3://{bucket}/{key}...")
            s3.upload_file(src, bucket, key)
            print(f"✅ Upload complete: s3://{bucket}/{key}")
        except Exception as e:
            print(f"Error uploading: {e}", file=sys.stderr)
            sys.exit(1)


def cmd_rm(args):
    if not args:
        print("Usage: s3 rm <s3://bucket/key>", file=sys.stderr)
        sys.exit(1)

    bucket, key = parse_s3_uri(args[0])
    s3 = get_client()
    try:
        s3.delete_object(Bucket=bucket, Key=key)
        print(f"✅ Deleted s3://{bucket}/{key}")
    except Exception as e:
        print(f"Error deleting: {e}", file=sys.stderr)
        sys.exit(1)


def cmd_presign(args):
    if not args:
        print("Usage: s3 presign <key> [--expires <seconds>]", file=sys.stderr)
        sys.exit(1)

    key = args[0]
    bucket, key = parse_s3_uri(key)
    expires_in = 3600
    if len(args) >= 3 and args[1] == "--expires":
        expires_in = int(args[2])

    s3 = get_client()
    try:
        url = s3.generate_presigned_url(
            "get_object",
            Params={"Bucket": bucket, "Key": key},
            ExpiresIn=expires_in
        )
        print(f"Presigned URL (valid for {expires_in}s):")
        print(url)
    except Exception as e:
        print(f"Error generating presigned URL: {e}", file=sys.stderr)
        sys.exit(1)


def main():
    args = sys.argv[1:]

    # Handle `aws s3 <command>` format
    if args and args[0] == "s3":
        args = args[1:]

    if not args or args[0] in ("-h", "--help", "help"):
        print(__doc__)
        sys.exit(0)

    cmd = args[0]
    cmd_args = args[1:]

    if cmd == "ls":
        cmd_ls(cmd_args)
    elif cmd == "cp":
        cmd_cp(cmd_args)
    elif cmd == "rm":
        cmd_rm(cmd_args)
    elif cmd == "presign":
        cmd_presign(cmd_args)
    else:
        print(f"Unknown command: {cmd}. Available: ls, cp, rm, presign", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
