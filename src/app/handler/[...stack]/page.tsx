import { EmpowermentCard} from "@/components/ui/boss-card"
export default function StackHandlerPage() {
  return (
    <div className="min-h-screen gradient-background p-6">
      <div className="max-w-4xl mx-auto">
        <EmpowermentCard>
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Stack Handler</h1>
            <p>This page is no longer needed with JWT authentication.</p>
          </div>
        </EmpowermentCard>
      </div>
    </div>
  )
}
