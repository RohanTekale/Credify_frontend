// src/components/cinema/CanvasManager.jsx
// Global registry ensuring only ONE WebGL <Canvas> is ever mounted at a time.
// Scenes register themselves with a priority; the manager unmounts any
// lower-priority canvas before a higher-priority one mounts.
// This keeps GPU/memory usage bounded as the user scrolls through chapters.

import React, { createContext, useContext, useRef, useState, useCallback } from 'react';

const CanvasManagerContext = createContext(null);

export const CanvasManagerProvider = ({ children }) => {
  const [activeId, setActiveId] = useState(null);
  const registryRef = useRef(new Map()); // id -> { priority }

  const requestActive = useCallback((id, priority = 0) => {
    setActiveId((current) => {
      if (current === id) return current;
      const currentPriority = registryRef.current.get(current)?.priority ?? -Infinity;
      if (priority >= currentPriority) {
        registryRef.current.set(id, { priority });
        return id;
      }
      return current;
    });
  }, []);

  const release = useCallback((id) => {
    registryRef.current.delete(id);
    setActiveId((current) => (current === id ? null : current));
  }, []);

  return (
    <CanvasManagerContext.Provider value={{ activeId, requestActive, release }}>
      {children}
    </CanvasManagerContext.Provider>
  );
};

// useCanvasSlot: a scene calls this with a unique id + priority + whether it's
// currently in viewport. Returns `isActive` — only render the <Canvas> when true.
export const useCanvasSlot = (id, { priority = 0, inView = false } = {}) => {
  const ctx = useContext(CanvasManagerContext);

  React.useEffect(() => {
    if (!ctx) return;
    if (inView) ctx.requestActive(id, priority);
    else ctx.release(id);
    return () => ctx.release(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, id, priority]);

  if (!ctx) return inView; // no provider in tree — fall back to inView only
  return ctx.activeId === id;
};

export default CanvasManagerProvider;
