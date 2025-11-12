import SandoxPeriodsHumanReadable from "../configs/SandoxPeriodsHumanReadable";
import SandoxClimateVariableValueNamesHumanReadable from "../configs/SandoxClimateVariableValueNamesHumanReadable";
import SandoxLocationNamesHumanReadable from "../configs/SandoxLocationNamesHumanReadable";
import SandoxSeasonHumanReadable from "../configs/SandoxSeasonHumanReadable";

export default class SandboxHumanReadable {
  constructor(props) {
    this.climateVariableValue = props;
    this.peroids = SandoxPeriodsHumanReadable();
    this.climateVariableValueNames =
      SandoxClimateVariableValueNamesHumanReadable();
    this.LocationNames = SandoxLocationNamesHumanReadable();
    this.seasons = SandoxSeasonHumanReadable();
  }

  // creates chart title
  getChartTitle(props) {
    const { climatevariable, selection } = props;
    if (!props.climatevariable) return "";
    const climateVariableValueNames = this.climateVariableValueNames;
    const newValue = climateVariableValueNames.filter(
      (variables) =>
        variables.value === props.climatevariable &&
        variables.season === props.chartDataSeason,
    );
    let chartTitle = newValue[0].chartTitle;
    chartTitle = `${selection.label} ${chartTitle} `;
    return chartTitle;
  }
  // creates pulldown text for season in a format that makes more
  // sense for a human rather than djf or winer december janruary february
  getSeasonPullDownText(value) {
    if (!value) return "";
    const seasonValueNames = this.seasons;
    const newValue = seasonValueNames.filter(
      (variables) => variables.value === value,
    );
    return newValue[0].pullDownText;
  }

  // creates pulldown text for lcoation in a format that makes more
  // sense for a human rather than NC we show north carolina
  getLocationDownText(value) {
    if (!value) return "";
    const locationValueNames = this.LocationNames;
    const newValue = locationValueNames.filter(
      (variables) => variables.value.toUpperCase() === value.toUpperCase(),
    );
    let returnValue = value;
    if (newValue[0]) returnValue = newValue[0].pullDownText;
    return returnValue;
  }
}
