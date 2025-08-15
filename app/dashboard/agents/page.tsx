import { createClient } from "@/lib/neon/server"
import Image from "next/image"

type Agent = {
  name: string
  display_name: string
  description: string
  accent_color: string
  avatar_url: string | null
}

export const metadata = {
  title: "AI Agents | SoloBoss AI",
}

export default async function AgentsPage() {
  const client = await createClient()
  const { rows } = await client.query<Agent>(
    `SELECT name, display_name, description, accent_color, avatar_url
     FROM ai_agents
     WHERE is_active = TRUE
     ORDER BY display_name ASC`
  )

  const agents = rows

  return (
    <div className="px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Your AI Team</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <div
            key={agent.name}
            className="rounded-xl border p-5 bg-white/50 dark:bg-zinc-900/50 shadow-sm"
            style={{ borderColor: agent.accent_color || "#e5e7eb" }}
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="relative h-12 w-12 rounded-full overflow-hidden border" style={{ borderColor: agent.accent_color || "#e5e7eb" }}>
                <Image
                  src={agent.avatar_url || `/images/agents/${agent.name}.png`}
                  alt={agent.display_name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div>
                <div className="font-semibold">{agent.display_name}</div>
                <div className="text-xs opacity-70">@{agent.name}</div>
              </div>
            </div>
            <p className="text-sm opacity-80">{agent.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Check actual AI agents list