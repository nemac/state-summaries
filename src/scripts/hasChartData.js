// True when at least one series has a real value to save. Error and
// "no data" views clear the chart to an empty list.
export function hasChartData(chartData) {
  if (!Array.isArray(chartData)) return false;
  return chartData.some(
    (series) =>
      Array.isArray(series?.y) &&
      series.y.some((value) => value !== null && value !== undefined),
  );
}
