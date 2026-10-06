const prisma = require('../prisma');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * Store Owner Dashboard Data
 * Accessible by: STORE_OWNER
 */
const getStoreOwnerDashboard = async (req, res, next) => {
  try {
    const ownerId = req.user.userId;

    // Fetch stores owned by this store owner
    const stores = await prisma.store.findMany({
      where: { ownerId },
      include: {
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (stores.length === 0) {
      return sendSuccess(res, 'Store owner dashboard retrieved.', {
        stores: [],
        message: 'No stores currently assigned to this account.'
      });
    }

    const storesDashboard = stores.map((store) => {
      const ratings = store.ratings || [];
      const totalRatingsCount = ratings.length;
      const sumRatings = ratings.reduce((acc, curr) => acc + curr.rating, 0);
      const averageRating = totalRatingsCount > 0
        ? Number((sumRatings / totalRatingsCount).toFixed(2))
        : 0;

      const customerRatings = ratings.map((r) => ({
        ratingId: r.id,
        userName: r.user.name,
        userEmail: r.user.email,
        rating: r.rating,
        createdAt: r.createdAt
      }));

      return {
        storeId: store.id,
        storeName: store.name,
        storeEmail: store.email,
        storeAddress: store.address,
        averageRating,
        totalRatingsCount,
        ratings: customerRatings
      };
    });

    return sendSuccess(res, 'Store owner dashboard retrieved successfully.', {
      stores: storesDashboard
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStoreOwnerDashboard
};
