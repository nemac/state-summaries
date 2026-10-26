# TODO

## Replace interim annual regions precipitation file
`public/sandboxdata/2025_Sandbox_Datafiles/regions_prcp_ann_1895-2024_SCS2025.txt` is an interim
restore of the pre-migration (older-revision) annual values. The 2026-10-26 Google Drive delivery
(like the earlier one) shipped this file as a tar archive misnamed as a CSV, missing its first tar
header: the first member is the regions DJF data, and no `regions_prcp_ann` member is inside. The
`.xlsx` next to it is that same blob opened in Excel. The provider still owes a real file.

Steps when the file arrives: remove the old `.txt`, drop in the `.csv`, run
`../../../bin/python make_index.py` from that directory, run `npm test`. The seasonal-consistency
tests check annual against the seasons.

## Replace placeholder technical details PDF
`public/technical-details.pdf` is a one-page "coming soon" placeholder linked from the About page
and the Save Chart/Data pop-up. Overwrite it in place when NOAA sends the real document.
