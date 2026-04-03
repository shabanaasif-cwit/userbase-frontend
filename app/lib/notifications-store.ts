/**
 * @deprecated Import from `@/lib/notifications-api` for API calls.
 * Re-exports types + helpers only (no localStorage).
 */
export type {
  StoredNotification,
  NotificationTargetType,
  UserNotification,
} from "./notifications-api";
export { getTargetSummary } from "./notifications-api";
