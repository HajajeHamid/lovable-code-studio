// stores/studioStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { BlockInstance } from '@/lib/blocks';
import { generateTPCode } from '@/lib/blocks';
import type { ParseResult } from '@/lib/tp-parser';

// ────────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────────

interface HistoryEntry {
  timestamp: number;
  blocks: BlockInstance[];
  description?: string;
}

interface StudioState {
  // Données principales
  blocks: BlockInstance[];
  selectedBlockId: string | null;
  tpCode: string;
  parseResult: ParseResult | null;

  // État interface
  activeTab: 'canvas' | 'code' | 'preview' | 'analysis';
  sidebarOpen: boolean;
  paletteMode: 'all' | 'favorites' | 'recent' | 'pinned';

  // Historique & undo/redo
  history: HistoryEntry[];
  historyIndex: number;
  maxHistory: number;

  // Métriques d'utilisation (pour tri intelligent dans la palette)
  blockUsageCount: Record<string, number>; // typeId → count

  // Actions de base sur les blocs
  addBlock: (typeId: string, parentId?: string, index?: number) => string;
  updateBlock: (blockId: string, updates: Partial<BlockInstance>) => void;
  updateBlockValues: (blockId: string, values: Record<string, any>) => void;
  removeBlock: (blockId: string) => void;
  moveBlock: (
    blockId: string,
    newParentId?: string,
    newIndex?: number
  ) => void;
  reorderRootBlocks: (activeId: string, overId: string) => void;
  selectBlock: (blockId: string | null) => void;
  toggleCollapse: (blockId: string) => void;
  toggleLock: (blockId: string) => void;

  // Gestion du code généré
  regenerateTPCode: () => void;
  setTPCode: (code: string) => void;
  setParseResult: (result: ParseResult | null) => void;

  // Interface
  setActiveTab: (tab: StudioState['activeTab']) => void;
  toggleSidebar: () => void;
  setPaletteMode: (mode: StudioState['paletteMode']) => void;

  // Historique
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  editingField: string;
  clearHistory: () => void;

  // Sources dynamiques pour les champs relation / select / multiselect
  getDynamicSource: (sourceType: string) => Array<{ value: string; label: string }>;

  // Statistiques d'utilisation
  incrementBlockUsage: (typeId: string) => void;
  resetBlockUsage: () => void;

  // Réinitialisation complète
  resetProject: () => void;

  // Duplication de bloc
  duplicateBlock: (blockId: string) => string | null;

  // Recherche de blocs
  findBlock: (blockId: string) => BlockInstance | null;
  findBlockRecursive: (blockId: string, blocks: BlockInstance[]) => BlockInstance | null;
}

// ────────────────────────────────────────────────────────────────────────────────
// Utilitaires internes
// ────────────────────────────────────────────────────────────────────────────────

const createHistoryEntry = (blocks: BlockInstance[], desc?: string): HistoryEntry => ({
  timestamp: Date.now(),
  blocks: JSON.parse(JSON.stringify(blocks)), // deep clone
  description: desc,
});

const MAX_HISTORY = 50;

