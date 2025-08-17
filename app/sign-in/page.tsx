import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"


export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md lg:max-w-lg xl:max-w-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-purple-600">
            Welcome Back
          </CardTitle>
          <CardDescription>
            Sign in to your SoloBoss AI account to continue building your empire
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600">Please use the sign-in page at /signin</p>
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