import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '../constants/config';

export const useConfigStore = create(
  persist(
    (set) => ({
      isDarkMode: true,
      soundEnabled: true,
      userName: '',
      userId: '',

      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setDarkMode: (isDark) => set({ isDarkMode: isDark }),
      
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      setUserName: (name) => set({ userName: name }),
      setUserId: (id) => set({ userId: id }),
    }),
    {
      name: 'app-config',
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        soundEnabled: state.soundEnabled,
        userName: state.userName,
        userId: state.userId,
      }),
    }
  )
);
