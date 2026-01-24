import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware/auth';
import { Document, UserPlan } from '@/lib/db/models';
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
        // Check for active subscription
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
      console.log('User not authenticated, showing public documents only');
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

    const documents = await Document.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    // Format documents and check access based on accessType and planIds
    const formattedDocuments = documents.rows.map(doc => {
      const accessType = doc.accessType || 'all';
      const planIds = doc.planIds || [];
      
      let canAccess = false;
      let isLocked = false;

      // Determine access based on accessType
      if (accessType === 'all') {
        canAccess = true;
        isLocked = false;
      } else if (accessType === 'subscribers_only') {
        canAccess = hasActiveSubscription;
        isLocked = !hasActiveSubscription;
      } else if (accessType === 'specific_plans') {
        if (hasActiveSubscription && userPlanId && planIds.includes(userPlanId)) {
          canAccess = true;
          isLocked = false;
        } else {
          canAccess = false;
          isLocked = true;
        }
      }

      const docData = {
        id: doc.id,
        title: doc.title,
        slug: doc.slug,
        description: doc.description,
        fileUrl: doc.fileUrl,
        fileSize: doc.fileSize,
        fileType: doc.fileType,
        thumbnail: doc.thumbnail,
        category: doc.category,
        downloads: doc.downloads || 0,
        views: doc.views || 0,
        tags: doc.tags || [],
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        requiresSubscription: doc.requiresSubscription || false,
        accessType: accessType,
        planIds: planIds,
        isLocked: isLocked,
        canAccess: canAccess
      };

      // Hide file URL if locked
      if (isLocked) {
        docData.fileUrl = null;
      }

      return docData;
    });

    return NextResponse.json(
      {
        success: true,
        documents: formattedDocuments,
        total: documents.count,
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
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}
