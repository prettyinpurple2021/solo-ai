import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"


export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md lg:max-w-lg xl:max-w-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-purple-600">
            Start Your Empire
          </CardTitle>
          <CardDescription>
            Create your SoloBoss AI account and begin your journey to success
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600">Please use the sign-up page at /signup</p>
          </div>
          
          <div className="pt-4">
            <Link href="/">
              <Button className="w-full bg-purple-600 text-white hover:bg-purple-700">
                Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}