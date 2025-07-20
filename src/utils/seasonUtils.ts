
export interface SeasonInfo {
  currentSeason: string;
  displaySeason: string;
  isCurrentSeason: boolean;
  isPreviousSeason: boolean;
}

export const getCurrentActiveSeason = (): SeasonInfo => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-11
  
  // Football season typically starts in August (month 7)
  // If we're before August, we're still in the previous season
  let activeSeason: string;
  let isCurrentSeason = true;
  
  if (currentMonth < 7) {
    // January-July: previous season is still active
    activeSeason = (currentYear - 1).toString();
    isCurrentSeason = false;
  } else {
    // August-December: current season
    activeSeason = currentYear.toString();
    isCurrentSeason = true;
  }
  
  const displaySeason = isCurrentSeason 
    ? `${activeSeason}-${(parseInt(activeSeason) + 1).toString().slice(-2)}`
    : `${activeSeason}-${(parseInt(activeSeason) + 1).toString().slice(-2)} (afgelopen seizoen)`;
  
  return {
    currentSeason: activeSeason,
    displaySeason,
    isCurrentSeason,
    isPreviousSeason: !isCurrentSeason
  };
};

export const getSeasonOptions = () => {
  const seasons = [
    { value: '2024', label: '2024-2025' },
    { value: '2023', label: '2023-2024' },
    { value: '2022', label: '2022-2023' },
    { value: '2021', label: '2021-2022' },
    { value: '2020', label: '2020-2021' },
    { value: '2019', label: '2019-2020' },
    { value: '2018', label: '2018-2019' },
    { value: '2017', label: '2017-2018' },
    { value: '2016', label: '2016-2017' },
  ];
  
  return seasons;
};
