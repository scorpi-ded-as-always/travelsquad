const Trip = require('../models/Trip');
const User = require('../models/User');

class TripService {
  async createTrip(userId, tripData) {
    const trip = await Trip.create({ ...tripData, creator: userId });
    return trip.populate('creator', 'name profilePhoto homeCity');
  }

  async getTrips({ destination, page = 1, limit = 12, status }) {
    const query = { isPublic: true };
    if (destination) {
      query.destination = { $regex: destination, $options: 'i' };
    }
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const [trips, total] = await Promise.all([
      Trip.find(query)
        .populate('creator', 'name profilePhoto homeCity interests travelStyle')
        .populate('squad', 'name members')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Trip.countDocuments(query),
    ]);

    return {
      trips,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTripById(tripId) {
    const trip = await Trip.findById(tripId)
      .populate('creator', 'name profilePhoto homeCity bio interests travelStyle')
      .populate('squad');

    if (!trip) {
      throw Object.assign(new Error('Trip not found'), { statusCode: 404 });
    }
    return trip;
  }

  async getUserTrips(userId) {
    return Trip.find({ creator: userId })
      .populate('squad', 'name members')
      .sort({ startDate: 1 });
  }

  async updateTrip(tripId, userId, updates) {
    const trip = await Trip.findById(tripId);
    if (!trip) throw Object.assign(new Error('Trip not found'), { statusCode: 404 });
    if (trip.creator.toString() !== userId.toString()) {
      throw Object.assign(new Error('Not authorized'), { statusCode: 403 });
    }

    const allowedFields = ['destination', 'startDate', 'endDate', 'budget', 'budgetLevel', 'interests', 'description', 'maxGroupSize', 'isPublic', 'status', 'coverImage'];
    allowedFields.forEach(f => {
      if (updates[f] !== undefined) trip[f] = updates[f];
    });

    await trip.save();
    return trip;
  }

  async deleteTrip(tripId, userId) {
    const trip = await Trip.findById(tripId);
    if (!trip) throw Object.assign(new Error('Trip not found'), { statusCode: 404 });
    if (trip.creator.toString() !== userId.toString()) {
      throw Object.assign(new Error('Not authorized'), { statusCode: 403 });
    }
    await trip.deleteOne();
  }

  /**
   * Smart traveler matching algorithm
   * matchScore = destinationMatch * 40 + dateOverlap * 30 + interestSimilarity * 20 + budgetSimilarity * 10
   */
  async getMatches(userId) {
    // Get the user's most recent upcoming trip
    const userTrip = await Trip.findOne({
      creator: userId,
      startDate: { $gte: new Date() },
    }).sort({ startDate: 1 });

    if (!userTrip) {
      // Return interesting upcoming trips instead
      return Trip.find({
        creator: { $ne: userId },
        isPublic: true,
        startDate: { $gte: new Date() },
      })
        .populate('creator', 'name profilePhoto homeCity interests travelStyle bio')
        .sort({ startDate: 1 })
        .limit(5);
    }

    // Get other public trips (not by this user)
    const otherTrips = await Trip.find({
      creator: { $ne: userId },
      isPublic: true,
      startDate: { $gte: new Date() },
    }).populate('creator', 'name profilePhoto homeCity interests travelStyle bio');

    // Score each trip
    const scored = otherTrips.map(trip => {
      const score = this._calculateMatchScore(userTrip, trip);
      return { trip, score };
    });

    // Sort by score descending, return top 5
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(({ trip, score }) => ({ ...trip.toObject(), matchScore: Math.round(score) }));
  }

  _calculateMatchScore(userTrip, otherTrip) {
    let score = 0;

    // 1. Destination match (40 pts)
    const destinationMatch = userTrip.destination.toLowerCase().trim() === otherTrip.destination.toLowerCase().trim();
    if (destinationMatch) {
      score += 40;
    } else if (
      userTrip.destination.toLowerCase().includes(otherTrip.destination.toLowerCase()) ||
      otherTrip.destination.toLowerCase().includes(userTrip.destination.toLowerCase())
    ) {
      score += 20; // Partial match
    }

    // 2. Date overlap (30 pts)
    const overlapDays = this._dateDaysOverlap(
      userTrip.startDate, userTrip.endDate,
      otherTrip.startDate, otherTrip.endDate
    );
    const userTripDuration = Math.max(1, this._daysDiff(userTrip.startDate, userTrip.endDate));
    if (overlapDays > 0) {
      score += Math.min(30, (overlapDays / userTripDuration) * 30);
    }

    // 3. Interest similarity (20 pts)
    const userInterests = userTrip.interests || [];
    const otherInterests = otherTrip.interests || [];
    if (userInterests.length > 0 && otherInterests.length > 0) {
      const common = userInterests.filter(i => otherInterests.includes(i));
      const similarity = common.length / Math.max(userInterests.length, otherInterests.length);
      score += similarity * 20;
    }

    // 4. Budget similarity (10 pts)
    const budgetLevels = ['budget', 'backpacker', 'mid-range', 'luxury'];
    const userBudgetIdx = budgetLevels.indexOf(userTrip.budgetLevel);
    const otherBudgetIdx = budgetLevels.indexOf(otherTrip.budgetLevel);
    if (userBudgetIdx !== -1 && otherBudgetIdx !== -1) {
      const diff = Math.abs(userBudgetIdx - otherBudgetIdx);
      score += Math.max(0, 10 - diff * 4);
    } else {
      score += 5; // neutral
    }

    return score;
  }

  _dateDaysOverlap(start1, end1, start2, end2) {
    const overlapStart = new Date(Math.max(start1, start2));
    const overlapEnd = new Date(Math.min(end1, end2));
    const diff = overlapEnd - overlapStart;
    return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
  }

  _daysDiff(start, end) {
    return Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
  }
}

module.exports = new TripService();
