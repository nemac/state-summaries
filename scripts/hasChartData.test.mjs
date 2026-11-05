import { test } from "node:test";
import assert from "node:assert/strict";
import { hasChartData } from "../src/scripts/hasChartData.js";

test("an empty or missing chart has nothing to save", () => {
  assert.equal(hasChartData([]), false);
  assert.equal(hasChartData(undefined), false);
  assert.equal(hasChartData([{ x: [2000, 2001], y: [null, null] }]), false);
});

test("a chart with at least one value can be saved", () => {
  assert.equal(hasChartData([{ x: [2000, 2001], y: [null, 3.2] }]), true);
  assert.equal(hasChartData([{ x: [2000], y: [0] }]), true);
});
