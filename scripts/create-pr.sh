#!/usr/bin/env bash
set -euo pipefail

# Edit this line for each update. It also becomes the title of a new PR.
COMMIT_MESSAGE=""

REPOSITORY="kyouritsu-sysadmin/kyouritsu-sysadmin.github.io"
REMOTE="company-site"
BASE_BRANCH="main"

fail() { printf 'Error: %s\n' "$*" >&2; exit 1; }

[[ "$COMMIT_MESSAGE" =~ [^[:space:]] ]] ||
  fail 'Set COMMIT_MESSAGE at the top of scripts/create-pr.sh before running it.'

for command in git gh; do
  command -v "$command" >/dev/null || fail "Install $command before running this script."
done

SCRIPT_DIRECTORY="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd -- "$SCRIPT_DIRECTORY/.."
git rev-parse --show-toplevel >/dev/null
BRANCH="$(git symbolic-ref --quiet --short HEAD)" || fail 'Check out your feature branch first.'
[[ "$BRANCH" != "$BASE_BRANCH" && "$BRANCH" != "master" ]] ||
  fail 'Run this from a feature branch, not main or master.'
[[ -z "$(git ls-files --unmerged)" ]] ||
  fail 'Resolve the existing merge conflicts before running this script.'

REMOTE_URL="$(git remote get-url --push "$REMOTE")" || fail "Missing remote: $REMOTE"
case "$REMOTE_URL" in
  "https://github.com/$REPOSITORY"|"https://github.com/$REPOSITORY.git"|"git@github.com:$REPOSITORY.git"|"ssh://git@github.com/$REPOSITORY.git") ;;
  *) fail "$REMOTE must point to $REPOSITORY; found $REMOTE_URL" ;;
esac
gh auth status --hostname github.com >/dev/null 2>&1 ||
  fail 'Sign in first with: gh auth login --hostname github.com'

# Include all non-ignored changes in this repository, including new files.
printf '\nChanges to include:\n'
git status --short
git add --all
if git diff --cached --quiet; then
  printf 'No new changes to commit; pushing existing commits.\n'
else
  git commit -m "$COMMIT_MESSAGE"
fi

git push --set-upstream "$REMOTE" "$BRANCH"

PR_URL="$(gh pr list --repo "$REPOSITORY" --base "$BASE_BRANCH" \
  --head "$BRANCH" --state open --json url --jq '.[0].url // empty')"
if [[ -n "$PR_URL" ]]; then
  printf '\nExisting pull request updated: %s\n' "$PR_URL"
else
  PR_BODY_FILE="$(mktemp)"
  trap 'rm -f -- "$PR_BODY_FILE"' EXIT
  printf '%s\n\n%s\n' "$COMMIT_MESSAGE" \
    'Please review the changes before merging into main.' > "$PR_BODY_FILE"
  gh pr create --repo "$REPOSITORY" --base "$BASE_BRANCH" \
    --head "$BRANCH" --title "$COMMIT_MESSAGE" --body-file "$PR_BODY_FILE"
fi

printf '\nReady for review. This script does not merge the pull request.\n'
