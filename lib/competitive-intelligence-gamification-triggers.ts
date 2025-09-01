import { CompetitiveIntelligenceGamification } from './competitive-intelligence-gamification'
import { createClient } from '@/lib/db'

export class CompetitiveIntelligenceGamificationTriggers {
  /**
   * Trigger gamification when a competitor is added
   */
  static async onCompetitorAdded(userId: string, competitorId: number): Promise<void> {
    try {
      await this.triggerGamificationEvent(userId, 'competitor_added', 1)
      console.log(`Gamification triggered: competitor_added for user ${userId}`)
    } catch (error) {
      console.error('Error triggering competitor added gamification:', error)
    }
  }

  /**
   * Trigger gamification when intelligence is gathered
   */
  static async onIntelligenceGathered(userId: string, intelligenceCount: number = 1): Promise<void> {
    try {
      await this.triggerGamificationEvent(userId, 'intelligence_gathered', intelligenceCount)
      console.log(`Gamification triggered: intelligence_gathered (${intelligenceCount}) for user ${userId}`)
    } catch (error) {
      console.error('Error triggering intelligence gathered gamification:', error)
    }
  }

  /**
   * Trigger gamification when an alert is processed
   */
  static async onAlertProcessed(userId: string, alertId: number): Promise<void> {
    try {
      await this.triggerGamificationEvent(userId, 'alert_processed', 1)
      
      // Check if this was a high-priority alert for bonus points
      const client = await createClient()
      const { rows: alertRows } = await client.query(
        'SELECT severity FROM competitor_alerts WHERE id = $1 AND user_id = $2',
        [alertId, userId]
      )
      
      if (alertRows.length > 0 && (alertRows[0].severity === 'urgent' || alertRows[0].severity === 'critical')) {
        // Bonus points for processing urgent/critical alerts
        await this.triggerGamificationEvent(userId, 'threat_response', 1)
      }
      
      console.log(`Gamification triggered: alert_processed for user ${userId}`)
    } catch (error) {
      console.error('Error triggering alert processed gamification:', error)
    }
  }

  /**
   * Trigger gamification when an opportunity is identified
   */
  static async onOpportunityIdentified(userId: string, opportunityId: string): Promise<void> {
    try {
      await this.triggerGamificationEvent(userId, 'opportunity_identified', 1)
      console.log(`Gamification triggered: opportunity_identified for user ${userId}`)
    } catch (error) {
      console.error('Error triggering opportunity identified gamification:', error)
    }
  }

  /**
   * Trigger gamification when a competitive task is completed
   */
  static async onCompetitiveTaskCompleted(userId: string, taskId: number): Promise<void> {
    try {
      await this.triggerGamificationEvent(userId, 'competitive_task_completed', 1)
      
      // Check if this was a high-priority task for bonus points
      const client = await createClient()
      const { rows: taskRows } = await client.query(
        'SELECT priority FROM tasks WHERE id = $1 AND user_id = $2',
        [taskId, userId]
      )
      
      if (taskRows.length > 0 && (taskRows[0].priority === 'high' || taskRows[0].priority === 'critical')) {
        // Bonus points for completing high-priority competitive tasks
        await this.awardBonusPoints(userId, 25, 'High-priority competitive task completion')
      }
      
      console.log(`Gamification triggered: competitive_task_completed for user ${userId}`)
    } catch (error) {
      console.error('Error triggering competitive task completed gamification:', error)
    }
  }

  /**
   * Trigger gamification for intelligence gathering streaks
   */
  static async onIntelligenceStreak(userId: string, streakDays: number): Promise<void> {
    try {
      await this.triggerGamificationEvent(userId, 'intelligence_streak', streakDays)
      console.log(`Gamification triggered: intelligence_streak (${streakDays} days) for user ${userId}`)
    } catch (error) {
      console.error('Error triggering intelligence streak gamification:', error)
    }
  }

