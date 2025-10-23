#!/bin/bash
# Copyright 2025 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

set -eo pipefail

if [ -z "$1" ]; then
  echo "Usage: $0 <npm-script-to-run>"
  exit 1
fi

NPM_SCRIPT=$1

# Find all package directories by locating their package.json files.
PACKAGES=$(find packages dev-packages -name 'package.json' -not -path '*/node_modules/*' -exec dirname {} \;)

# Determine the list of changed files.
if [[ -n "$GITHUB_BASE_REF" ]]; then
  # In a pull request context, compare with the base branch.
  # GITHUB_BASE_REF is the name of the branch being targeted (e.g., 'main').
  # We need to fetch it to be able to compare against it.
  echo "Fetching origin/${GITHUB_BASE_REF}..."
  git fetch origin "${GITHUB_BASE_REF}"
  MERGE_BASE=$(git merge-base HEAD "origin/${GITHUB_BASE_REF}")
  CHANGED_FILES=$(git diff --name-only "$MERGE_BASE" HEAD)
else
  # In a push context (e.g., to main), compare with the previous commit.
  CHANGED_FILES=$(git diff --name-only HEAD~1 HEAD)
fi

echo "Changed files:"
echo "$CHANGED_FILES"

# Identify which packages have changed and run the specified script on them.
for pkg_location in ${PACKAGES}; do
  # Check if any changed file is within the package directory.
  if echo "$CHANGED_FILES" | grep -q "^${pkg_location}/"; then
    echo "------------------------------------------------------------"
    echo "Running 'npm run ${NPM_SCRIPT}' for changed package in: ${pkg_location}"
    echo "------------------------------------------------------------"
    (cd "${pkg_location}" && npm run "${NPM_SCRIPT}")
  fi
done
