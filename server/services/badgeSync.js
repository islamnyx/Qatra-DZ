/** Milestone badges synced to donors.badges table. */

export const MILESTONE_BADGES = [
  { minDonations: 1, key: "first_donor", name: "🥇 First Donor", nameAr: "🥇 أول متبرع", icon: "award", color: "amber" },
  { minDonations: 3, key: "triple_hero", name: "🎯 Triple Hero", nameAr: "🎯 بطل ثلاثي", icon: "star", color: "blue" },
  { minDonations: 5, key: "life_saver", name: "⭐ Life Saver", nameAr: "⭐ منقذ حياة", icon: "heart", color: "red" },
  { minDonations: 10, key: "platinum", name: "🏆 Platinum Donor", nameAr: "🏆 متبرع بلاتيني", icon: "shield", color: "green" },
  { minDonations: 20, key: "diamond", name: "💎 Diamond Hero", nameAr: "💎 بطل الماس", icon: "award", color: "red" },
];

export function badgesForDonationCount(count) {
  return MILESTONE_BADGES.filter((b) => count >= b.minDonations);
}

export function nextMilestone(count) {
  const next = MILESTONE_BADGES.find((b) => count < b.minDonations);
  if (!next) return null;
  return {
    name: next.name,
    nameAr: next.nameAr,
    donationsNeeded: next.minDonations - count,
  };
}

export function syncDonorBadges(db, donorId, totalDonations) {
  const earned = badgesForDonationCount(totalDonations);
  const insert = db.prepare(
    "INSERT OR IGNORE INTO badges (donor_id, name, icon, color) VALUES (?, ?, ?, ?)"
  );
  const tx = db.transaction(() => {
    for (const b of earned) {
      insert.run(donorId, b.name, b.icon, b.color);
    }
  });
  tx();
  return earned;
}
