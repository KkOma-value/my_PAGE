export function buildCalendarCells(year: number, monthIndex: number) {
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: Array<{ day: number; date: string } | null> = Array.from(
    { length: firstWeekday },
    () => null,
  );
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      day,
      date: `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    });
  }
  while (cells.length < 42) cells.push(null);
  return cells;
}
