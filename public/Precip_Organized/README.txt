PRECIPITATION MAP COLLECTION — ORGANIZED BY CENTURY AND SEASON
==============================================================

WHAT THIS IS
------------
This collection holds precipitation maps organized by CENTURY and SEASON,
covering four regions (Alaska, Contiguous U.S., Hawaii, and Puerto Rico &
U.S. Virgin Islands) across four emissions scenarios. It currently contains
487 files. A master "INDEX.csv" at the top level lists every one of them.

FOLDER STRUCTURE
----------------
  Mid-Century/            (files named MC_...)      247 files
      Annual/
      Winter (DJF)/
      Spring (MAM)/
      Summer (JJA)/
      Fall (SON)/
      aix_to_ai_conversion_log.txt   (batch log from generating .ai sources)
  Late-Century/           (files named LC_...)      240 files
      Annual/
      Winter (DJF)/
      Spring (MAM)/
      Summer (JJA)/
      Fall (SON)/
      aix_to_ai_conversion_log.txt   (batch log from generating .ai sources)
  _Reference/             shared PrecipLegend.ai (applies to every map)

By format: 167 Adobe Illustrator sources (.ai), 160 ArcGIS AIX data files
(.aix), 160 JPEG previews (.jpg).

By region: Contiguous U.S. 125, Hawaii 121, Puerto Rico & U.S. Virgin
Islands 121, Alaska 120.

By emissions scenario: Intermediate (SSP2-4.5) 127, Low (SSP1-2.6) 120,
High (SSP3-7.0) 120, Very high (SSP5-8.5) 120.

NOTE: Some season folders also contain a "Contents.csv" companion file
listing that folder's files with plain-language descriptions; others do
not. Coverage is inconsistent across folders, so INDEX.csv at the top
level is the only file that reliably lists every file in the collection —
check there first.

HOW FILE NAMES DECODE
----------------------
  Century:  MC = Mid-Century        LC = Late-Century
  Season:   Annual, DJF = Winter, MAM = Spring, JJA = Summer, SON = Fall
  Emissions scenario:
            SSP126 = Low emissions (SSP1-2.6)
            SSP245 = Intermediate emissions (SSP2-4.5)
            SSP370 = High emissions (SSP3-7.0)
            SSP585 = Very high emissions (SSP5-8.5)
  State/region: AK = Alaska, HI = Hawaii, CONUS = Contiguous U.S.,
            PRUSVI = Puerto Rico & U.S. Virgin Islands.
  Format:   .jpg = preview image, .aix = ArcGIS AIX data file,
            .ai = Adobe Illustrator source.

Example: LC_SSP126_AK_Annual_Precip_070526.jpg
         = "Alaska, Late-Century, Low emissions (SSP1-2.6) — Annual,
            Precipitation (JPEG preview image)"

Every region/scenario/season combination has a matching .ai, .aix, and
.jpg (160 combinations x 3 files = 480), plus 7 extra leftover .ai
duplicates flagged below (480 + 7 = 487 total).

THINGS WORTH A HUMAN CHECK
---------------------------
1. Five files have irregular names with two season-style tokens instead
   of a region + season, e.g. "MC_SSP126_DJF_Annual_Precip_062926.jpg"
   and "LC_SSP126_CONUS_JJA_Annual_Precip_062926.aix". These are read as
   CONUS maps for the real season named (DJF/JJA), treating the trailing
   "Annual" as a naming error. They're marked in the "Note" column of
   INDEX.csv. If that reading is wrong, they're easy to relocate.

2. Seven .ai files appear to be leftover duplicates: an older-dated .ai
   sits alongside a complete, newer-dated .ai/.aix/.jpg set for the same
   region/scenario/season. All seven are Intermediate-emissions
   (SSP2-4.5) Mid-Century files:
     - MC_SSP245_CONUS_Annual_Precip_052725.ai   (newer: ..._121525.ai)
     - MC_SSP245_CONUS_SON_Precip_052725.ai      (newer: ..._121525.ai)
     - MC_SSP245_CONUS_MAM_Precip_052725.ai      (newer: ..._121525.ai)
     - MC_SSP245_CONUS_JJA_Precip_052725.ai      (newer: ..._121525.ai)
     - MC_SSP245_CONUS_DJF_Precip_052725.ai      (newer: ..._121525.ai)
     - MC_SSP245_HI_Annual_Precip_121925.ai      (newer: ..._070626.ai)
     - MC_SSP245_PRUSVI_Annual_Precip_121925.ai  (newer: ..._031326.ai)
   Each is flagged in the "Note" column of INDEX.csv. If these are
   genuinely superseded, they can likely be deleted.

3. Older versions of this collection labeled the Puerto Rico & U.S.
   Virgin Islands maps "Caribbean" for the newest files and "PRUSVI" for
   older ones. Only "PRUSVI"-labeled files remain in the collection now,
   so this is no longer an issue — noted here in case "Caribbean"-labeled
   files reappear in a future update, in which case they should be
   treated as the same map series as PRUSVI.

PROVENANCE
----------
Each century folder contains an "aix_to_ai_conversion_log.txt" recording
a batch job (run July 15, 2026) that generated the .ai files from the
existing .aix files in that folder. That's why most .ai/.aix pairs share
an identical filename (aside from extension) and modification date close
to one another.
