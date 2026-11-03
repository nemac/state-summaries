// Picks round tick values that cover a [min, max] range, for the chart's y-axis.
export const pretty = (range, n = 5, internalOnly = false) => {
  // from https://gist.github.com/Frencil/aab561687cdd2b0de04a
  let numberOfDivisons = n;
  numberOfDivisons = parseInt(n, 10);
  const minN = numberOfDivisons / 3;
  const shrinkSml = 0.75;
  const highUBias = 1.5;
  const u5Bias = 0.5 + 1.5 * highUBias;
  const d = Math.abs(range[0] - range[1]);
  let c = d / n;
  if (Math.log(d) / Math.LN10 < -2) {
    c = (Math.max(Math.abs(d)) * shrinkSml) / minN;
  }

  const base = 10 ** Math.floor(Math.log(c) / Math.LN10);
  let baseToFixed = 0;
  if (base < 1) {
    baseToFixed = Math.abs(Math.round(Math.log(base) / Math.LN10));
  }

  let unit = base;
  if (2 * base - c < highUBias * (c - unit)) {
    unit = 2 * base;
    if (5 * base - c < u5Bias * (c - unit)) {
      unit = 5 * base;
      if (10 * base - c < highUBias * (c - unit)) {
        unit = 10 * base;
      }
    }
  }

  let ticks = [];
  let i = 0;
  // Start at 0 when the lowest value is between 0 and one step. Otherwise start
  // at the step just below the lowest value, which is negative for cold winters.
  if (range[0] >= 0 && range[0] <= unit) {
    i = 0;
  } else {
    i = Math.floor(range[0] / unit) * unit;
    i = parseFloat(i.toFixed(baseToFixed));
  }
  while (i < range[1]) {
    ticks.push(i);
    i += unit;
    if (baseToFixed > 0) {
      i = parseFloat(i.toFixed(baseToFixed));
    }
  }
  ticks.push(i);

  if (internalOnly) {
    if (ticks[0] < range[0]) {
      ticks = ticks.slice(1);
    }
    if (ticks[ticks.length - 1] > range[1]) {
      ticks.pop();
    }
  }

  return ticks;
};
