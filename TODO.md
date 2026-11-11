# TODO

## Replace placeholder technical details PDF
`public/technical-details.pdf` is a one-page "coming soon" placeholder linked from the About page
and the Save Chart/Data pop-up. Overwrite it in place when NOAA sends the real document.

## Decide whether to release the start-year change to master
Develop has commit 3b6b3a2, which master does not. It starts every chart at NOAA's sheet year
and never plots an earlier set of stations. Region threshold charts start in 1950 or 1930.
It changes about 301 charts compared with master. To release it, open a small PR to master
with just that commit. Don't revive the old develop → master PR (#51); it was closed.

Develop also differs from master in ways that don't need to ship:
- `.github/workflows/deploy-dev.yml` and its README notes, for the dev site only.
- A few `.gitignore` lines and a 4-line difference in `SaveAsCSVButton.jsx`, left over from
  resolving merge conflicts. They are harmless.
