#!/bin/bash
#
# This script runs tests for a given package and all its local dependents.
#
# Usage: ./run-tests.sh <path-to-package>
#
# Example: ./run-tests.sh packages/gaxios

set -eo pipefail

# --- Helper Functions ---

# Check if an element exists in an array
# @param $1 - element
# @param $2 - array
function contains() {
  local e match="$1"
  shift
  for e; do [[ "$e" == "$match" ]] && return 0; done
  return 1
}

# --- Main Script ---

# 1. Get the initial package directory from the command line.
if [ -z "$1" ]; then
  echo "Usage: $0 <path-to-package>"
  echo "Example: $0 packages/gaxios"
  exit 1
fi
initial_package_dir="$1"

if [ ! -f "$initial_package_dir/package.json" ]; then
  echo "Error: package.json not found in '$initial_package_dir'"
  exit 1
fi

initial_package=$(jq -r '.name' "$initial_package_dir/package.json")
if [ -z "$initial_package" ] || [ "$initial_package" == "null" ]; then
  echo "Error: Could not determine package name from '$initial_package_dir/package.json'"
  exit 1
fi

echo "ℹ️ Initial package: '$initial_package' (from '$initial_package_dir')"

# 2. Find all package.json files in the monorepo.
echo "🔍 Finding all packages..."
package_files=$(find packages dev-packages -name "package.json" -not -path "*/node_modules/*")

# 3. Build the dependency graph.
# --- Map Simulation Functions (for older Bash versions) ---
# These functions simulate associative arrays using indexed arrays.

_package_paths_keys=()
_package_paths_values=()

function set_package_path() {
  local key="$1"
  local value="$2"
  local i
  for i in "${!_package_paths_keys[@]}"; do
    if [[ "${_package_paths_keys[$i]}" == "$key" ]]; then
      _package_paths_values[$i]="$value"
      return
    fi
  done
  _package_paths_keys+=("$key")
  _package_paths_values+=("$value")
}

function get_package_path() {
  local key="$1"
  local i
  for i in "${!_package_paths_keys[@]}"; do
    if [[ "${_package_paths_keys[$i]}" == "$key" ]]; then
      echo "${_package_paths_values[$i]}"
      return
    fi
  done
}

_dependents_keys=()
_dependents_values=()

function add_dependent() {
  local key="$1"
  local value="$2"
  local i
  for i in "${!_dependents_keys[@]}"; do
    if [[ "${_dependents_keys[$i]}" == "$key" ]]; then
      _dependents_values[$i]+="$value "
      return
    fi
  done
  _dependents_keys+=("$key")
  _dependents_values+=("$value ")
}

function get_dependents() {
  local key="$1"
  local i
  for i in "${!_dependents_keys[@]}"; do
    if [[ "${_dependents_keys[$i]}" == "$key" ]]; then
      echo "${_dependents_values[$i]}"
      return
    fi
  done
}


echo "🕸️ Building dependency graph..."
for file in $package_files; do
  # Don't fail if jq is not installed
  if ! command -v jq &> /dev/null; then
    echo "Error: jq is not installed. Please install it to continue."
    exit 1
  fi
  package_name=$(jq -r '.name' "$file")
  package_dir=$(dirname "$file")
  set_package_path "$package_name" "$package_dir"

  # Consider both dependencies and devDependencies
  dependencies=$(jq -r '(.dependencies // {}) | keys[]?' "$file")
  devDependencies=$(jq -r '(.devDependencies // {}) | keys[]?' "$file")

  for dep in $dependencies $devDependencies; do
    # Add the current package to the list of dependents for the dependency.
    add_dependent "$dep" "$package_name"
  done
done

# 4. Find all packages to test (initial package + dependents).
echo "Finding dependents for '$initial_package'..."
packages_to_test=()
queue=("$initial_package")
visited=()

while [ ${#queue[@]} -gt 0 ]; do
  current_package=${queue[0]}
  queue=("${queue[@]:1}")

  if contains "$current_package" "${visited[@]}"; then
    continue
  fi
  visited+=("$current_package")

  if [ -n "$(get_package_path "$current_package")" ]; then
    packages_to_test+=("$current_package")
  fi

  # Add dependents to the queue
  for dependent in $(get_dependents "$current_package"); do
    if ! contains "$dependent" "${visited[@]}"; then
      queue+=("$dependent")
    fi
  done
done

# 5. Run tests for the identified packages.
echo "✅ Found ${#packages_to_test[@]} packages to test: ${packages_to_test[*]}"
echo ""

for package in "${packages_to_test[@]}"; do
  package_dir=$(get_package_path "$package")
  echo "--- Running tests for $package in $package_dir ---"
  
  if [ ! -f "$package_dir/package.json" ]; then
    echo "Skipping $package: package.json not found in $package_dir"
    continue
  fi

  # Check if a "test" script exists in package.json
  test_script=$(jq -r '.scripts.test' "$package_dir/package.json")
  if [ -z "$test_script" ] || [ "$test_script" == "null" ] || [[ "$test_script" == *"echo"* ]]; then
    echo "Skipping $package: No meaningful 'test' script found."
    continue
  fi

  (
    cd "$package_dir"
    # Install dependencies before running tests.
    # This ensures that local packages are linked correctly.
    echo "Installing dependencies for $package..."
    npm install

    echo "Running tests for $package..."
    npm test
  )
  
  if [ $? -ne 0 ]; then
    echo "🚨 Tests failed for $package. Aborting."
    exit 1
  fi
  echo ""
done

echo "🎉 All tests passed successfully for all dependent packages."
