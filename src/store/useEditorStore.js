import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export const useEditorStore = create((set, get) => ({
  metadata: {
    title: '',
    author: '',
    description: '',
    theme: 'christmas',
  },
  editingStoryId: null,
  nodes: {
    'start': {
      id: 'start',
      text: '',
      image: '',
      choices: [], // { label, nextId, letter }
      isEnding: false,
      ending: { title: '', message: '', type: 'neutral' }
    }
  },
  
  // Actions
  setMetadata: (data) => set((state) => ({ 
    metadata: { ...state.metadata, ...data } 
  })),
  
  updateNode: (id, data) => set((state) => ({
    nodes: {
      ...state.nodes,
      [id]: { ...state.nodes[id], ...data }
    }
  })),
  
  addChoice: (parentId, letter) => {
    const newId = `node-${uuidv4()}`;
    const newNode = {
      id: newId,
      text: '',
      image: '',
      choices: [],
      isEnding: false,
      ending: { title: '', message: '', type: 'neutral' }
    };
    
    set((state) => {
      const parentNode = state.nodes[parentId];
      if (!parentNode) return state;
      
      return {
        nodes: {
          ...state.nodes,
          [newId]: newNode,
          [parentId]: {
            ...parentNode,
            choices: [...parentNode.choices, { label: '', nextId: newId, letter }]
          }
        }
      };
    });
    
    return newId;
  },
  
  deleteNode: (id, parentId) => {
    set((state) => {
      const newNodes = { ...state.nodes };
      
      // Recursive delete helper
      const removeRecursive = (nodeId) => {
        const node = newNodes[nodeId];
        if (node) {
          node.choices.forEach(c => removeRecursive(c.nextId));
          delete newNodes[nodeId];
        }
      };
      
      removeRecursive(id);
      
      // Update parent's choices
      if (parentId && newNodes[parentId]) {
        newNodes[parentId] = {
          ...newNodes[parentId],
          choices: newNodes[parentId].choices.filter(c => c.nextId !== id)
        };
      }
      
      return { nodes: newNodes };
    });
  },
  
  resetEditor: () => set({
    metadata: { title: '', author: '', description: '', theme: 'christmas' },
    editingStoryId: null,
    nodes: {
      'start': {
        id: 'start',
        text: '',
        image: '',
        choices: [],
        isEnding: false,
        ending: { title: '', message: '', type: 'neutral' }
      }
    }
  }),

  loadStory: (story) => {
    set({
      metadata: story.metadata,
      editingStoryId: story.id,
      nodes: story.nodes,
    });
  }
}));
