import { create } from 'zustand';
import axiosClient from '../services/axiosClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  eventSource: null,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const payload = await axiosClient.get('/admin/notifications');
      set({ notifications: payload?.data || [], unreadCount: payload?.unreadCount || 0, loading: false });
    } catch (error) {
      console.error('Lỗi khi tải thông báo:', error);
      set({ loading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      await axiosClient.put(`/admin/notifications/${id}/read`);
      if (id === 'all') set((state) => ({ notifications: state.notifications.map((item) => ({ ...item, isRead: true })), unreadCount: 0 }));
      else set((state) => {
        const target = state.notifications.find((item) => item._id === id);
        return { notifications: state.notifications.map((item) => item._id === id ? { ...item, isRead: true } : item), unreadCount: target && !target.isRead ? Math.max(0, state.unreadCount - 1) : state.unreadCount };
      });
    } catch (error) { console.error('Lỗi khi cập nhật trạng thái thông báo:', error); }
  },

  initRealtime: async () => {
    if (get().eventSource) return;
    try {
      const payload = await axiosClient.post('/admin/notifications/stream-ticket');
      const ticket = payload?.data?.ticket;
      if (!ticket || get().eventSource) return;
      const source = new EventSource(`${API_BASE_URL}/admin/notifications/events?ticket=${encodeURIComponent(ticket)}`, { withCredentials: true });
      source.addEventListener('stream.connected', () => get().fetchNotifications());
      source.addEventListener('notification.created', (event) => {
        const notification = JSON.parse(event.data)?.data;
        if (!notification) return;
        set((state) => {
          const id = notification._id || notification.id;
          if (id && state.notifications.some((item) => (item._id || item.id) === id)) return state;
          return { notifications: [notification, ...state.notifications], unreadCount: state.unreadCount + (notification.isRead ? 0 : 1) };
        });
      });
      source.onerror = () => {
        source.close();
        set({ eventSource: null });
        setTimeout(() => get().initRealtime(), 2000);
      };
      set({ eventSource: source });
    } catch (error) {
      console.error('Lỗi khi kết nối notification SSE:', error);
      setTimeout(() => get().initRealtime(), 2000);
    }
  },

  disconnectRealtime: () => {
    get().eventSource?.close();
    set({ eventSource: null });
  },
}));

