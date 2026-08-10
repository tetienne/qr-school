# Deploying

Push the repository to GitHub, then `Settings` > `Pages` > _Source_:
**GitHub Actions**. `.github/workflows/deploy.yml` does the rest: every push to
`main` checks formatting, lint and types, runs the tests, builds and publishes.
Pull requests run the same checks without deploying. The site lands on
`https://<user>.github.io/<repository>/`.

The base path comes from the repository name (`VITE_BASE`); `npm run dev` serves
from the root instead. HTTPS is mandatory, since the folder access API does not
work over `file://`, and GitHub Pages provides it.

## Publishing a branch without merging

_Actions_ > _Verify and deploy_ > _Run workflow_ > pick the branch. There is only
one Pages site, so this replaces what is already online, including for the
teacher.

GitHub gates this separately: the branch must be allowed under `Settings` >
`Environments` > `github-pages` > _Deployment branches and tags_, or the job
fails with "Branch is not allowed to deploy to github-pages".
