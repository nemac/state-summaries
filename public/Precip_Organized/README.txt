PRECIPITATION MAP COLLECTION — ORGANIZED BY CENTURY AND SEASON
==============================================================

WHAT THIS IS
------------
The original archive contained 747 files spread across many region folders
(CONUS, High Plains, Midwest, Northeast, Southern, Alaska, Hawaii, Caribbean),
with several folders holding regenerated versions of the same maps from
different dates. This collection re-sorts everything by CENTURY and SEASON and
keeps only the most recent version of each map.

FOLDER STRUCTURE
----------------
  Mid-Century/            (files named MC_...)
  Late-Century/           (files named LC_...)
      Annual/
      Winter (DJF)/
      Spring (MAM)/
      Summer (JJA)/
      Fall (SON)/
  _Reference/             shared PrecipLegend.ai (applies to every map)

Each season folder contains a "Contents.csv" companion file listing every file
in that folder with a plain-language description. A master "INDEX.csv" at the
top level lists all 693 kept files at once.

HOW FILE NAMES DECODE
---------------------
  Century:  MC = Mid-Century        LC = Late-Century
  Season:   Annual, DJF = Winter, MAM = Spring, JJA = Summer, SON = Fall
  Emissions scenario:
            SSP126 = Low emissions (SSP1-2.6)
            SSP245 = Intermediate emissions (SSP2-4.5)
            SSP370 = High emissions (SSP3-7.0)
            SSP585 = Very high emissions (SSP5-8.5)
  State/region: 2-letter abbreviation (AK = Alaska, HI = Hawaii, KS = Kansas,
            etc.), full state name (e.g. "New Jersey", "Texas"), CONUS
            (Contiguous U.S.), or PRUSVI / Caribbean (Puerto Rico & U.S.
            Virgin Islands).
  Format:   .jpg / .png = preview image,  .aix = ArcGIS AIX data file,
            .ai = Adobe Illustrator source.

Example: LC_SSP126_AK_Annual_Precip_070526.jpg
         = "Alaska, Late-Century, Low emissions (SSP1-2.6) — Annual,
            Precipitation (JPEG preview image)"

"MOST RECENT" RULE USED FOR DE-DUPLICATION
------------------------------------------
Files were treated as the same map when they matched on all five of:
century, season, state/region, emissions scenario, AND file format. Within
each such group only the newest file (by file modification date) was kept.

Format is part of the key on purpose: a .jpg preview, an .aix data file, and
an .ai source are different deliverables, so the newest of EACH format is kept
rather than discarding a format that simply wasn't regenerated. (Example: for
Alaska SSP245 Annual, the Jan-2026 .jpg and .aix were kept and the older
Dec-2025 / Nov-2025 copies dropped, but the only .ai source — from Nov-2025 —
was kept because no newer .ai exists.)

53 superseded files were removed. Every one of them is logged in
"_Superseded_files_removed.csv" with the newer file that replaced it, so
nothing is lost silently.

TWO THINGS WORTH A HUMAN CHECK
------------------------------
1. Eight CONUS / SSP126 files had irregular names containing two season-style
   tokens, e.g. "MC_SSP126_MAM_Annual_Precip_062926.jpg" and
   "LC_SSP126_CONUS_JJA_Annual_Precip_062926.aix". These were read as CONUS
   maps for the leading real season (MAM, JJA, SON, DJF), treating the trailing
   "Annual" as a naming error. They are marked in the "Note" column of the
   INDEX and their Contents.csv rows. If that reading is wrong, they are easy
   to relocate.

2. The Caribbean / Puerto Rico & U.S. Virgin Islands maps appear under two
   different labels across generations: older files use "PRUSVI" and the newest
   (July 2026) files use "Caribbean". Because the labels differ, they were kept
   as separate map series rather than merged, so you may see both a PRUSVI and a
   Caribbean version of the same season/scenario. If they are meant to be the
   same series, the "Caribbean" (July 2026) files are the newest and the PRUSVI
   ones can be dropped.
