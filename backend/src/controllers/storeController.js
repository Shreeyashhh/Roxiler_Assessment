const prisma = require('../prisma');
const { sendSuccess, sendError } = require('../utils/response');
const { validateStoreInput } = require('../utils/validators');

/**
 * Get all stores with search (name/address), sorting, pagination, overall average rating, and user's rating.
 */
const getStores = async (req, res, next) => {
  try {
    const {
      search = '',
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      limit = 10
    } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const allowedSortFields = ['name', 'email', 'address', 'createdAt'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'name';
    const safeSortOrder = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const where = {};
    if (search && search.trim() !== '') {
      const searchTerm = search.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { address: { contains: searchTerm, mode: 'insensitive' } }
      ];
    }

    const [totalStores, rawStores] = await Promise.all([
      prisma.store.count({ where }),
      prisma.store.findMany({
        where,
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
              userId: true
            }
          }
        },
        orderBy: {
          [safeSortBy]: safeSortOrder
        },
        skip,
        take: limitNum
      })
    ]);

    const currentUserId = req.user?.userId;

    // Process calculated overall rating and myRating
    const stores = rawStores.map((store) => {
      const ratings = store.ratings || [];
      const totalRatingsCount = ratings.length;
      const sumRatings = ratings.reduce((acc, curr) => acc + curr.rating, 0);
      const overallRating = totalRatingsCount > 0
        ? Number((sumRatings / totalRatingsCount).toFixed(2))
        : 0;

      let myRating = null;
      let myRatingId = null;
      if (currentUserId) {
        const userRatingObj = ratings.find((r) => r.userId === currentUserId);
        if (userRatingObj) {
          myRating = userRatingObj.rating;
          myRatingId = userRatingObj.id;
        }
      }

      const { ratings: _, ...storeData } = store;

      return {
        ...storeData,
        overallRating,
        totalRatingsCount,
        myRating,
        myRatingId
      };
    });

    // If client requested sort by rating, sort processed list
    if (sortBy === 'rating') {
      stores.sort((a, b) => {
        return safeSortOrder === 'asc'
          ? a.overallRating - b.overallRating
          : b.overallRating - a.overallRating;
      });
    }

    return sendSuccess(res, 'Stores retrieved successfully.', {
      stores,
      pagination: {
        total: totalStores,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalStores / limitNum)
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a Store (Admin)
 * Accessible by: SYSTEM_ADMIN
 */
const createStore = async (req, res, next) => {
  try {
    const { name, email, address, ownerId } = req.body;

    const validation = validateStoreInput({ name, email, address, ownerId });
    if (!validation.isValid) {
      return sendError(res, 'Validation error', validation.errors, 422);
    }

    const parsedOwnerId = parseInt(ownerId);

    // Verify owner exists and has role STORE_OWNER
    const owner = await prisma.user.findUnique({
      where: { id: parsedOwnerId }
    });

    if (!owner) {
      return sendError(res, 'Specified Store Owner was not found.', [], 404);
    }

    if (owner.role !== 'STORE_OWNER') {
      return sendError(res, 'Specified user is not assigned the STORE_OWNER role.', [], 400);
    }

    // Check email uniqueness for store
    const existingStore = await prisma.store.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingStore) {
      return sendError(res, 'A store with this email address already exists.', [], 409);
    }

    const newStore = await prisma.store.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        address: address.trim(),
        ownerId: parsedOwnerId
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return sendSuccess(res, 'Store created successfully.', { store: newStore }, 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Get store details by ID
 */
const getStoreById = async (req, res, next) => {
  try {
    const storeId = parseInt(req.params.id);

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true
          }
        },
        ratings: {
          select: {
            id: true,
            rating: true,
            userId: true,
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
      }
    });

    if (!store) {
      return sendError(res, 'Store not found.', [], 404);
    }

    const totalRatingsCount = store.ratings.length;
    const sumRatings = store.ratings.reduce((acc, curr) => acc + curr.rating, 0);
    const overallRating = totalRatingsCount > 0
      ? Number((sumRatings / totalRatingsCount).toFixed(2))
      : 0;

    const currentUserId = req.user?.userId;
    let myRatingObj = null;
    if (currentUserId) {
      myRatingObj = store.ratings.find((r) => r.userId === currentUserId) || null;
    }

    return sendSuccess(res, 'Store details retrieved successfully.', {
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        owner: store.owner,
        overallRating,
        totalRatingsCount,
        myRating: myRatingObj ? myRatingObj.rating : null,
        myRatingId: myRatingObj ? myRatingObj.id : null,
        createdAt: store.createdAt,
        updatedAt: store.updatedAt
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update store details (Admin)
 * Accessible by: SYSTEM_ADMIN
 */
const updateStore = async (req, res, next) => {
  try {
    const storeId = parseInt(req.params.id);
    const { name, email, address, ownerId } = req.body;

    const existingStore = await prisma.store.findUnique({ where: { id: storeId } });
    if (!existingStore) {
      return sendError(res, 'Store not found.', [], 404);
    }

    const updateData = {};

    if (name) updateData.name = name.trim();
    if (address) updateData.address = address.trim();

    if (email && email.toLowerCase().trim() !== existingStore.email) {
      const emailTaken = await prisma.store.findUnique({
        where: { email: email.toLowerCase().trim() }
      });
      if (emailTaken) {
        return sendError(res, 'Store email address is already in use.', [], 409);
      }
      updateData.email = email.toLowerCase().trim();
    }

    if (ownerId) {
      const parsedOwnerId = parseInt(ownerId);
      const owner = await prisma.user.findUnique({ where: { id: parsedOwnerId } });
      if (!owner || owner.role !== 'STORE_OWNER') {
        return sendError(res, 'Invalid Store Owner ID.', [], 400);
      }
      updateData.ownerId = parsedOwnerId;
    }

    const updatedStore = await prisma.store.update({
      where: { id: storeId },
      data: updateData,
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return sendSuccess(res, 'Store updated successfully.', { store: updatedStore });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a store (Admin)
 * Accessible by: SYSTEM_ADMIN
 */
const deleteStore = async (req, res, next) => {
  try {
    const storeId = parseInt(req.params.id);

    const existingStore = await prisma.store.findUnique({ where: { id: storeId } });
    if (!existingStore) {
      return sendError(res, 'Store not found.', [], 404);
    }

    await prisma.store.delete({ where: { id: storeId } });

    return sendSuccess(res, 'Store deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getStores,
  createStore,
  getStoreById,
  updateStore,
  deleteStore
};
