# TODO

## Replace placeholder technical details PDF
`public/technical-details.pdf` is a one-page "coming soon" placeholder linked from the About page
and the Save Chart/Data pop-up. Overwrite it in place when NOAA sends the real document.

## Fix the Alaska region's observed/projected chart
The Alaska region requests `alaskaregion_FIG1_SCS2025.csv`, which doesn't exist, so its chart is
blank. Point it at `Alaska_FIG1_SCS2025.csv`, then remove `alaska_region` from `KNOWN_MISSING_FIG1`
in `scripts/sandboxData.test.mjs`.
