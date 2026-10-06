const prisma = require('../prisma');
const { sendSuccess } = require('../utils/response');

/**
 * Get Admin Dashboard Overview Statistics & Rating Details
 * Accessible by: SYSTEM_ADMIN
 */
const getAdminDashboard = async (req, res, next) => {
  try {
    const [totalUsers, totalStores, totalRatings, storeOwnerRatingsData] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count(),
      // Fetch store owners with their stores and aggregated rating info
      prisma.store.findMany({
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          ratings: {
            select: {
              id: true,
              rating: true,
              createdAt: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: { name: 'asc' }
      })
    ]);

    // Format Store Owner Rating Summary Table
    const storeOwnerSummaries = storeOwnerRatingsData.map((store) => {
      const ratings = store.ratings || [];
      const totalRatingsCount = ratings.length;
      const sumRatings = ratings.reduce((acc, curr) => acc + curr.rating, 0);
      const averageRating = totalRatingsCount > 0
        ? Number((sumRatings / totalRatingsCount).toFixed(2))
        : 0;

      return {
        storeId: store.id,
        storeName: store.name,
        storeEmail: store.email,
        storeAddress: store.address,
        ownerId: store.owner.id,
        ownerName: store.owner.name,
        ownerEmail: store.owner.email,
        averageRating,
        totalRatingsCount,
        ratingsDetail: ratings
      };
    });

    return sendSuccess(res, 'Admin dashboard statistics retrieved successfully.', {
      statistics: {
        totalUsers,
        totalStores,
        totalRatings
      },
      storeOwnerSummaries
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAdminDashboard
};
