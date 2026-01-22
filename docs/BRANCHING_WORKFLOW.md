# Branching workflow

## Long-lived branches

- `main`: development branch
- `production`: deployment branch

## Short-lived branches

Create a new branch off `main` for every change:

- `fix/<short-description>`
- `feat/<short-description>`
- `chore/<short-description>`

## Workflow

### Start work

- Ensure you are on `main`
- Pull latest
- Create a new branch for the work

Recommended commands:

- `git switch main`
- `git pull origin main`
- `git switch -c fix/<short-description>`

### Implement change

- Make small commits with clear messages
- Keep changes scoped to the branch goal

Recommended commands:

- `git status`
- `git add <files>`
- `git commit -m "<type>: <message>"`
- `git push -u origin <your-branch-name>`

### Open a PR into `main`

1. Go to GitHub in your browser and open the repository.
2. Click the **Pull requests** tab.
3. Click **New pull request**.
4. Set the PR branch selection:
   - **base**: `main`
   - **compare**: your branch (for example `fix/my-birds-empty-state`)
5. Click **Create pull request**.
6. Confirm CI runs and is green:
   - Scroll down to the **Checks** section.
   - Wait for `backend_sanity` and `frontend_build` to complete successfully.
7. Merge the PR:
   - Click **Merge pull request** (or **Squash and merge** if you prefer a single commit).
   - Click **Confirm merge**.
8. Delete the branch on GitHub after merging (recommended):
   - On the merged PR page (still in the browser), look for the **Delete branch** button.
   - Click **Delete branch**.
   - If you do not see a Delete branch button, you can delete it from:
     - Repo home page
     - **Branches** (near the repo file list)
     - Find the branch
     - Click the trash can icon.
9. Delete the local branch (recommended):
   - Switch away from the branch:
     - `git switch main`
   - Delete the local branch:
     - `git branch -d <your-branch-name>`
   - If Git refuses because it thinks the branch is not merged, use:
     - `git branch -D <your-branch-name>`
10. Delete the remote branch (only needed if GitHub did not delete it):

- `git push origin --delete <your-branch-name>`

### Promote to production

Promotion is done via a PR from `main` to `production`.

1. Go to GitHub in your browser and open the repository.
2. Click the **Pull requests** tab.
3. Click **New pull request**.
4. Set the PR branch selection:
   - **base**: `production`
   - **compare**: `main`
5. Click **Create pull request**.
6. Confirm the production guardrails are satisfied:
   - CI must pass (`backend_sanity`, `frontend_build`).
   - A PR is required for merges into `production`.
7. Merge the PR into `production`.

Notes:

- This repo currently uses a ruleset that requires CI checks on `production`.
- Required approvals may be set to `0` for solo development, because GitHub does not allow self-approval to satisfy required reviews.
- When adding required CI checks in a GitHub ruleset, the check list may appear empty until you type a filter term into the search box (for example `backend` or `frontend`).

### Deploy from `production`

Deployment is run from the `production` branch.

1. Go to GitHub in your browser and open the repository.
2. Click the **Actions** tab.
3. In the left sidebar, click the **Deploy** workflow (from `.github/workflows/deploy.yml`).
4. Click **Run workflow**.
5. Select the **Branch**: `production`.
6. Click **Run workflow**.
7. Click the new workflow run and confirm each step succeeds.

## Guardrails

- Avoid committing directly to `production`.
- Keep `production` deployable at all times.

## Using the GitHub Actions extension (Windsurf / VS Code)

The GitHub Actions extension is useful for watching CI, quickly opening logs, and re-running jobs.

### Install and sign in

1. Open the **Extensions** view.
2. Search for **GitHub Actions** (publisher: GitHub).
3. Install it.
4. If prompted, sign in to GitHub:
   - Open the Command Palette.
   - Run **GitHub: Sign in**.
   - Complete the browser authentication flow.

### View workflow runs

1. Open the **GitHub Actions** view in the left sidebar.
2. Expand the workflow you want (for example `CI`).
3. Select a workflow run to see:
   - the run status
   - job list (for example `backend_sanity`, `frontend_build`)
4. Click a job to open logs.

### Re-run workflows

Depending on your permissions and the workflow, you may be able to re-run a workflow or a job from the extension.

If the extension does not offer a re-run button for a specific workflow, use the GitHub web UI:

1. Go to **Actions**.
2. Click the workflow run.
3. Use **Re-run jobs**.
