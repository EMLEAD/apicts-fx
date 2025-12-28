import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware/auth';
import { VlogPost, UserPlan } from '@/lib/db/models';
import { Op } from 'sequelize';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Check if user is authenticated and has active subscription
    let hasActiveSubscription = false;
    let userId = null;
    let userSubscription = null;
    let userPlanId = null;

    try {
      const auth = await authenticate(request);
      if (auth.authenticated) {
        userId = auth.user.id;
        // Check for active subscription - get the most recent active subscription
        userSubscription = await UserPlan.findOne({
          where: {
            userId: auth.user.id,
            status: 'active'
          },
          order: [['startedAt', 'DESC']]
        });
        hasActiveSubscription = !!userSubscription;
        userPlanId = userSubscription?.planId || null;
      }
    } catch (error) {
      // User is not authenticated, continue without subscription
      console.log('User not authenticated, showing public videos only');
    }

    const where = {
      status: 'published'
    };

    if (category && category !== 'all') {
      where.category = category;
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const videos = await VlogPost.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    // Format videos and check access based on accessType and planIds
    const formattedVideos = videos.rows.map(video => {
      const accessType = video.accessType || 'all';
      const planIds = video.planIds || [];
      
      let canAccess = false;
      let isLocked = false;

      // Determine access based on accessType
      if (accessType === 'all') {
        // Everyone can access
        canAccess = true;
        isLocked = false;
      } else if (accessType === 'subscribers_only') {
        // Any active subscription grants access
        canAccess = hasActiveSubscription;
        isLocked = !hasActiveSubscription;
      } else if (accessType === 'specific_plans') {
        // Only specific plan subscribers can access
        if (hasActiveSubscription && userPlanId && planIds.includes(userPlanId)) {
          canAccess = true;
          isLocked = false;
        } else {
          canAccess = false;
          isLocked = true;
        }
      }

      const videoData = {
        id: video.id,
        title: video.title,
        slug: video.slug,
        description: video.description,
        videoUrl: video.videoUrl,
        thumbnail: video.thumbnail,
        duration: video.duration,
        category: video.category,
        views: video.views || 0,
        likes: video.likes || 0,
        tags: video.tags || [],
        createdAt: video.createdAt,
        updatedAt: video.updatedAt,
        requiresSubscription: video.requiresSubscription || false,
        accessType: accessType,
        planIds: planIds,
        isLocked: isLocked,
        canAccess: canAccess
      };

      // Hide video URL if locked
      if (isLocked) {
        videoData.videoUrl = null;
      }

      return videoData;
    });

    return NextResponse.json(
      {
        success: true,
        videos: formattedVideos,
        total: videos.count,
        hasActiveSubscription,
        subscription: userSubscription ? {
          id: userSubscription.id,
          planId: userSubscription.planId,
          status: userSubscription.status,
          startedAt: userSubscription.startedAt,
          expiresAt: userSubscription.expiresAt
        } : null,
        limit,
        offset
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}

