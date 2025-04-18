import originalWeeks from "@/data/weeks.json";
import { ExpenseType } from "@/types";

export function getAggregatedStats() {
  const weeks = [...originalWeeks];
  const reversedWeeks = [...originalWeeks].reverse();

  const totalProjectWeeks = weeks.filter(w => w.weekStatus !== "not_started" && w.weekStatus !== "pending").length;
  const activeWeeks = totalProjectWeeks;

  const firstBlogIndex = weeks.findIndex(w => w.content.blogPublished);
  const blogWeeks = firstBlogIndex === -1 ? 0 : weeks.slice(firstBlogIndex).filter(w => w.weekStatus !== "not_started" && w.weekStatus !== "pending").length;

  const firstVideoIndex = weeks.findIndex(w => w.content.videoPublished);
  const videoWeeks = firstVideoIndex === -1 ? 0 : weeks.slice(firstVideoIndex).filter(w => w.weekStatus !== "not_started" && w.weekStatus !== "pending").length;

  const stats = {
    totalMinutesWorked: 0,
    totalDaysWorked: 0,
    totalVideoTakes: 0,
    totalVideoKilometersTraveled: 0,
    totalExpenses: {
      all: 0,
      byType: {
        travel: 0,
        equipment: 0,
        subscription: 0,
        website: 0,
        other: 0,
      } as Record<ExpenseType, number>,
    },
    totalContent: {
      blogCount: 0,
      videoCount: 0,
      perfectWeeks: 0,
    },
    streaks: {
      current: 0,
      longest: 0,
    },
    totalHoursWorked: 0,
    totalProjectWeeks,
    blogWeeks,
    videoWeeks,
    averages: {
      hoursWorked: 0,
      daysWorked: 0,
      videoTakes: 0,
      videoKilometersTraveled: 0,
      expenses: 0,
      blogs: 0,
      videos: 0,
    }
  };

  for (const week of weeks) {
    if (week.weekStatus === "not_started" || week.weekStatus === "pending") continue;

    stats.totalMinutesWorked += week.time.minutesWorked;
    stats.totalDaysWorked += week.time.daysWorked;
    stats.totalVideoTakes += week.content.videoTakes;
    stats.totalVideoKilometersTraveled += week.content.videoKilometersTraveled;

    if (week.content.blogPublished) stats.totalContent.blogCount++;
    if (week.content.videoPublished) stats.totalContent.videoCount++;

    if (week.weekStatus === "perfect") {
      stats.totalContent.perfectWeeks++;
    }

    for (const exp of week.expenses || []) {
      const amount = exp.amountEUR || 0;
      const type = exp.type as ExpenseType;
      stats.totalExpenses.all += amount;
      stats.totalExpenses.byType[type] = (stats.totalExpenses.byType[type] || 0) + amount;
    }
  }

  let currentStreak = 0;
  let longestStreak = 0;
  for (const week of reversedWeeks) {
    if (week.weekStatus === "not_started") continue;
    if (week.weekStatus === "pending") continue;

    if (week.weekStatus === "perfect") {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      break;
    }
  }

  stats.streaks.current = currentStreak;
  stats.streaks.longest = longestStreak;
  stats.totalHoursWorked = Math.round(stats.totalMinutesWorked / 60);

  const average = (total: number, weeks: number) =>
    weeks > 0 ? Math.round(total / weeks) : 0;

  stats.averages.hoursWorked = average(stats.totalHoursWorked, activeWeeks);
  stats.averages.daysWorked = average(stats.totalDaysWorked, activeWeeks);
  stats.averages.videoTakes = average(stats.totalVideoTakes, videoWeeks);
  stats.averages.videoKilometersTraveled = average(stats.totalVideoKilometersTraveled, videoWeeks);
  stats.averages.expenses = average(stats.totalExpenses.all, activeWeeks);
  stats.averages.blogs = average(stats.totalContent.blogCount, blogWeeks);
  stats.averages.videos = average(stats.totalContent.videoCount, videoWeeks);

  return stats;
}
