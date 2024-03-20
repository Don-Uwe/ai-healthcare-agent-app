export const getDurationState = (openTime: number, endTime: number) => {
  if (Date.now() < openTime) return 'Upcoming'
  if (Date.now() > endTime) return 'Ended'
  return 'Ongoing'
}
