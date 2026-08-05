import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeCentury,
  normalizeScenario,
  normalizeSeason,
  indexRegionToKey,
  stripSeasonFromDescription,
  titleCaseEmissions,
  isNewer,
} from "./precipManifestLib.mjs";

test("normalizeCentury", () => {
  assert.equal(normalizeCentury("Mid-Century"), "mid");
  assert.equal(normalizeCentury("Late-Century"), "late");
  assert.equal(normalizeCentury("nonsense"), null);
});

test("normalizeScenario maps each SSP code", () => {
  assert.equal(normalizeScenario("Low emissions (SSP1-2.6)"), "ssp126");
  assert.equal(normalizeScenario("Intermediate emissions (SSP2-4.5)"), "ssp245");
  assert.equal(normalizeScenario("High emissions (SSP3-7.0)"), "ssp370");
  assert.equal(normalizeScenario("Very high emissions (SSP5-8.5)"), "ssp585");
  assert.equal(normalizeScenario("unknown"), null);
});

test("normalizeSeason", () => {
  assert.equal(normalizeSeason("Annual"), "ann");
  assert.equal(normalizeSeason("Spring (MAM)"), "mam");
  assert.equal(normalizeSeason("Summer (JJA)"), "jja");
  assert.equal(normalizeSeason("Fall (SON)"), "son");
  assert.equal(normalizeSeason("Winter (DJF)"), "djf");
});

test("indexRegionToKey aliases CONUS and merges PR/USVI labels", () => {
  assert.equal(indexRegionToKey("Contiguous U.S. (CONUS)"), "CONUS");
  assert.equal(indexRegionToKey("Puerto Rico & U.S. Virgin Islands"), "PRUSVI");
  assert.equal(
    indexRegionToKey("Caribbean (Puerto Rico & U.S. Virgin Islands)"),
    "PRUSVI",
  );
  assert.equal(indexRegionToKey("Alaska"), "Alaska");
  assert.equal(indexRegionToKey("Texas"), "Texas");
});

test("stripSeasonFromDescription drops the trailing season clause", () => {
  const r = stripSeasonFromDescription(
    "Alaska, Late-Century, High emissions (SSP3-7.0), Annual",
    "Annual",
  );
  assert.equal(r.subtitle, "Alaska, Late-Century, High emissions (SSP3-7.0)");
  assert.equal(r.matched, true);
});

test("stripSeasonFromDescription handles parenthesized season", () => {
  const r = stripSeasonFromDescription(
    "Texas, Mid-Century, Low emissions (SSP1-2.6), Fall (SON)",
    "Fall (SON)",
  );
  assert.equal(r.subtitle, "Texas, Mid-Century, Low emissions (SSP1-2.6)");
  assert.equal(r.matched, true);
});

test("stripSeasonFromDescription leaves description alone when season mismatches", () => {
  const r = stripSeasonFromDescription("Some, description", "Annual");
  assert.equal(r.subtitle, "Some, description");
  assert.equal(r.matched, false);
});

test("titleCaseEmissions capitalizes the emissions clause", () => {
  assert.equal(
    titleCaseEmissions("Contiguous U.S. (CONUS), Late Century, Very high emissions (SSP5-8.5)"),
    "Contiguous U.S. (CONUS), Late Century, Very High Emissions (SSP5-8.5)",
  );
  assert.equal(
    titleCaseEmissions("Alaska, Midcentury, High emissions (SSP3-7.0)"),
    "Alaska, Midcentury, High Emissions (SSP3-7.0)",
  );
  assert.equal(
    titleCaseEmissions("Hawaii, Late Century, Intermediate emissions (SSP2-4.5)"),
    "Hawaii, Late Century, Intermediate Emissions (SSP2-4.5)",
  );
  assert.equal(
    titleCaseEmissions("Texas, Midcentury, Low emissions (SSP1-2.6)"),
    "Texas, Midcentury, Low Emissions (SSP1-2.6)",
  );
  // Already title-cased input is left unchanged.
  assert.equal(
    titleCaseEmissions("Texas, Midcentury, Low Emissions (SSP1-2.6)"),
    "Texas, Midcentury, Low Emissions (SSP1-2.6)",
  );
});

test("isNewer compares modified dates", () => {
  assert.equal(isNewer("2026-07-06", "2026-01-22"), true);
  assert.equal(isNewer("2026-01-22", "2026-07-06"), false);
  assert.equal(isNewer("2026-07-06", "not a date"), true);
});

test("indexRegionToKey handles the PNG-only alt region descriptions", () => {
  // PNG rows in INDEX describe the same regions; keys must match the jpg ones.
  assert.equal(indexRegionToKey("Maine"), "Maine");
  assert.equal(indexRegionToKey("West Virginia"), "West Virginia");
});
