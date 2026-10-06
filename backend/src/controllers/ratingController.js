const prisma = require('../prisma');
const { sendSuccess, sendError } = require('../utils/response');
const { validateRatingInput, validateRating } = require('../utils/validators');

/**
 * Submit a new Store Rating (Normal User)
 * Accessible by: NORMAL_USER
 */
const submitRating = async (req, res, next) => {
  try {
    const { storeId, rating } = req.body;
    const userId = req.user.userId;

    const validation = validateRatingInput({ storeId, rating });
    if (!validation.isValid) {
      return sendError(res, 'Validation error', validation.errors, 422);
    }

    const parsedStoreId = parseInt(storeId);
    const parsedRating = parseInt(rating);

    // Verify store exists
    const store = await prisma.store.findUnique({ where: { id: parsedStoreId } });
    if (!store) {
      return sendError(res, 'Store not found.', [], 404);
    }

    // Check if rating already exists for this (userId, storeId)
    const existingRating = await prisma.rating.findUnique({
      where: {
        userId_storeId: {
          userId,
          storeId: parsedStoreId
        }
      }
    });

    if (existingRating) {
      return sendError(
        res,
        'You have already submitted a rating for this store. Please update your existing rating instead.',
        [],
        409
      );
    }

    // Create rating
    const newRating = await prisma.rating.create({
      data: {
        userId,
        storeId: parsedStoreId,
        rating: parsedRating
      },
      include: {
        store: { select: { id: true, name: true } }
      }
    });

    return sendSuccess(res, 'Rating submitted successfully.', { rating: newRating }, 201);
  } catch (err) {
    if (err.code === 'P2002') {
      return sendError(
        res,
        'You have already submitted a rating for this store. Please update your existing rating instead.',
        [],
        409
      );
    }
    next(err);
  }
};

/**
 * Update an existing rating (Normal User)
 * Accessible by: NORMAL_USER
 */
const updateRating = async (req, res, next) => {
  try {
    const ratingId = parseInt(req.params.id);
    const { rating } = req.body;
    const userId = req.user.userId;

    if (!validateRating(rating)) {
      return sendError(res, 'Rating must be an integer between 1 and 5.', [], 422);
    }

    const existingRating = await prisma.rating.findUnique({ where: { id: ratingId } });
    if (!existingRating) {
      return sendError(res, 'Rating record not found.', [], 404);
    }

    // Authorization: User can only update their own rating
    if (existingRating.userId !== userId) {
      return sendError(res, 'Forbidden: You can only update your own rating.', [], 403);
    }

    const updatedRating = await prisma.rating.update({
      where: { id: ratingId },
      data: { rating: parseInt(rating) },
      include: {
        store: { select: { id: true, name: true } }
      }
    });

    return sendSuccess(res, 'Rating updated successfully.', { rating: updatedRating });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all ratings (Admin / Store Owner)
 */
const getRatings = async (req, res, next) => {
  try {
    const { storeId, page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    if (storeId) {
      where.storeId = parseInt(storeId);
    }

    // If Store Owner, filter ratings to their owned stores
    if (req.user.role === 'STORE_OWNER') {
      const ownedStores = await prisma.store.findMany({
        where: { ownerId: req.user.userId },
        select: { id: true }
      });
      const ownedStoreIds = ownedStores.map((s) => s.id);
      where.storeId = { in: ownedStoreIds };
    }

    const [totalRatings, ratings] = await Promise.all([
      prisma.rating.count({ where }),
      prisma.rating.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          store: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      })
    ]);

    return sendSuccess(res, 'Ratings retrieved successfully.', {
      ratings,
      pagination: {
        total: totalRatings,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalRatings / limitNum)
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  submitRating,
  updateRating,
  getRatings
};
