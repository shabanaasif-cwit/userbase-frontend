"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { connectSocket, disconnectSocket } from "@/lib/socket-client";
import {
  NOTIFICATIONS_SYNC_EVENT,
  REMINDERS_SYNC_EVENT,
} from "@/lib/socket-events";

type NotificationEnvelope = {
  notification?: {
    _id?: string;
    id?: string;
  };
};

type ReminderEnvelope = {
  reminder?: {
    _id?: string;
    id?: string;
  };
};

//send a custom event globally on window when a socket event is received, so that any component can listen for it and update accordingly
function dispatchWindowEvent(name: string) {
  window.dispatchEvent(new CustomEvent(name));
}

export default function SocketSync() {
  const { isAuthenticated, accessToken, isReady } = useAuth();

  useEffect(() => {
    if (!isReady || !isAuthenticated || !accessToken) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket(accessToken);

    const handleNotificationEvent = (_payload: NotificationEnvelope) => {
      dispatchWindowEvent(NOTIFICATIONS_SYNC_EVENT);
    };

    const handleReminderEvent = (_payload: ReminderEnvelope) => {
      dispatchWindowEvent(REMINDERS_SYNC_EVENT);
      dispatchWindowEvent("reminder-count-updated");
    };

    socket.on("notification:created", handleNotificationEvent);
    socket.on("notification:updated", handleNotificationEvent);
    socket.on("notification:deleted", handleNotificationEvent);
    socket.on("notification:read", handleNotificationEvent);
    socket.on("reminder:created", handleReminderEvent);
    socket.on("reminder:read", handleReminderEvent);

    return () => {
      socket.off("notification:created", handleNotificationEvent);
      socket.off("notification:updated", handleNotificationEvent);
      socket.off("notification:deleted", handleNotificationEvent);
      socket.off("notification:read", handleNotificationEvent);
      socket.off("reminder:created", handleReminderEvent);
      socket.off("reminder:read", handleReminderEvent);
      socket.disconnect();
    };
  }, [accessToken, isAuthenticated, isReady]);

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
    }
  }, [isAuthenticated]);

  return null;
}
