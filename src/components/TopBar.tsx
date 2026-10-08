// top bar - to add menu later

import logo from '../../assets/Imago-logo.png';
import { YearSlider } from './YearSlider.tsx';

type Props = {
  years: number[];
  year: number;
  onYearChange: (year: number) => void;
  sidebarOpen: boolean;
  onMenuClick: () => void;
};

export function TopBar({ years, year, onYearChange, sidebarOpen, onMenuClick }: Props) {
  return (
    <header id="topbar">
      <div id="brand">
        <button
          id="menu-btn"
          aria-label="Controls"
          aria-expanded={sidebarOpen}
          aria-controls="sidebar"
          onClick={onMenuClick}
        >
          ☰
        </button>
        <img src={logo} alt="Imago UKRI" />
        <h1>SPF Explorer</h1>
      </div>
      <YearSlider years={years} year={year} onYearChange={onYearChange} />
    </header>
  );
}
