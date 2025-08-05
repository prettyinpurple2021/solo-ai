import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'
import { generateText, streamText } from 'ai'
import { z } from 'zod'

// Request schema validation
const chatRequestSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  agentName: z.string().min(1, 'Agent name is required'),
  conversationId: z.string().optional(),
  context: z.object({}).optional(),
  stream: z.boolean().default(true),
})

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request
    const body = await request.json()
    const { message, agentName, conversationId, context = {}, stream } = chatRequestSchema.parse(body)

    // Initialize Supabase client
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get AI agent configuration
    const { data: agent, error: agentError } = await supabase
      .from('ai_agents')
      .select('*')
      .eq('name', agentName)
      .eq('is_active', true)
      .single()

    if (agentError || !agent) {
      return NextResponse.json({ error: 'AI agent not found' }, { status: 404 })
    }

    // Get or create conversation
    let conversation
    if (conversationId) {
      const { data: existingConversation, error: convError } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single()

      if (convError || !existingConversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
      }
      conversation = existingConversation
    } else {
      // Create new conversation
      const { data: newConversation, error: createError } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: user.id,
          agent_id: agent.id,
          title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
          context,
        })
        .select()
        .single()

      if (createError) {
        return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
      }
      conversation = newConversation
    }

    // Get conversation history
    const { data: messages, error: messagesError } = await supabase
      .from('ai_messages')
      .select('*')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true })
      .limit(20) // Last 20 messages for context

    if (messagesError) {
      return NextResponse.json({ error: 'Failed to fetch conversation history' }, { status: 500 })
    }

    // Save user message
    const { error: saveUserMessageError } = await supabase
      .from('ai_messages')
      .insert({
        conversation_id: conversation.id,
        role: 'user',
        content: message,
        metadata: { timestamp: new Date().toISOString() }
      })

    if (saveUserMessageError) {
      return NextResponse.json({ error: 'Failed to save user message' }, { status: 500 })
    }

    // Prepare conversation history for AI
const conversationHistory = (messages || []).map(msg => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
    }))

    // Add current user message
    conversationHistory.push({
      role: 'user',
      content: message,
    })

    // Get user profile for personalization
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, subscription_tier, level, total_points')
      .eq('id', user.id)
      .single()

    // Prepare system message with agent personality and user context
    const systemMessage = {
      role: 'system' as const,
      content: `${agent.system_prompt}

User Context:
- Name: ${profile?.full_name || 'User'}
- Subscription: ${profile?.subscription_tier || 'free'}
- Level: ${profile?.level || 1}
- Points: ${profile?.total_points || 0}

Agent Guidelines:
- Stay in character as ${agent.display_name}
- Use your personality: ${agent.personality}
- Focus on your capabilities: ${agent.capabilities.join(', ')}
- Be helpful, actionable, and specific
- Keep responses concise but comprehensive
- Always aim to provide value and next steps

Current conversation context: ${JSON.stringify(context)}`
    }

    // Choose AI model based on agent preference
    let model
    switch (agent.model_preference) {
      case 'gpt-4':
        model = openai('gpt-4-turbo')
        break
      case 'gpt-3.5-turbo':
        model = openai('gpt-3.5-turbo')
        break
      case 'claude-3':
        model = anthropic('claude-3-haiku-20240307')
        break
      case 'gemini-pro':
        model = google('gemini-pro')
        break
      default:
        model = openai('gpt-4-turbo')
    }

    // Handle streaming vs non-streaming response
    if (stream) {
      const result = await streamText({
        model,
        messages: [systemMessage, ...conversationHistory],
        temperature: 0.7,
        maxTokens: 1000,
      })

      // Stream the response while collecting the full text
      let fullResponse = ''
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of result.textStream) {
              fullResponse += chunk
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
            }

            // Save assistant message after streaming is complete
            await supabase
              .from('ai_messages')
              .insert({
                conversation_id: conversation.id,
                role: 'assistant',
                content: fullResponse,
                metadata: { 
                  model: agent.model_preference,
                  agent_id: agent.id,
                  timestamp: new Date().toISOString()
                },
                tokens_used: await result.usage.then(u => u.totalTokens).catch(() => null),
                model_used: agent.model_preference
              })

            // Update conversation last message time
            await supabase
              .from('ai_conversations')
              .update({ 
                last_message_at: new Date().toISOString(),
                context: { ...conversation.context, ...context }
              })
              .eq('id', conversation.id)

            // Update daily stats
            await supabase.rpc('update_daily_stats', {
              p_user_id: user.id,
              p_stat_type: 'ai_interactions',
              p_increment: 1
            })

            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ 
              done: true, 
              conversationId: conversation.id,
              agentName: agent.name,
              agentColor: agent.accent_color 
            })}\n\n`))
            controller.close()
          } catch (error) {
            controller.error(error)
          }
        },
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    } else {
      // Non-streaming response
      const result = await generateText({
        model,
        messages: [systemMessage, ...conversationHistory],
        temperature: 0.7,
        maxTokens: 1000,
      })

      // Save assistant message
      const { error: saveAssistantError } = await supabase
        .from('ai_messages')
        .insert({
          conversation_id: conversation.id,
          role: 'assistant',
          content: result.text,
          metadata: { 
            model: agent.model_preference,
            agent_id: agent.id,
            timestamp: new Date().toISOString()
          },
          tokens_used: result.usage.totalTokens,
          model_used: agent.model_preference
        })

      if (saveAssistantError) {
        console.error('Failed to save assistant message:', saveAssistantError)
      }

      // Update conversation
      await supabase
        .from('ai_conversations')
        .update({ 
          last_message_at: new Date().toISOString(),
          context: { ...conversation.context, ...context }
        })
        .eq('id', conversation.id)

      // Update daily stats
      await supabase.rpc('update_daily_stats', {
        p_user_id: user.id,
        p_stat_type: 'ai_interactions',
        p_increment: 1
      })

      return NextResponse.json({
        content: result.text,
        conversationId: conversation.id,
        agentName: agent.name,
        agentColor: agent.accent_color,
        usage: result.usage,
      })
    }

  } catch (error) {
    console.error('Chat API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to fetch conversation history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')
    const agentName = searchParams.get('agentName')

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (conversationId) {
      // Get specific conversation with messages
      const { data: conversation, error: convError } = await supabase
        .from('ai_conversations')
        .select(`
          *,
          ai_agents (name, display_name, accent_color),
          ai_messages (*)
        `)
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single()

      if (convError) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
      }

      return NextResponse.json({ conversation })
    } else if (agentName) {
      // Get all conversations for a specific agent
      const { data: agent } = await supabase
        .from('ai_agents')
        .select('id')
        .eq('name', agentName)
        .single()

      if (!agent) {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
      }

      const { data: conversations, error: convsError } = await supabase
        .from('ai_conversations')
        .select(`
          *,
          ai_agents (name, display_name, accent_color)
        `)
        .eq('agent_id', agent.id)
        .eq('user_id', user.id)
        .order('last_message_at', { ascending: false })
        .limit(20)

      if (convsError) {
        return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
      }

      return NextResponse.json({ conversations })
    } else {
      // Get all user conversations
      const { data: conversations, error: convsError } = await supabase
        .from('ai_conversations')
        .select(`
          *,
          ai_agents (name, display_name, accent_color)
        `)
        .eq('user_id', user.id)
        .order('last_message_at', { ascending: false })
        .limit(50)

      if (convsError) {
        return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
      }

      return NextResponse.json({ conversations })
    }

  } catch (error) {
    console.error('Chat GET API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
