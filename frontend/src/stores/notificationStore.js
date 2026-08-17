import { create } from 'zustand';
import axiosClient from '../services/axiosClient';
import { io } from 'socket.io-client';
import { getAccessToken } from '../services/authSession';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  socket: null,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const res = await axiosClient.get('/admin/notifications');
      set({
        notifications: res.data || [],
        unreadCount: res.unreadCount || 0,
        loading: false,
      });
    } catch (error) {
      console.error('Lỗi khi tải thông báo:', error);
      set({ loading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      await axiosClient.put(`/admin/notifications/${id}/read`);
      if (id === 'all') {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        }));
      } else {
        set((state) => {
          const updated = state.notifications.map((n) =>
            n._id === id ? { ...n, isRead: true } : n
          );
          return {
            notifications: updated,
            unreadCount: Math.max(0, state.unreadCount - 1),
          };
        });
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái thông báo:', error);
    }
  },

  initSocket: () => {
    const currentSocket = get().socket;
    if (currentSocket) return;

    const newSocket = io(`${SOCKET_URL}/notifications`, {
      transports: ['websocket'],
      withCredentials: true,
      auth: (callback) => callback({ token: getAccessToken() || null }),
    });

    newSocket.on('new_notification', (notif) => {
      set((state) => ({
        notifications: [notif, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      }));
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const currentSocket = get().socket;
    if (currentSocket) {
      currentSocket.disconnect();
      set({ socket: null });
    }
  },
}));
