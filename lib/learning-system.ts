import { logger, logInfo, logWarn, logError } from '@/lib/logger'
import { getDb } from '@/lib/database-client'
import { userLearningProgress } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

export interface LearningModule {
  id: string
  title: string
  description: string
  duration_minutes: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: string
  skills_covered: string[]
  prerequisites: string[]
  completion_rate: number
  rating: number
  content_type: 'video' | 'article' | 'interactive' | 'quiz'
  estimated_impact: number
}

export interface Skill {
  id: string
  name: string
  description: string
  category: string
  level: number
  experience_points: number
  target_level?: number
}

export interface UserLearningProfile {
  userId: string
  currentSkills: Skill[]
  learningGoals: string[]
  preferredLearningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
  availableTimePerWeek: number // minutes
  experienceLevel: 'beginner' | 'intermediate' | 'advanced'
  interests: string[]
  completedModules: string[]
  inProgressModules: Array<{
    moduleId: string
    progress: number
    startedAt: string
  }>
}

export interface LearningRecommendation {
  moduleId: string
  priority: 'high' | 'medium' | 'low'
  reason: string
  estimatedImpact: number
  prerequisitesMet: boolean
  estimatedCompletionTime: number
  confidence: number
}

export interface SkillGapAnalysis {
  skill: Skill
  currentLevel: number
  targetLevel: number
  gapScore: number
  priority: 'high' | 'medium' | 'low'
  recommendedModules: LearningModule[]
  estimatedTimeToClose: number
}

export class PersonalizedLearningSystem {
  private static instance: PersonalizedLearningSystem
  private learningModules: LearningModule[] = []
  private skillCategories: string[] = []

  private constructor() {
    this.initializeLearningSystem()
  }

  static getInstance(): PersonalizedLearningSystem {
    if (!PersonalizedLearningSystem.instance) {
      PersonalizedLearningSystem.instance = new PersonalizedLearningSystem()
    }
    return PersonalizedLearningSystem.instance
  }

  private initializeLearningSystem() {
    this.skillCategories = [
      'Business Strategy',
      'Marketing & Sales',
      'Financial Management',
      'Leadership & Team Building',
      'Technical Skills',
      'Soft Skills',
      'Product Development',
      'Customer Service',
      'Operations Management',
      'Personal Development'
    ]

    this.learningModules = [
      {
        id: 'mod1',
        title: 'Introduction to Business Analytics',
        description: 'Learn the fundamentals of data analysis for business decisions',
        duration_minutes: 45,
        difficulty: 'intermediate',
        category: 'Technical Skills',
        skills_covered: ['Data Analytics', 'Business Intelligence'],
        prerequisites: [],
        completion_rate: 0,
        rating: 4.5,
        content_type: 'interactive',
        estimated_impact: 85
      },
      {
        id: 'mod2',
        title: 'Advanced Negotiation Techniques',
        description: 'Master complex negotiation scenarios and strategies',
        duration_minutes: 60,
        difficulty: 'advanced',
        category: 'Soft Skills',
        skills_covered: ['Negotiation', 'Communication'],
        prerequisites: ['Basic Negotiation'],
        completion_rate: 0,
        rating: 4.8,
        content_type: 'video',
        estimated_impact: 90
      },
      {
        id: 'mod3',
        title: 'Digital Marketing Fundamentals',
        description: 'Learn the basics of online marketing and social media',
        duration_minutes: 90,
        difficulty: 'beginner',
        category: 'Marketing & Sales',
        skills_covered: ['Digital Marketing', 'Social Media Marketing'],
        prerequisites: [],
        completion_rate: 0,
        rating: 4.2,
        content_type: 'interactive',
        estimated_impact: 75
      },
      {
        id: 'mod4',
        title: 'Financial Planning for Entrepreneurs',
        description: 'Essential financial planning and budgeting strategies',
        duration_minutes: 75,
        difficulty: 'intermediate',
        category: 'Financial Management',
        skills_covered: ['Financial Planning', 'Budgeting', 'Cash Flow'],
        prerequisites: [],
        completion_rate: 0,
        rating: 4.6,
        content_type: 'article',
        estimated_impact: 88
      },
      {
        id: 'mod5',
        title: 'Leadership Fundamentals',
        description: 'Core leadership principles and team management',
        duration_minutes: 50,
        difficulty: 'beginner',
        category: 'Leadership & Team Building',
        skills_covered: ['Leadership', 'Team Management'],
        prerequisites: [],
        completion_rate: 0,
        rating: 4.4,
        content_type: 'video',
        estimated_impact: 82
      }
    ]
  }

