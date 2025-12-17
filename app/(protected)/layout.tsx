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
    <main className="flex min-h-screen flex-col">
      <header className="w-full p-4 shadow">{navbar}</header>
      <main className="flex flex-1 flex-row shadow">
        <aside className="w-2/8 p-4 shadow">{sidebar}</aside>
        <section className="w-6/8 p-4">{children}</section>
      </main>
    </main>
  )
}
