// top bar - to add menu later

import logo from '../../assets/Imago-logo.png';
import { YearSlider } from './YearSlider.tsx';

type Props = {
  years: number[];
  year: number;
  onYearChange: (year: number) => void;
};

export function TopBar({ years, year, onYearChange }: Props) {
  return (
    <header id="topbar">
      <div id="brand">
        <img src={logo} alt="Imago UKRI" />
        <h1>SPF Explorer</h1>
      </div>
      <YearSlider years={years} year={year} onYearChange={onYearChange} />
    </header>
  );
}