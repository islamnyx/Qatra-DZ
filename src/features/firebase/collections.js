/**
 * Firestore collection & document paths — agreed contract for the team.
 * Firebase teammate: use these names so everyone matches.
 */
export const COLLECTIONS = {
  donors: "donors",
  familyMembers: "family_members",
  sosRequests: "sos_requests",
  sosResponses: "sos_responses",
  wilayas: "wilayas",
  newsFeed: "news_feed",
  campaignRegs: "campaign_registrations",
  chatSessions: "chat_sessions",
};

/** Example doc: donors/DZ-001 */
export function donorPath(id) {
  return `${COLLECTIONS.donors}/${id}`;
}

export function familyQuery(donorId) {
  return { collection: COLLECTIONS.familyMembers, where: [["donorId", "==", donorId]] };
}