  /**
   * Trigger gamification for competitive victories
   */
  static async onCompetitiveVictory(
    userId: string, 
    victoryData: {
      title: string
      description: string
      competitor_name: string
      victory_type: 'market_share_gain' | 'pricing_advantage' | 'product_superiority' | 'talent_acquisition' | 'crisis_response'
      impact_level: 'minor' | 'moderate' | 'major' | 'game_changing'
      evidence: string[]
    }
  ): Promise<void> {
    try {
      // Calculate points based on impact level
      const impactPoints = {
        minor: 50,
        moderate: 100,
        major: 250,
        game_changing: 500
      }
      
      const points = impactPoints[victoryData.impact_level]
      
      // Trigger victory gamification with victory data
      await this.triggerGamificationEvent(userId, 'competitive_victory', 1, {
        ...victoryData,
        points_awarded: points
      })
      
      console.log(`Gamification triggered: competitive_victory (${victoryData.impact_level}) for user ${userId}`)
    } catch (error) {
      console.error('Error triggering competitive victory gamification:', error)
    }
  }

  /**
   * Check and update intelligence gathering streaks
   */
  static async checkIntelligenceStreaks(userId: string): Promise<void> {
    try {
      const client = await createClient()
      
      // Get intelligence gathering activity for the last 30 days
      const { rows: activityRows } = await client.query(
        `SELECT DATE(collected_at) as activity_date, COUNT(*) as intelligence_count
         FROM intelligence_data 
         WHERE user_id = $1 
         AND collected_at > NOW() - INTERVAL '30 days'
         GROUP BY DATE(collected_at)
         ORDER BY activity_date DESC`,
        [userId]
      )
      
      // Calculate current streak
      let currentStreak = 0
      const today = new Date()
      
      for (let i = 0; i < activityRows.length; i++) {
        const activityDate = new Date(activityRows[i].activity_date)
        const daysDiff = Math.floor((today.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysDiff === i) {
          currentStreak++
        } else {
          break
        }
      }
      
      // Update streak in competitive stats
      await client.query(
        'UPDATE user_competitive_stats SET intelligence_streaks = $1 WHERE user_id = $2',
        [currentStreak, userId]
      )
      
      // Trigger streak achievements if applicable
      if (currentStreak >= 7) {
        await this.onIntelligenceStreak(userId, currentStreak)
      }
    } catch (error) {
      console.error('Error checking intelligence streaks:', error)
    }
  }

  /**
   * Award bonus points for exceptional competitive intelligence activities
   */
  static async awardBonusPoints(userId: string, points: number, reason: string): Promise<void> {
    try {
      const client = await createClient()
      
      // Update competitive advantage points
      await client.query(
        'UPDATE user_competitive_stats SET competitive_advantage_points = competitive_advantage_points + $1 WHERE user_id = $2',
        [points, userId]
      )
      
      // Update user total points
      await client.query(
        'UPDATE users SET total_points = total_points + $1 WHERE id = $2',
        [points, userId]
      )
      
      console.log(`Bonus points awarded: ${points} points to user ${userId} for ${reason}`)
    } catch (error) {
      console.error('Error awarding bonus points:', error)
    }
  }

  /**
   * Generate team-based competitive intelligence challenges
   */
  static async generateTeamChallenge(userIds: string[]): Promise<string> {
    try {
      const client = await createClient()
      
      const challengeId = `team_challenge_${Date.now()}`
      const challengeData = {
        title: "Team Intelligence Domination",
        description: "Work together to gather competitive intelligence and dominate the market",
        objectives: [
          { task: "Collectively monitor 20 competitors", points: 200, completed: false },
          { task: "Process 100 competitive alerts as a team", points: 300, completed: false },
          { task: "Identify 15 market opportunities together", points: 250, completed: false },
          { task: "Achieve 5 competitive victories as a team", points: 500, completed: false }
        ],
        total_points: 1250,
        expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
      }
      
      // Create challenge for each team member
      for (const userId of userIds) {
        await client.query(
          `INSERT INTO competitive_challenges (
            id, user_id, title, description, objectives, total_points, expires_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            `${challengeId}_${userId}`,
            userId,
            challengeData.title,
            challengeData.description,
            JSON.stringify(challengeData.objectives),
            challengeData.total_points,
            challengeData.expires_at
          ]
        )
      }
      
      return challengeId
    } catch (error) {
      console.error('Error generating team challenge:', error)
      throw error
    }
  }

  /**
   * Update competitive intelligence leaderboards
   */
  static async updateLeaderboards(): Promise<void> {
    try {
      const client = await createClient()
      
      // Update global competitive intelligence leaderboard
      await client.query(`
        INSERT INTO competitive_leaderboard (
          user_id, competitive_advantage_points, market_victories, intelligence_gathered, last_updated
        )
        SELECT 
          ucs.user_id,
          ucs.competitive_advantage_points,
          ucs.market_victories,
          ucs.intelligence_gathered,
          NOW()
        FROM user_competitive_stats ucs
        ON CONFLICT (user_id) DO UPDATE SET
          competitive_advantage_points = EXCLUDED.competitive_advantage_points,
          market_victories = EXCLUDED.market_victories,
          intelligence_gathered = EXCLUDED.intelligence_gathered,
          last_updated = NOW()
      `)
      
      // Update rankings
      await client.query(`
        WITH ranked_users AS (
          SELECT 
            user_id,
            ROW_NUMBER() OVER (ORDER BY competitive_advantage_points DESC, market_victories DESC) as new_rank,
            PERCENT_RANK() OVER (ORDER BY competitive_advantage_points DESC) * 100 as new_percentile
          FROM competitive_leaderboard
        )
        UPDATE competitive_leaderboard cl
        SET 
          rank_position = ru.new_rank,
          percentile = ROUND(ru.new_percentile::numeric, 2)
        FROM ranked_users ru
        WHERE cl.user_id = ru.user_id
      `)
      
      console.log('Competitive intelligence leaderboards updated')
    } catch (error) {
      console.error('Error updating leaderboards:', error)
    }
  }

  /**
   * Core method to trigger gamification events
   */
  private static async triggerGamificationEvent(
    userId: string, 
    activityType: string, 
    value: number,
    additionalData?: any
  ): Promise<void> {
    try {
      // Make API call to gamification endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/competitive-intelligence/gamification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}` // For internal API calls
        },
        body: JSON.stringify({
          activity_type: activityType,
          value,
          victory_data: additionalData
        })
      })
      
      if (!response.ok) {
        console.error(`Failed to trigger gamification for ${activityType}:`, await response.text())
      }
    } catch (error) {
      console.error(`Error triggering gamification for ${activityType}:`, error)
      
      // Fallback: Direct database update for critical stats
      try {
        const client = await createClient()
        const statUpdates = this.getStatUpdates(activityType, value)
        
        if (Object.keys(statUpdates).length > 0) {
          const updateQuery = `
            UPDATE user_competitive_stats SET 
            ${Object.keys(statUpdates).map((key, index) => `${key} = ${key} + $${index + 2}`).join(', ')},
            updated_at = NOW()
            WHERE user_id = $1
          `
          await client.query(updateQuery, [userId, ...Object.values(statUpdates)])
        }
      } catch (fallbackError) {
        console.error('Fallback gamification update failed:', fallbackError)
      }
    }
  }

  /**
   * Get stat updates for direct database fallback
   */
  private static getStatUpdates(activityType: string, value: number): Record<string, number> {
    const updates: Record<string, number> = {}
    
    switch (activityType) {
      case 'competitor_added':
        updates.competitors_monitored = value
        break
      case 'intelligence_gathered':
        updates.intelligence_gathered = value
        break
      case 'alert_processed':
        updates.alerts_processed = value
        break
      case 'opportunity_identified':
        updates.opportunities_identified = value
        break
      case 'competitive_task_completed':
        updates.competitive_tasks_completed = value
        break
      case 'threat_response':
        updates.threat_responses = value
        break
      case 'competitive_victory':
        updates.market_victories = value
        break
    }
    
    return updates
  }
}