# TODO

## Swap in regenerated threshold bar chart data files
Laura Stevens (NOAA, 2026-10-21) reported a bug in their code that required regenerating the data
files for **all** threshold bar charts. Updated files are expected 2026-10-22/23 and need to be
swapped in quickly: NOAA switches the main State Climate Summaries to the new version the week of
2026-10-26 and wants the Data Explorer data correct by then.

Threshold files live in `public/sandboxdata/2025_Sandbox_Datafiles/` and are the ones with an inch
or °F threshold in the name, e.g. `CONUS_prcp_1inch_1900-2024_SCS2025.txt`,
`states_tmax_90F_1900-2024_SCS2025.txt`, `regions_tmin_32F_1900-2024_SCS2025.txt` (166 files).

Steps when the files arrive:
1. Remove the old matching `.txt` files, then drop the delivered `.csv` files into that directory.
2. From that directory run `../../../bin/python make_index.py`. It renames the CSVs to `.txt`,
   normalizes headers, and rebuilds `index.json`.
3. Run `npm test` to verify.

## Replace interim annual regions precipitation file
`public/sandboxdata/2025_Sandbox_Datafiles/regions_prcp_ann_1895-2024_SCS2025.txt` is an interim
restore of the pre-migration (older-revision) annual values. The 2026-03 delivery's
`regions_prcp_ann` was a truncated tar archive misnamed as a CSV, and the later copy in
`DATA_TO_COMPARE_TO/` had the same problem. The provider still owes a real file.

Steps when the file arrives: same as above (remove the old `.txt`, drop in the `.csv`, run
`make_index.py`, run `npm test`). The seasonal-consistency tests check annual against the seasons.

## Replace placeholder technical details PDF
`public/technical-details.pdf` is a one-page "coming soon" placeholder linked from the About page
and the Save Chart/Data pop-up. Overwrite it in place when NOAA sends the real document.
