"use client"

import type { ReactNode } from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import ChatInterface from "./chat-interface"
import { usePlayer } from "./player-provider"
import { AnimatePresence, motion } from "framer-motion"

export default function MainLayout({ children }: { children: ReactNode }) {
  const { isAIChatVisible } = usePlayer()

  return (
    <div className="w-full h-[calc(100vh-64px)]">
      <AnimatePresence initial={false}>
        {isAIChatVisible ? (
          <motion.div
            key="chat-panel"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            exit={{ width: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <ResizablePanelGroup direction="horizontal" className="w-full h-full">
              <ResizablePanel defaultSize={30} minSize={25} maxSize={40} className="h-full">
                <ChatInterface />
              </ResizablePanel>

              <ResizableHandle withHandle />

              <ResizablePanel defaultSize={70} className="h-full">
                <div className="h-full overflow-auto p-6">{children}</div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </motion.div>
        ) : (
          <motion.div
            key="content-only"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full overflow-auto p-6"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
