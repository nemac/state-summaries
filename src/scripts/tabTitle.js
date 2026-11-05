// Browser tabs show only the first 20-30 characters of a title, so the tab
// title leads with short words that tell views apart: the place, then what
// is shown. The page headings keep the full wording.

const CENTURY_TAB_LABELS = { mid: "Mid", late: "Late" };

function locationTabLabel(selection) {
  return selection.tabLabel || selection.label;
}

function mapTabName(selection, option, season) {
  const period = `${CENTURY_TAB_LABELS[option.century]}, ${option.tabLabel}`;
  return `${locationTabLabel(selection)} · ${season.label} Precip Change · ${period}`;
}

function chartTabName(selection, option, season) {
  const optionName = option.getTabLabel ? option.getTabLabel(season.label) : option.tabLabel;
  return `${locationTabLabel(selection)} · ${optionName}`;
}

// Short name of the view in the URL, such as "Alaska · Winter Avg Temp".
export function tabNameForView({ selection, option, season, showMap }) {
  if (showMap) return mapTabName(selection, option, season);
  return chartTabName(selection, option, season);
}
