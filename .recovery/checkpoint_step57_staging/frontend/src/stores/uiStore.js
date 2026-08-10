import { create } from 'zustand'

export const useUIStore = create((set) => ({
  isLeadModalVisible: false,
  openLeadModal: () => set({ isLeadModalVisible: true }),
  closeLeadModal: () => set({ isLeadModalVisible: false }),
}))
