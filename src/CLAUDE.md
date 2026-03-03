# TODO Task List

## Figures / Copy Edits
- [x] Add colon between state and figure title in all figures (e.g. "Alabama: Observed...")
- [x] Add colon after "Long-term average" in all figures (e.g. "Average: 133.2 nights")

## Observed and Projected Temp Charts
- [x] Change legend order and labels to: Observations, Modeled Historical, Low Emissions (SSP1-2.6), Intermediate Emissions (SSP2-4.5), High Emissions (SSP3-7.0), Very High Emissions (SSP5-8.5)
- [x] Add bracket indicating range of models for SSP3-7.0 scenario to the right of the chart; brackets disappear when scenario is deselected

## Annual/Seasonal Average Temp Charts
- [x] Titles should read "[State Name]: Observed [Annual/Seasonal] Average Temperature" and "[State Name]: Observed [Annual/Seasonal] Average [Maximum/Minimum] Temperature"
- [x] Legend labels should read "5-year average" and "Annual"
- [x] Gray line label should read "Long-term average: XX.X°F"

## Annual/Seasonal Total Precip Charts
- [x] Titles should read "[State Name]: Observed Total [Annual/Seasonal] Precipitation"
- [x] Legend labels should read "Annual" and "5-year average" (delete "(inches annually)"), with "Annual" listed first
- [x] Gray line label should read "Long-term average: XX.X"

## Temp Threshold Charts (Tmin/Tmax)
- [x] Legend labels should read "Annual" and "5-year average" (delete "(days)"), with "Annual" listed first
- [x] Gray line label should read "Long-term average: XX days" or "Long-term average: XX nights"

## Precip Threshold Charts
- [x] Legend labels should read "Annual" and "5-year average" (delete "(days)"), with "Annual" listed first

## Dropdown 2: Climate Variable and Seasonality
- [ ] Delete "Charts" and "Maps" headers; reorganize categories
- [ ] Reorganize heading hierarchy:
  - Climate Observations and Projections (H1)
  - Observed and Projected Temperature Change
  - Observed Annual and Seasonal Temperature (H2) with season dropdown
  - Observed Annual and Seasonal Precipitation (H2) with season dropdown
  - Observed Annual Temperature and Precipitation Thresholds (H2)
    - Temperature (H3) - all Tmin and Tmax charts
    - Precipitation (H3) - all extreme precip charts
  - Projected Changes in Total Precipitation (H2)
    - Season dropdown [Annual; Winter; Spring; Summer; Fall]
    - Time period dropdown [Mid-21st Century; Late 21st Century]
    - Scenario dropdown [Intermediate Emissions; Very High Emissions]
- [x] Change "Autumn" to "Fall" everywhere (season dropdowns and tiles)
- [x] Change precipitation labels from "Annual [Seasonal] Total Precipitation" to "Total Annual [Seasonal] Precipitation"
- [ ] Projected precipitation maps: add dropdowns for Season, Time period, Scenario. Map titles should specify "Total Precipitation" (e.g. "Projected Change in Total Annual Precipitation")

## Error Message
- [x] Change bold text to "No data are currently available for this metric." and text below to "Please make another selection." (keep exclamation point symbol)

## Charts General
- [x] Remove gridlines from charts
- [x] Increase font size on chart axes
- [x] Decrease chart padding in mobile view

## Maps
- [ ] Add precipitation maps for all seasons/time periods/scenarios
- [ ] For mapsSeasonalityOptions, layout should be: Map Label (MUI component), Map image png, Map Legend (MUI component)
- [ ] Explore/refine zooming functionality in maps for Projected Change maps
