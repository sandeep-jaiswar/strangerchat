export { closeDb, getDb, hasDatabase, type Database } from "./client.ts";
export { generateHandle, isValidHandle } from "./handles.ts";
export {
  areFriends,
  blockUser,
  ensureUser,
  getBlockedRelationIds,
  isBlockedBetween,
  isUserBanned,
  listDirectMessages,
  listFriendsAndRequests,
  recordChessGameAndUpdateElo,
  removeFriend,
  reportUser,
  requestOrAcceptFriend,
  respondFriendRequest,
  saveDirectMessage,
  unblockUser,
  updateUserHandle,
  type DirectMessageItem,
  type FriendSummary,
  type UserProfile,
} from "./queries.ts";
export * as schema from "./schema.ts";
