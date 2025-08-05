"use client"

import { useState, useEffect } from "react"
import { useAuthMigration } from "@/hooks/use-unified-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle, ArrowRight } from "lucide-react"

export function MigrationBanner() {
  const { migrationStatus, checkMigrationStatus, startMigration, needsMigration } = useAuthMigration()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check migration status when component mounts
    checkMigrationStatus()
  }, [checkMigrationStatus])

  useEffect(() => {
    // Show banner if migration is needed
    setIsVisible(needsMigration)
  }, [needsMigration])

  if (!isVisible) {
    return null
  }

  const getStatusContent = () => {
    switch (migrationStatus) {
      case 'checking':
        return (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
            <span className="text-sm text-gray-600">Checking your account...</span>
          </div>
        )
      
      case 'migrating':
        return (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
            <span className="text-sm text-gray-600">Migrating your data...</span>
          </div>
        )
      
      case 'completed':
        return (
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-600 font-medium">Migration completed!</span>
          </div>
        )
      
      case 'error':
        return (
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-600">Migration failed. Please try again.</span>
          </div>
        )
      
      default:
        return (
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-soloboss flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">🚀</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Welcome to the New SoloBoss AI!
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  We've upgraded our authentication system to provide you with a better experience. 
                  Let's migrate your existing data to ensure nothing is lost.
                </p>
              </div>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <h4 className="font-medium text-purple-900 mb-2">What will be migrated:</h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-purple-600" />
                  <span>Your profile information</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-purple-600" />
                  <span>All your projects and tasks</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-purple-600" />
                  <span>Saved templates and preferences</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-purple-600" />
                  <span>Your AI agent configurations</span>
                </li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <Button 
                onClick={startMigration}
                className="flex-1 boss-button bg-gradient-soloboss hover:bg-gradient-soloboss-light text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Start Migration
              </Button>
              <Button 
                variant="outline"
                onClick={() => setIsVisible(false)}
                className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 font-semibold py-2 px-4 rounded-lg transition-all duration-300 hover:border-purple-400 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Later
              </Button>
            </div>
          </div>
        )
    }
  }

  return (
    <Card className="boss-card border-2 border-purple-200 hover:border-purple-300 transition-all duration-300 mb-6">
      <CardContent className="p-6">
        {getStatusContent()}
      </CardContent>
    </Card>
  )
}

export function MigrationStatus() {
  const { migrationStatus } = useAuthMigration()

  if (migrationStatus === 'completed') {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Your account has been successfully migrated to the new system!
        </AlertDescription>
      </Alert>
    )
  }

  if (migrationStatus === 'error') {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Migration failed. Please contact support if you need assistance.
        </AlertDescription>
      </Alert>
    )
  }

  return null
} 