// Deep clone avec nouveaux IDs
const deepCloneBlockWithNewIds = (block: BlockInstance): BlockInstance => {
  return {
    ...block,
    id: uuidv4(),
    children: block.children.map(deepCloneBlockWithNewIds),
    metadata: {
      ...block.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };
};

// Recherche récursive
const findBlockRecursive = (blockId: string, blocks: BlockInstance[]): BlockInstance | null => {
  for (const block of blocks) {
    if (block.id === blockId) return block;
    if (block.children.length > 0) {
      const found = findBlockRecursive(blockId, block.children);
      if (found) return found;
    }
  }
  return null;
};

// ────────────────────────────────────────────────────────────────────────────────
// Store
// ────────────────────────────────────────────────────────────────────────────────

export const useStudioStore = create<StudioState>()(
  persist(
    (set, get) => ({
      // État initial
      blocks: [],
      editingField:"true",
      setEditingField: (enable) => set({ editingField: enable }),
      selectedBlockId: null,
      tpCode: '',
      parseResult: null,

      activeTab: 'canvas',
      sidebarOpen: true,
      paletteMode: 'all',

      history: [],
      historyIndex: -1,
      maxHistory: MAX_HISTORY,

      blockUsageCount: {},

      // ─── Création ──────────────────────────────────────────────────────────────
      addBlock: (typeId, parentId, insertAtIndex = -1) => {
        console.log("add block");
        const newBlockId = uuidv4();
        console.log("add block");
        const newBlock: BlockInstance = {
          id: newBlockId,
          typeId,
          name: `${typeId.charAt(0).toUpperCase() + typeId.slice(1)}`,
          values: {},
          children: [],
          collapsed: false,
          locked: false,
          order: 0,
          parentId,
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
          },
        };
        console.log("add block");
        set((state) => {
          let newBlocks: BlockInstance[];

          if (!parentId) {
            // Bloc racine
            newBlocks = [...state.blocks];
            if (insertAtIndex >= 0 && insertAtIndex < newBlocks.length) {
              newBlocks.splice(insertAtIndex, 0, newBlock);
            } else {
              newBlocks.push(newBlock);
            }
          } else {
            // Bloc enfant
            const insertChild = (blocks: BlockInstance[]): BlockInstance[] =>
              blocks.map((b) => {
                if (b.id === parentId) {
                  let children = [...b.children];
                  if (insertAtIndex >= 0 && insertAtIndex <= children.length) {
                    children.splice(insertAtIndex, 0, newBlock);
                  } else {
                    children.push(newBlock);
                  }
                  return { ...b, children };
                }
                if (b.children.length > 0) {
                  return { ...b, children: insertChild(b.children) };
                }
                return b;
              });

            newBlocks = insertChild(state.blocks);
          }

          const newHistory = [
            ...state.history.slice(0, state.historyIndex + 1),
            createHistoryEntry(newBlocks, `Ajout bloc ${typeId}`),
          ].slice(-state.maxHistory);

          // Incrémenter usage
          const newUsageCount = {
            ...state.blockUsageCount,
            [typeId]: (state.blockUsageCount[typeId] || 0) + 1,
          };

          return {
            blocks: newBlocks,
            selectedBlockId: newBlockId,
            history: newHistory,
            historyIndex: newHistory.length - 1,
            blockUsageCount: newUsageCount,
          };
        });

        return newBlockId;
      },

      // ─── Mise à jour ───────────────────────────────────────────────────────────
      updateBlock: (blockId, updates) =>
        set((state) => {
          const updateRecursive = (blocks: BlockInstance[]): BlockInstance[] =>
            blocks.map((b) =>
              b.id === blockId
                ? { ...b, ...updates, metadata: { ...b.metadata, updatedAt: new Date(), version: b.metadata.version + 1 } }
                : { ...b, children: updateRecursive(b.children) }
            );

          const newBlocks = updateRecursive(state.blocks);
          const newHistory = [
            ...state.history.slice(0, state.historyIndex + 1),
            createHistoryEntry(newBlocks, 'Modification bloc'),
          ].slice(-state.maxHistory);

          return {
            blocks: newBlocks,
            history: newHistory,
            historyIndex: newHistory.length - 1,
          };
        }),

      updateBlockValues: (blockId, values) => {
        const block = get().findBlock(blockId);
        if (block) {
          get().updateBlock(blockId, { values: { ...block.values, ...values } });
        }
      },

      // ─── Suppression ───────────────────────────────────────────────────────────
      removeBlock: (blockId) =>
        set((state) => {
          const removeRecursive = (blocks: BlockInstance[]): BlockInstance[] =>
            blocks
              .filter((b) => b.id !== blockId)
              .map((b) => ({ ...b, children: removeRecursive(b.children) }));

          const newBlocks = removeRecursive(state.blocks);
          const newHistory = [
            ...state.history.slice(0, state.historyIndex + 1),
            createHistoryEntry(newBlocks, 'Suppression bloc'),
          ].slice(-state.maxHistory);

          return {
            blocks: newBlocks,
            selectedBlockId: state.selectedBlockId === blockId ? null : state.selectedBlockId,
            history: newHistory,
            historyIndex: newHistory.length - 1,
          };
        }),

      // ─── Déplacement ───────────────────────────────────────────────────────────
      moveBlock: (blockId, newParentId, newIndex = -1) => {
        set((state) => {
          // Trouver et extraire le bloc
          let movedBlock: BlockInstance | null = null;
          
          const extractBlock = (blocks: BlockInstance[]): BlockInstance[] =>
            blocks
              .map((b) => {
                if (b.id === blockId) {
                  movedBlock = { ...b };
                  return null;
                }
                if (b.children.length > 0) {
                  return { ...b, children: extractBlock(b.children) };
                }
                return b;
              })
              .filter((b): b is BlockInstance => b !== null);

          let newBlocks = extractBlock(state.blocks);

          if (!movedBlock) return state; // Bloc non trouvé

          // Mise à jour du parentId
          movedBlock.parentId = newParentId;

          // Insérer le bloc
          if (!newParentId) {
            // Bloc racine
            if (newIndex >= 0 && newIndex <= newBlocks.length) {
              newBlocks.splice(newIndex, 0, movedBlock);
            } else {
              newBlocks.push(movedBlock);
            }
          } else {
            // Bloc enfant
            const insertIntoParent = (blocks: BlockInstance[]): BlockInstance[] =>
              blocks.map((b) => {
                if (b.id === newParentId) {
                  const children = [...b.children];
                  if (newIndex >= 0 && newIndex <= children.length) {
                    children.splice(newIndex, 0, movedBlock!);
                  } else {
                    children.push(movedBlock!);
                  }
                  return { ...b, children };
                }
                if (b.children.length > 0) {
                  return { ...b, children: insertIntoParent(b.children) };
                }
                return b;
              });

            newBlocks = insertIntoParent(newBlocks);
          }

          const newHistory = [
            ...state.history.slice(0, state.historyIndex + 1),
            createHistoryEntry(newBlocks, 'Déplacement bloc'),
          ].slice(-state.maxHistory);

          return {
            blocks: newBlocks,
            history: newHistory,
            historyIndex: newHistory.length - 1,
          };
        });
      },

      reorderRootBlocks: (activeId, overId) => {
        set((state) => {
          const oldIndex = state.blocks.findIndex((b) => b.id === activeId);
          const newIndex = state.blocks.findIndex((b) => b.id === overId);

          if (oldIndex === -1 || newIndex === -1) return state;

          const newBlocks = [...state.blocks];
          const [moved] = newBlocks.splice(oldIndex, 1);
          newBlocks.splice(newIndex, 0, moved);

          const newHistory = [
            ...state.history.slice(0, state.historyIndex + 1),
            createHistoryEntry(newBlocks, 'Réorganisation racine'),
          ].slice(-state.maxHistory);

          return {
            blocks: newBlocks,
            history: newHistory,
            historyIndex: newHistory.length - 1,
          };
        });
      },

      // ─── Duplication ───────────────────────────────────────────────────────────
      duplicateBlock: (blockId) => {
        const state = get();
        const block = state.findBlock(blockId);
        
        if (!block) return null;

        const clonedBlock = deepCloneBlockWithNewIds(block);
        clonedBlock.name = `${block.name} (copie)`;

        // Ajouter à côté du bloc original
        const parentId = block.parentId;
        const newId = clonedBlock.id;

        set((s) => {
          let newBlocks: BlockInstance[];

          if (!parentId) {
            // Bloc racine
            const index = s.blocks.findIndex((b) => b.id === blockId);
            newBlocks = [...s.blocks];
            newBlocks.splice(index + 1, 0, clonedBlock);
          } else {
            // Bloc enfant
            const insertClone = (blocks: BlockInstance[]): BlockInstance[] =>
              blocks.map((b) => {
                if (b.id === parentId) {
                  const index = b.children.findIndex((c) => c.id === blockId);
                  const children = [...b.children];
                  children.splice(index + 1, 0, clonedBlock);
                  return { ...b, children };
                }
                if (b.children.length > 0) {
                  return { ...b, children: insertClone(b.children) };
                }
                return b;
              });

            newBlocks = insertClone(s.blocks);
          }

          const newHistory = [
            ...s.history.slice(0, s.historyIndex + 1),
            createHistoryEntry(newBlocks, 'Duplication bloc'),
          ].slice(-s.maxHistory);

          return {
            blocks: newBlocks,
            selectedBlockId: newId,
            history: newHistory,
            historyIndex: newHistory.length - 1,
          };
        });

        return newId;
      },

      // ─── États simples ─────────────────────────────────────────────────────────
      selectBlock: (id) => set({ selectedBlockId: id }),
      
      toggleCollapse: (blockId) =>
        set((state) => {
          const updateCollapse = (blocks: BlockInstance[]): BlockInstance[] =>
            blocks.map((b) =>
              b.id === blockId ? { ...b, collapsed: !b.collapsed } : { ...b, children: updateCollapse(b.children) }
            );
          return { blocks: updateCollapse(state.blocks) };
        }),

      toggleLock: (blockId) =>
        set((state) => {
          const updateLock = (blocks: BlockInstance[]): BlockInstance[] =>
            blocks.map((b) =>
              b.id === blockId ? { ...b, locked: !b.locked } : { ...b, children: updateLock(b.children) }
            );
          return { blocks: updateLock(state.blocks) };
        }),

      // ─── Code ──────────────────────────────────────────────────────────────────
      regenerateTPCode: () =>
        set((state) => {
          const newCode = generateTPCode(state.blocks);
          return { tpCode: newCode };
        }),

      setTPCode: (code) => set({ tpCode: code }),
      setParseResult: (result) => set({ parseResult: result }),

      // ─── Interface ─────────────────────────────────────────────────────────────
      setActiveTab: (tab) => set({ activeTab: tab }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setPaletteMode: (mode) => set({ paletteMode: mode }),

      // ─── Historique ────────────────────────────────────────────────────────────
      undo: () =>
        set((state) => {
          if (state.historyIndex <= 0) return state;
          return {
            blocks: state.history[state.historyIndex - 1].blocks,
            historyIndex: state.historyIndex - 1,
          };
      }),

      redo: () =>
        set((state) => {
          if (state.historyIndex >= state.history.length - 1) return state;
          return {
            blocks: state.history[state.historyIndex + 1].blocks,
            historyIndex: state.historyIndex + 1,
          };
      }),

      canUndo: false,
      canRedo: false,

      clearHistory: () => set({ history: [], historyIndex: -1 }),

      // ─── Recherche ─────────────────────────────────────────────────────────────
      findBlock: (blockId) => {
        const { blocks } = get();
        return findBlockRecursive(blockId, blocks);
      },

      findBlockRecursive,

      // ─── Sources dynamiques pour champs ────────────────────────────────────────
      getDynamicSource: (sourceType) => {
        const { blocks } = get();

        switch (sourceType.toLowerCase()) {
          case 'models':
          case 'model':
            return blocks
              .filter((b) => b.typeId === 'model')
              .map((b) => ({
                value: b.id,
                label: b.values.name || b.name || `Model ${b.id.slice(0, 8)}`,
              }));

          case 'enums':
          case 'enum':
            return blocks
              .filter((b) => b.typeId === 'enum')
              .map((b) => ({
                value: b.id,
                label: b.values.name || b.name || `Enum ${b.id.slice(0, 8)}`,
              }));

          case 'components':
          case 'component':
            return blocks
              .filter((b) => b.typeId === 'component' || b.typeId.includes('component'))
              .map((b) => ({ value: b.id, label: b.values.name || b.name }));

          case 'pages':
          case 'page':
            return blocks
              .filter((b) => b.typeId === 'page')
              .map((b) => ({ value: b.id, label: b.values.name || b.name }));

          case 'apis':
          case 'api':
            return blocks
              .filter((b) => b.typeId === 'api')
              .map((b) => ({ value: b.id, label: b.values.name || b.name }));

          case 'entities':
            return blocks
              .filter((b) => ['model', 'enum', 'dataJson'].includes(b.typeId))
              .map((b) => ({ value: b.id, label: b.values.name || b.name }));

          case 'fields':
            const selectedBlock = get().selectedBlockId ? get().findBlock(get().selectedBlockId!) : null;
            if (selectedBlock && 'fields' in selectedBlock.values) {
              return (selectedBlock.values.fields as any[])?.map((f: any) => ({
                value: f.name || f.id,
                label: f.label || f.name || f.id,
              })) || [];
            }
            return [];

          default:
            return [];
        }
      },

      // ─── Métriques d'utilisation ───────────────────────────────────────────────
      incrementBlockUsage: (typeId) =>
        set((state) => ({
          blockUsageCount: {
            ...state.blockUsageCount,
            [typeId]: (state.blockUsageCount[typeId] || 0) + 1,
          },
      })),

      resetBlockUsage: () => set({ blockUsageCount: {} }),

      // ─── Reset complet ─────────────────────────────────────────────────────────
      resetProject: () =>
        set({
          blocks: [],
          selectedBlockId: null,
          tpCode: '',
          parseResult: null,
          history: [],
          historyIndex: -1,
          blockUsageCount: {},
      }),
      setCanUndo: (canUndo: boolean) =>
        set((state) => ({ ...state, canUndo })),
      setCanRedo: (canRedo: boolean) =>
        set((state) => ({ ...state, canRedo })),
    }),

    {
      name: 'studio-project-storage-v2',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        blocks: state.blocks,
        blockUsageCount: state.blockUsageCount,
        tpCode: state.tpCode,
        activeTab: state.activeTab,
        sidebarOpen: state.sidebarOpen,
        paletteMode: state.paletteMode,
        findBlockRecursive:state.findBlockRecursive,
        selectBlock: state.selectBlock,
        setTPCode: state.setTPCode,
        addBlock: state.addBlock,
        moveBlock: state.moveBlock,
        removeBlock: state.removeBlock,
        undo: state.undo,
        redo: state.redo,
        canUndo: state.canUndo,
        canRedo: state.canRedo,
        setActiveTab: state.setActiveTab,
        toggleSidebar: state.toggleSidebar,
        parseResult: state.parseResult,
        setParseResult: state.setParseResult
      }),
      version: 2,
      migrate: (persistedState: any, version) => {
        if (version < 2) {
          // Migration v1 → v2
          return {
            ...persistedState,
            activeTab: persistedState.activeTab === 'blocks' ? 'canvas' : persistedState.activeTab,
          };
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        // Mettre à jour canUndo/canRedo après rehydratation
        if (state) {
          state.canUndo = state.historyIndex > 0;
          state.canRedo = state.historyIndex < state.history.length - 1;
        }
      },
    }
  )
);

// Hook pour mettre à jour canUndo/canRedo automatiquement
/*
if (typeof window !== 'undefined') {
  useStudioStore.subscribe((state) => {
    useStudioStore.setState({
      canUndo: state.historyIndex > 0,
      canRedo: state.historyIndex < state.history.length - 1,
    });
  });
}

*/