  async analyzeSkillGaps(userProfile: UserLearningProfile): Promise<SkillGapAnalysis[]> {
    logInfo(`Analyzing skill gaps for user: ${userProfile.userId}`)

    try {
      const skillGaps: SkillGapAnalysis[] = []

      // Analyze each skill in the user's profile
      for (const skill of userProfile.currentSkills) {
        const targetLevel = skill.target_level || 5 // Default target level
        const currentLevel = skill.level
        const gapScore = Math.max(0, (targetLevel - currentLevel) / targetLevel) * 100

        if (gapScore > 10) { // Only include significant gaps
          const recommendedModules = this.findRecommendedModules(skill, userProfile)

          skillGaps.push({
            skill,
            currentLevel,
            targetLevel,
            gapScore,
            priority: this.determinePriority(gapScore, skill.category),
            recommendedModules,
            estimatedTimeToClose: this.estimateTimeToCloseGap(gapScore, recommendedModules)
          })
        }
      }

      // Sort by priority and gap score
      skillGaps.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        }
        return b.gapScore - a.gapScore
      })

      logInfo(`Found ${skillGaps.length} skill gaps for user: ${userProfile.userId}`)
      return skillGaps
    } catch (error) {
      logError('Error analyzing skill gaps:', error)
      throw error
    }
  }

  async generateLearningRecommendations(userProfile: UserLearningProfile): Promise<LearningRecommendation[]> {
    logInfo(`Generating learning recommendations for user: ${userProfile.userId}`)

    try {
      const recommendations: LearningRecommendation[] = []
      const availableModules = this.getAvailableModules(userProfile)

      for (const learningModule of availableModules) {
        const prerequisitesMet = this.checkPrerequisites(learningModule, userProfile)
        const estimatedImpact = this.calculateEstimatedImpact(learningModule, userProfile)
        const confidence = this.calculateRecommendationConfidence(learningModule, userProfile)

        if (confidence > 0.6) { // Only recommend modules with high confidence
          recommendations.push({
            moduleId: learningModule.id,
            priority: this.determineRecommendationPriority(estimatedImpact, confidence),
            reason: this.generateRecommendationReason(learningModule, userProfile),
            estimatedImpact,
            prerequisitesMet,
            estimatedCompletionTime: learningModule.duration_minutes,
            confidence
          })
        }
      }

      // Sort by priority and confidence
      recommendations.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        }
        return b.confidence - a.confidence
      })

      logInfo(`Generated ${recommendations.length} learning recommendations for user: ${userProfile.userId}`)
      return recommendations.slice(0, 10) // Return top 10 recommendations
    } catch (error) {
      logError('Error generating learning recommendations:', error)
      throw error
    }
  }

  async createPersonalizedLearningPath(userProfile: UserLearningProfile): Promise<{
    path: LearningModule[]
    estimatedDuration: number
    milestones: Array<{ moduleId: string; description: string }>
  }> {
    logInfo(`Creating personalized learning path for user: ${userProfile.userId}`)

    try {
      const skillGaps = await this.analyzeSkillGaps(userProfile)
      const recommendations = await this.generateLearningRecommendations(userProfile)

      const path: LearningModule[] = []
      const milestones: Array<{ moduleId: string; description: string }> = []
      let estimatedDuration = 0

      // Start with high-priority skill gaps
      const highPriorityGaps = skillGaps.filter(gap => gap.priority === 'high')

      for (const gap of highPriorityGaps.slice(0, 3)) { // Focus on top 3 high-priority gaps
        for (const learningModule of gap.recommendedModules.slice(0, 2)) { // Take top 2 modules per gap
          if (!path.find(m => m.id === learningModule.id)) {
            path.push(learningModule)
            milestones.push({
              moduleId: learningModule.id,
              description: `Complete ${learningModule.title} to improve ${gap.skill.name}`
            })
            estimatedDuration += learningModule.duration_minutes
          }
        }
      }

      // Add high-priority recommendations
      const highPriorityRecommendations = recommendations.filter(rec => rec.priority === 'high')

      for (const rec of highPriorityRecommendations.slice(0, 2)) {
        const learningModule = this.learningModules.find(m => m.id === rec.moduleId)
        if (learningModule && !path.find(m => m.id === learningModule.id)) {
          path.push(learningModule)
          milestones.push({
            moduleId: learningModule.id,
            description: rec.reason
          })
          estimatedDuration += learningModule.duration_minutes
        }
      }

      // Ensure path fits within user's available time
      const weeklyTimeLimit = userProfile.availableTimePerWeek
      const maxDuration = weeklyTimeLimit * 8 // 8 weeks maximum

      if (estimatedDuration > maxDuration) {
        path.splice(Math.floor(path.length * 0.7)) // Keep 70% of modules
        estimatedDuration = path.reduce((sum, module) => sum + module.duration_minutes, 0)
      }

      logInfo(`Created learning path with ${path.length} modules for user: ${userProfile.userId}`)
      return { path, estimatedDuration, milestones }
    } catch (error) {
      logError('Error creating personalized learning path:', error)
      throw error
    }
  }

  async trackLearningProgress(userId: string, moduleId: string, progress: number): Promise<void> {
    logInfo(`Tracking learning progress for user: ${userId}, module: ${moduleId}, progress: ${progress}%`)

    try {
      const db = getDb()

      // Check if progress record exists
      const existingProgress = await db
        .select()
        .from(userLearningProgress)
        .where(
          and(
            eq(userLearningProgress.user_id, userId),
            eq(userLearningProgress.module_id, moduleId)
          )
        )
        .limit(1)

      const status = progress >= 100 ? 'completed' : 'in_progress'
      const now = new Date()

      if (existingProgress.length > 0) {
        // Update existing record
        await db
          .update(userLearningProgress)
          .set({
            progress,
            status,
            last_updated: now,
            completed_at: progress >= 100 ? now : existingProgress[0].completed_at
          })
          .where(
            and(
              eq(userLearningProgress.user_id, userId),
              eq(userLearningProgress.module_id, moduleId)
            )
          )
      } else {
        // Create new record
        await db.insert(userLearningProgress).values({
          user_id: userId,
          module_id: moduleId,
          progress,
          status,
          started_at: now,
          last_updated: now,
          completed_at: progress >= 100 ? now : null
        })
      }

      // Update in-memory module stats (optional, but good for cache)
      const learningModule = this.learningModules.find(m => m.id === moduleId)
      if (learningModule) {
        // This is a global stat, so we probably shouldn't update it based on one user without aggregation
        // But for now we'll leave it as is or remove it if it's misleading
        // learningModule.completion_rate = progress // Removing this as it's misleading for global stats
      }

      // Log completion milestone
      if (progress >= 100) {
        logInfo(`Module completed: ${moduleId} by user: ${userId}`)
      }
    } catch (error) {
      logError('Error tracking learning progress:', error)
      throw error
    }
  }

  private findRecommendedModules(skill: Skill, userProfile: UserLearningProfile): LearningModule[] {
    return this.learningModules
      .filter(module => module.skills_covered.includes(skill.name))
      .filter(module => this.checkPrerequisites(module, userProfile))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3) // Top 3 recommendations
  }

  private getAvailableModules(userProfile: UserLearningProfile): LearningModule[] {
    return this.learningModules.filter(module => {
      // Filter out completed modules
      if (userProfile.completedModules.includes(module.id)) {
        return false
      }

      // Filter out modules currently in progress
      if (userProfile.inProgressModules.find(ip => ip.moduleId === module.id)) {
        return false
      }

      // Filter by difficulty based on user's experience level
      const difficultyMatch = this.matchesUserExperienceLevel(module.difficulty, userProfile.experienceLevel)

      return difficultyMatch
    })
  }

  private checkPrerequisites(module: LearningModule, userProfile: UserLearningProfile): boolean {
    if (module.prerequisites.length === 0) {
      return true
    }

    return module.prerequisites.every(prereq =>
      userProfile.completedModules.includes(prereq) ||
      userProfile.currentSkills.some(skill => skill.name === prereq && skill.level >= 3)
    )
  }

  private calculateEstimatedImpact(module: LearningModule, userProfile: UserLearningProfile): number {
    let impact = module.estimated_impact

    // Boost impact if module aligns with user's interests
    if (userProfile.interests.some(interest =>
      module.category.toLowerCase().includes(interest.toLowerCase())
    )) {
      impact *= 1.2
    }

    // Boost impact if module matches learning style
    if (this.matchesLearningStyle(module, userProfile.preferredLearningStyle)) {
      impact *= 1.1
    }

    return Math.min(impact, 100) // Cap at 100%
  }

  private calculateRecommendationConfidence(module: LearningModule, userProfile: UserLearningProfile): number {
    let confidence = 0.5 // Base confidence

    // Increase confidence based on module rating
    confidence += (module.rating - 3) * 0.1

    // Increase confidence if prerequisites are met
    if (this.checkPrerequisites(module, userProfile)) {
      confidence += 0.2
    }

    // Increase confidence if module matches user's goals
    if (userProfile.learningGoals.some(goal =>
      module.title.toLowerCase().includes(goal.toLowerCase()) ||
      module.skills_covered.some(skill => goal.toLowerCase().includes(skill.toLowerCase()))
    )) {
      confidence += 0.3
    }

    return Math.min(confidence, 1.0) // Cap at 100%
  }

  private determinePriority(gapScore: number, category: string): 'high' | 'medium' | 'low' {
    const criticalCategories = ['Financial Management', 'Business Strategy']

    if (gapScore > 70 || criticalCategories.includes(category)) {
      return 'high'
    } else if (gapScore > 40) {
      return 'medium'
    } else {
      return 'low'
    }
  }

  private determineRecommendationPriority(impact: number, confidence: number): 'high' | 'medium' | 'low' {
    const score = impact * confidence

    if (score > 75) {
      return 'high'
    } else if (score > 50) {
      return 'medium'
    } else {
      return 'low'
    }
  }

  private estimateTimeToCloseGap(gapScore: number, recommendedModules: LearningModule[]): number {
    const totalModuleTime = recommendedModules.reduce((sum, module) => sum + module.duration_minutes, 0)
    return Math.ceil((gapScore / 100) * totalModuleTime)
  }

  private matchesUserExperienceLevel(moduleDifficulty: string, userExperience: string): boolean {
    const difficultyLevels = { beginner: 1, intermediate: 2, advanced: 3 }
    const userLevel = difficultyLevels[userExperience as keyof typeof difficultyLevels] || 2
    const moduleLevel = difficultyLevels[moduleDifficulty as keyof typeof difficultyLevels] || 2

    // Allow users to access modules at their level or one level above
    return moduleLevel <= userLevel + 1
  }

  private matchesLearningStyle(module: LearningModule, preferredStyle: string): boolean {
    const styleMapping = {
      visual: ['video', 'interactive'],
      auditory: ['video'],
      kinesthetic: ['interactive'],
      reading: ['article']
    }

    const compatibleTypes = styleMapping[preferredStyle as keyof typeof styleMapping] || []
    return compatibleTypes.includes(module.content_type)
  }

  private generateRecommendationReason(module: LearningModule, userProfile: UserLearningProfile): string {
    const reasons = [
      `Based on your business goals and current skill gaps`,
      `Will help improve your ${module.category.toLowerCase()} capabilities`,
      `Critical for your current business objectives`,
      `Matches your learning interests and style`,
      `High-rated module with proven results`
    ]

    // Find the most relevant reason
    if (userProfile.learningGoals.some(goal =>
      module.title.toLowerCase().includes(goal.toLowerCase())
    )) {
      return reasons[2] // Critical for objectives
    }

    if (userProfile.interests.some(interest =>
      module.category.toLowerCase().includes(interest.toLowerCase())
    )) {
      return reasons[3] // Matches interests
    }

    if (module.rating > 4.5) {
      return reasons[4] // High-rated module
    }

    return reasons[0] // Default reason
  }
}

export const learningSystem = PersonalizedLearningSystem.getInstance()
