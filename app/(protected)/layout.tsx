import { ReactNode } from "react"

export default function ProtectedLayout({
  children,
  navbar,
  sidebar,
}: {
  children: ReactNode
  navbar: ReactNode
  sidebar: ReactNode
}) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Top Navbar */}
      <header className="shrink-0 border-b border-neutral-200 bg-white p-4 shadow-sm">{navbar}</header>

      {/* Main Content Area with Sidebar and Chat */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-80 shrink-0 overflow-y-auto border-r border-neutral-200 bg-white p-4">{sidebar}</aside>

        {/* Main Chat Area */}
        <section className="flex-1 overflow-hidden">{children}</section>
      </div>
    </div>
  )
}
