#!/usr/bin/env bash
set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$DIR/../.."

echo "🛠️ Opening iOS Xcode Workspace..."
open "$ROOT/pethar_mobile/ios/Runner.xcworkspace"
