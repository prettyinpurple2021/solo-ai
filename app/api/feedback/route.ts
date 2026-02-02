import { NextResponse } from 'next/server';
import { db } from '@/db';
import { feedback } from '@/db/schema';
import { auth } from '@/lib/auth';
import { feedbackSchema } from '@/lib/validations/feedback';
import { logger } from '@/lib/logger';
import { uploadFile } from '@/lib/file-storage';

export async function POST(req: Request) {
  try {
    const session = await auth();
    const formData = await req.formData();
    
    // Extract fields from FormData
    const rawType = formData.get('type') as any;
    const rawTitle = formData.get('title') as string || null;
    const rawMessage = formData.get('message') as string;
    const browserInfoStr = formData.get('browserInfo') as string;
    const screenshot = formData.get('screenshot') as File | null;

    let browserInfo = null;
    if (browserInfoStr) {
      try {
        browserInfo = JSON.parse(browserInfoStr);
      } catch (e) {
        logger.warn('Failed to parse browserInfo in feedback', { browserInfoStr });
      }
    }

    // Explicitly handle userId as nullable for anonymous feedback support
    const userId = session?.user?.id ?? null;

    // Validate request data
    const result = feedbackSchema.safeParse({
      type: rawType,
      title: rawTitle,
      message: rawMessage,
      browserInfo,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.format() },
        { status: 400 }
      );
    }

    const validatedData = result.data;

    // Handle screenshot upload if present
    let screenshotUrl = validatedData.screenshotUrl || null;
    if (screenshot) {
      try {
        // Use user ID or 'anonymous' for storage path
        const storageUserId = userId || 'anonymous';
        const uploadResult = await uploadFile(screenshot, screenshot.name, storageUserId);
        screenshotUrl = uploadResult.url;
      } catch (uploadError) {
        logger.error('Failed to upload feedback screenshot', { userId }, uploadError as Error);
        // We continue saving the feedback even if the screenshot fails
      }
    }

    // Save feedback to database
    const [newFeedback] = await db.insert(feedback).values({
      user_id: userId,
      type: validatedData.type,
      title: validatedData.title,
      message: validatedData.message,
      browser_info: validatedData.browserInfo,
      screenshot_url: screenshotUrl,
      priority: validatedData.priority,
      status: 'pending',
    }).returning();

    logger.info('Feedback submitted', {
      id: newFeedback.id,
      userId,
      type: validatedData.type,
    });

    return NextResponse.json({
      message: 'Feedback received with thanks.',
      id: newFeedback.id,
    }, { status: 201 });

  } catch (error) {
    if (error instanceof SyntaxError || (error as any).name === 'ZodError') {
      logger.warn('Client input error in feedback API', { error: (error as any).message });
      return NextResponse.json(
        { error: 'Invalid or malformed request' },
        { status: 400 }
      );
    }

    logger.error('Unexpected server error in feedback API', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
