#!/bin/bash
# Copyright 2023 Google LLC
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


set -e

# This script is used to run tests on all of the interdependent libraries
# in this monorepo. It will:
#
# 1. Build a dependency graph of all the libraries in the monorepo
# 2. Run the tests for each library in the correct order
# 3. Make sure that there are no conflicting dependencies in the monorepo
#
# This script is meant to be run in a CI environment.

# Get the root directory of the monorepo
ROOT_DIR=${ROOT_DIR:-$(pwd)}

# Get the test type from the first argument, default to "test"
TEST_COMMAND="${1:-test}"

# An array of all the packages in the monorepo
PACKAGES=$(ls -d "$ROOT_DIR/packages/"*/)

# Two arrays to hold the dependency graph
PACKAGE_NAMES=()
PACKAGE_DEPS=()

# A function to get the dependencies of a package
get_dependencies() {
    local package=$1
    local package_json="$ROOT_DIR/${package}package.json"
    if [ -f "$package_json" ]; then
        local dependencies=$(cat "$package_json" | jq -r '(.dependencies // {}) | keys | .[]' | tr '\n' ' ')
        local dev_dependencies=$(cat "$package_json" | jq -r '(.devDependencies // {}) | keys | .[]' | tr '\n' ' ')
        echo "$dependencies $dev_dependencies"
    fi
}

# Build the dependency graph
for package in ${PACKAGES[@]}; do
    package_name=$(basename "$package")
    dependencies=$(get_dependencies "$package")
    PACKAGE_NAMES+=("$package_name")
    PACKAGE_DEPS+=("$dependencies")
done

# A function toposort the dependency graph
toposort() {
    local -a visited
    local -a recursion_stack
    local -a sorted_packages

    for i in "${!PACKAGE_NAMES[@]}"; do
        visited[$i]=0
        recursion_stack[$i]=0
    done

    for i in "${!PACKAGE_NAMES[@]}"; do
        if [ "${visited[$i]}" -eq 0 ]; then
            toposort_util "$i"
        fi
    done

    echo "${sorted_packages[@]}"
}

toposort_util() {
    local package_index=$1
    visited[$package_index]=1
    recursion_stack[$package_index]=1

    local dependencies=${PACKAGE_DEPS[$package_index]}
    for dependency in $dependencies; do
        # We only care about dependencies that are in our monorepo
        local is_in_monorepo=0
        local dependency_index=-1
        for i in "${!PACKAGE_NAMES[@]}"; do
            if [ "${PACKAGE_NAMES[$i]}" = "$dependency" ]; then
                is_in_monorepo=1
                dependency_index=$i
                break
            fi
        done

        if [ "$is_in_monorepo" -eq 1 ]; then
            if [ "${recursion_stack[$dependency_index]}" -eq 1 ]; then
                echo "Error: cyclic dependency detected"
                exit 1
            fi
            if [ "${visited[$dependency_index]}" -eq 0 ]; then
                toposort_util "$dependency_index"
            fi
        fi
    done

    recursion_stack[$package_index]=0
    sorted_packages+=("${PACKAGE_NAMES[$package_index]}")
}

# Get the sorted packages
SORTED_PACKAGES=($(toposort))

# Run the tests for each package
for package in "${SORTED_PACKAGES[@]}"; do
    echo "Running tests for $package with command: npm run $TEST_COMMAND"
    cd "$ROOT_DIR/packages/$package"
    npm install
    npm run "$TEST_COMMAND"
    cd "$ROOT_DIR"
done

# Check for conflicting dependencies
echo "Checking for conflicting dependencies"
if [ -f "$ROOT_DIR/node_modules/.bin/syncpack" ]; then
    "$ROOT_DIR/node_modules/.bin/syncpack" list-mismatches
else
    npm install -g syncpack
    syncpack list-mismatches
fi