// slider to select which year to display in the map

type Props = {
  years: number[];
  year: number;
  onYearChange: (year: number) => void;
};

export function YearSlider({ years, year, onYearChange }: Props) {
  return (
    <div id="year-selector">
      <span id="year-min" className="year-bound">
        {years[0]}
      </span>
      <input
        id="year-slider"
        type="range"
        min={0}
        max={years.length - 1}
        step={1}
        value={years.indexOf(year)}
        onChange={e => onYearChange(years[Number(e.target.value)])}
        aria-label="Year"
      />
      <span id="year-max" className="year-bound">
        {years[years.length - 1]}
      </span>
      <span id="year-display">{year}</span>
    </div>
  );
}
