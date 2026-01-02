import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '../constants/config';

export const useStoryStore = create(
  persist(
    (set, get) => ({
      stories: [],
      currentStory: null,
      
      // Actions
      setStories: (stories) => set({ stories }),
      
      addStory: (story) => set((state) => {
        const index = state.stories.findIndex(s => s.id === story.id);
        if (index > -1) {
          const newStories = [...state.stories];
          newStories[index] = story;
          return { stories: newStories };
        }
        return { stories: [story, ...state.stories] };
      }),
      
      removeStory: (id) => set((state) => ({
        stories: state.stories.filter(s => s.id !== id)
      })),
      
      setCurrentStory: (story) => set({ currentStory: story }),
      
      updateStory: (id, updatedData) => set((state) => ({
        stories: state.stories.map(s => s.id === id ? { ...s, ...updatedData } : s)
      })),
      
      // Utility for finding story
      getStoryById: (id) => get().stories.find(s => s.id === id),
    }),
    {
      name: STORAGE_KEYS.STORIES,
    }
  )
);
