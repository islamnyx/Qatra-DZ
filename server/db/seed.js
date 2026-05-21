export function seedDatabase(db) {
  const donorCount = db.prepare("SELECT COUNT(*) AS c FROM donors").get().c;
  if (donorCount > 0) return;

  const insertDonor = db.prepare(`
    INSERT INTO donors (id, name, blood_type, wilaya, last_donation, total_donations, points, family_circle_active)
    VALUES (@id, @name, @blood_type, @wilaya, @last_donation, @total_donations, @points, @family_circle_active)
  `);

  const donors = [
    { id: "DZ-001", name: "أمين بوعلام", blood_type: "O-", wilaya: "Alger", last_donation: "2025-03-10", total_donations: 7, points: 1450, family_circle_active: 1 },
    { id: "DZ-002", name: "سارة بن عودة", blood_type: "A+", wilaya: "Alger", last_donation: "2025-01-15", total_donations: 12, points: 2100, family_circle_active: 1 },
    { id: "DZ-003", name: "يوسف قاسمي", blood_type: "B+", wilaya: "Alger", last_donation: "2024-12-01", total_donations: 9, points: 1780, family_circle_active: 1 },
    { id: "DZ-004", name: "نادية مرزاق", blood_type: "AB+", wilaya: "Alger", last_donation: "2025-02-20", total_donations: 6, points: 1200, family_circle_active: 1 },
    { id: "DZ-005", name: "كريم حداد", blood_type: "O+", wilaya: "Alger", last_donation: "2024-10-05", total_donations: 5, points: 980, family_circle_active: 1 },
    { id: "DZ-006", name: "ليلى بوزيد", blood_type: "A-", wilaya: "Alger", last_donation: "2025-04-01", total_donations: 4, points: 820, family_circle_active: 1 },
  ];

  const seedTx = db.transaction(() => {
    for (const d of donors) insertDonor.run(d);

    const insertBadge = db.prepare(
      "INSERT INTO badges (donor_id, name, icon, color) VALUES (?, ?, ?, ?)"
    );
    insertBadge.run("DZ-001", "بطل الدم", "award", "red");
    insertBadge.run("DZ-001", "نجم الولاية", "star", "amber");

    const insertHistory = db.prepare(
      "INSERT INTO donation_history (donor_id, donation_date, hospital) VALUES (?, ?, ?)"
    );
    const history = [
      ["DZ-001", "2025-03-10", "CHU Mustapha Pacha"],
      ["DZ-001", "2024-11-22", "Centre de transfusion Alger"],
      ["DZ-001", "2024-06-05", "Hôpital Maillot"],
      ["DZ-001", "2023-12-18", "CHU Bab El Oued"],
    ];
    for (const row of history) insertHistory.run(...row);

    const insertFamily = db.prepare(`
      INSERT INTO family_members (id, donor_id, name, relation_ar, relation_fr, blood_type, wilaya, alert_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const family = [
      ["F1", "DZ-001", "فاطمة بوعلام", "الأم", "Mère", "A+", "Alger", 1],
      ["F2", "DZ-001", "بوعلام بن أحمد", "الأب", "Père", "O+", "Alger", 2],
      ["F3", "DZ-001", "سارة بوعلام", "الأخت", "Sœur", "O-", "Alger", 3],
      ["F4", "DZ-001", "ياسين بوعلام", "الأخ", "Frère", "B+", "Blida", 4],
    ];
    for (const row of family) insertFamily.run(...row);

    const insertSos = db.prepare(`
      INSERT INTO sos_requests (id, blood_type, hospital, wilaya, urgency, posted_at, active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `);
    const sos = [
      ["SOS-001", "O-", "CHU Mustapha Pacha", "Alger", "critical", "2026-05-20T08:15:00"],
      ["SOS-002", "AB-", "EHSU Bab El Oued", "Alger", "critical", "2026-05-20T09:30:00"],
      ["SOS-003", "B+", "CHU Constantine", "Constantine", "normal", "2026-05-19T14:00:00"],
      ["SOS-004", "A+", "CHU Oran", "Oran", "normal", "2026-05-19T11:45:00"],
    ];
    for (const row of sos) insertSos.run(...row);

    const insertWilaya = db.prepare(`
      INSERT INTO wilayas (name, name_ar, status, shortage, hospitals)
      VALUES (?, ?, ?, ?, ?)
    `);
    const wilayas = [
      ["Alger", "الجزائر", "critical", "O-", JSON.stringify(["CHU Mustapha Pacha", "EHSU Bab El Oued", "Centre transfusion Alger"])],
      ["Oran", "وهران", "ok", null, JSON.stringify(["CHU Oran", "Centre transfusion Oran"])],
      ["Constantine", "قسنطينة", "critical", "AB-", JSON.stringify(["CHU Constantine", "Hôpital Mouad Boudiaf"])],
      ["Blida", "البليدة", "ok", null, JSON.stringify(["CHU Blida", "Centre transfusion Blida"])],
      ["Annaba", "عنابة", "critical", "B+", JSON.stringify(["CHU Annaba", "EHSU Annaba"])],
      ["Sétif", "سطيف", "ok", null, JSON.stringify(["CHU Sétif", "Centre transfusion Sétif"])],
    ];
    for (const row of wilayas) insertWilaya.run(...row);

    const insertFeed = db.prepare(`
      INSERT INTO news_feed (id, title, title_fr, description, description_fr, feed_date, tag, tag_color, is_campaign, days_left, campaign_interest)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertFeed.run(
      1,
      "حملة تبرع وطنية — رمضان 2026",
      "Campagne nationale — Ramadan 2026",
      "انضموا إلى حملة الهلال الأحمر الجزائري في 48 ولاية.",
      "Rejoignez la campagne CRA dans 48 wilayas.",
      "2026-05-01",
      "حملة",
      "red",
      1,
      3,
      487
    );
    insertFeed.run(
      2,
      "نجاح: 12,000 متبرع في أسبوع واحد",
      null,
      "شكراً لجميع المتبرعين الذين أنقذوا آلاف الأرواح.",
      null,
      "2026-04-18",
      "نجاح",
      "green",
      0,
      null,
      0
    );
    insertFeed.run(
      3,
      "فعالية: يوم التبرع — حديقة بن عكنون",
      null,
      "تبرع مجاني مع فحص طبي ووجبات خفيفة للمتبرعين.",
      null,
      "2026-05-25",
      "فعالية",
      "blue",
      0,
      null,
      0
    );

    const insertRank = db.prepare(
      "INSERT INTO leaderboard (donor_id, rank_order) VALUES (?, ?)"
    );
    const ranks = [
      ["DZ-002", 1],
      ["DZ-003", 2],
      ["DZ-001", 3],
      ["DZ-004", 4],
      ["DZ-005", 5],
      ["DZ-006", 6],
    ];
    for (const row of ranks) insertRank.run(...row);
  });

  seedTx();
}
