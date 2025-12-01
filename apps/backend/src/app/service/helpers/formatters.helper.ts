export const formatDays = (days: number) => {
  let daysFormatted = 'дня';
  switch (days % 10) {
    case 1:
      daysFormatted = 'день';
      break;

    case 2:
    case 3:
    case 4:
      daysFormatted = 'дня';
      break;

    case 5:
    case 6:
    case 7:
    case 8:
    case 9:
      daysFormatted = 'дней';
      break;
  }

  return daysFormatted;
};
