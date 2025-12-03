import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { HelpCircle, ExternalLink, Key } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

export function ApiKeysTutorial() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-military-hot-pink hover:text-military-hot-pink/80 hover:bg-military-hot-pink/10">
          <HelpCircle className="w-4 h-4 mr-2" />
          How to get API Keys
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-military-tactical-black border-military-storm-grey text-white max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-military-hot-pink" />
            API Key Configuration Guide
          </DialogTitle>
          <DialogDescription className="text-military-storm-grey">
            Follow these steps to obtain your personal API keys for social media monitoring.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-8 py-4">
            
            {/* Twitter / X */}
            <section className="space-y-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-xs">1</span>
                Twitter / X API Key
              </h3>
              <div className="pl-8 space-y-2 text-sm text-gray-300">
                <p>To monitor Twitter/X, you need a Bearer Token from the Twitter Developer Portal.</p>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>Go to the <a href="https://developer.twitter.com/en/portal/dashboard" target="_blank" rel="noopener noreferrer" className="text-military-hot-pink hover:underline inline-flex items-center">Twitter Developer Portal <ExternalLink className="w-3 h-3 ml-1" /></a>.</li>
                  <li>Sign up for a <strong>Free</strong> developer account if you haven't already.</li>
                  <li>Create a new <strong>Project</strong> and <strong>App</strong>.</li>
                  <li>Navigate to the <strong>Keys and Tokens</strong> tab of your App.</li>
                  <li>Generate a <strong>Bearer Token</strong>.</li>
                  <li>Copy the token and paste it into the Twitter API Key field.</li>
                </ol>
              </div>
            </section>

            {/* LinkedIn */}
            <section className="space-y-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-700/20 text-blue-700 flex items-center justify-center text-xs">2</span>
                LinkedIn API Key
              </h3>
              <div className="pl-8 space-y-2 text-sm text-gray-300">
                <p>For LinkedIn, you'll need an Access Token from the LinkedIn Developers portal.</p>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>Visit <a href="https://www.linkedin.com/developers/apps" target="_blank" rel="noopener noreferrer" className="text-military-hot-pink hover:underline inline-flex items-center">LinkedIn Developers <ExternalLink className="w-3 h-3 ml-1" /></a>.</li>
                  <li>Click <strong>Create App</strong> and fill in the details (link your company page).</li>
                  <li>In the <strong>Products</strong> tab, request access to "Share on LinkedIn" and "Sign In with LinkedIn".</li>
                  <li>Go to <strong>Auth</strong> tab to find your Client ID and Secret.</li>
                  <li>For personal monitoring, you can generate a temporary access token via the <a href="https://www.linkedin.com/developers/tools/oauth" target="_blank" rel="noopener noreferrer" className="text-military-hot-pink hover:underline">OAuth Token Generator</a> or implement the full OAuth flow (coming soon).</li>
                  <li>For now, paste your <strong>Access Token</strong> or Client ID depending on your setup.</li>
                </ol>
              </div>
            </section>

             {/* Facebook / Instagram */}
             <section className="space-y-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center text-xs">3</span>
                Facebook / Instagram
              </h3>
              <div className="pl-8 space-y-2 text-sm text-gray-300">
                <p>Meta requires a Graph API token.</p>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>Go to <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-military-hot-pink hover:underline inline-flex items-center">Meta for Developers <ExternalLink className="w-3 h-3 ml-1" /></a>.</li>
                  <li>Create an App (Type: Business).</li>
                  <li>Add the <strong>Instagram Graph API</strong> product.</li>
                  <li>Use the <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="text-military-hot-pink hover:underline">Graph API Explorer</a> to generate a User Access Token with `instagram_basic` and `pages_show_list` permissions.</li>
                  <li>Paste the token into the respective fields.</li>
                </ol>
              </div>
            </section>

            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <h4 className="text-yellow-500 font-bold mb-1 flex items-center gap-2">
                <HelpCircle className="w-4 h-4" /> Important Note
              </h4>
              <p className="text-xs text-yellow-200/80">
                Your API keys are encrypted and stored securely. They are only used to fetch data for your personal dashboard. 
                Never share these keys with anyone else.
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
