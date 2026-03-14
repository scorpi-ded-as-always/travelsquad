const Squad = require('../models/Squad');
const User = require('../models/User');
const Message = require('../models/Message');

class SquadService {
  async createSquad(userId, squadData) {
    const squad = await Squad.create({
      ...squadData,
      creator: userId,
      members: [userId],
    });

    // Add squad to user's squads array
    await User.findByIdAndUpdate(userId, { $addToSet: { squads: squad._id } });

    return squad.populate([
      { path: 'creator', select: 'name profilePhoto homeCity' },
      { path: 'members', select: 'name profilePhoto homeCity interests' },
    ]);
  }

  async getSquads({ destination, page = 1, limit = 12 }) {
    const query = { isPrivate: false };
    if (destination) {
      query.destination = { $regex: destination, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    const [squads, total] = await Promise.all([
      Squad.find(query)
        .populate('creator', 'name profilePhoto')
        .populate('members', 'name profilePhoto')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Squad.countDocuments(query),
    ]);

    return {
      squads,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getSquadById(squadId) {
    const squad = await Squad.findById(squadId)
      .populate('creator', 'name profilePhoto homeCity bio')
      .populate('members', 'name profilePhoto homeCity interests travelStyle bio')
      .populate('trip')
      .populate('itinerary.addedBy', 'name profilePhoto')
      .populate('joinRequests.user', 'name profilePhoto homeCity');

    if (!squad) {
      throw Object.assign(new Error('Squad not found'), { statusCode: 404 });
    }
    return squad;
  }

  async requestJoin(squadId, userId, message) {
    const squad = await Squad.findById(squadId);
    if (!squad) throw Object.assign(new Error('Squad not found'), { statusCode: 404 });

    if (squad.members.includes(userId)) {
      throw Object.assign(new Error('Already a member'), { statusCode: 400 });
    }

    const existing = squad.joinRequests.find(r =>
      r.user.toString() === userId.toString() && r.status === 'pending'
    );
    if (existing) {
      throw Object.assign(new Error('Join request already pending'), { statusCode: 400 });
    }

    if (squad.members.length >= squad.maxMembers) {
      throw Object.assign(new Error('Squad is full'), { statusCode: 400 });
    }

    squad.joinRequests.push({ user: userId, message });
    await squad.save();
    return squad;
  }

  async handleJoinRequest(squadId, requestId, action, adminId) {
    const squad = await Squad.findById(squadId);
    if (!squad) throw Object.assign(new Error('Squad not found'), { statusCode: 404 });

    if (squad.creator.toString() !== adminId.toString()) {
      throw Object.assign(new Error('Only squad creator can manage requests'), { statusCode: 403 });
    }

    const request = squad.joinRequests.id(requestId);
    if (!request) throw Object.assign(new Error('Request not found'), { statusCode: 404 });

    request.status = action; // 'approved' or 'rejected'

    if (action === 'approved') {
      if (squad.members.length >= squad.maxMembers) {
        throw Object.assign(new Error('Squad is full'), { statusCode: 400 });
      }
      squad.members.push(request.user);
      await User.findByIdAndUpdate(request.user, { $addToSet: { squads: squad._id } });
    }

    await squad.save();
    return squad;
  }

  async leaveSquad(squadId, userId) {
    const squad = await Squad.findById(squadId);
    if (!squad) throw Object.assign(new Error('Squad not found'), { statusCode: 404 });

    if (squad.creator.toString() === userId.toString()) {
      throw Object.assign(new Error('Creator cannot leave - delete the squad instead'), { statusCode: 400 });
    }

    squad.members = squad.members.filter(m => m.toString() !== userId.toString());
    await User.findByIdAndUpdate(userId, { $pull: { squads: squad._id } });
    await squad.save();
    return squad;
  }

  async addItineraryItem(squadId, userId, item) {
    const squad = await Squad.findById(squadId);
    if (!squad) throw Object.assign(new Error('Squad not found'), { statusCode: 404 });

    if (!squad.members.some(m => m.toString() === userId.toString())) {
      throw Object.assign(new Error('Only members can add to itinerary'), { statusCode: 403 });
    }

    squad.itinerary.push({ ...item, addedBy: userId });
    squad.itinerary.sort((a, b) => a.day - b.day);
    await squad.save();
    return squad;
  }

  async removeItineraryItem(squadId, itemId, userId) {
    const squad = await Squad.findById(squadId);
    if (!squad) throw Object.assign(new Error('Squad not found'), { statusCode: 404 });

    const item = squad.itinerary.id(itemId);
    if (!item) throw Object.assign(new Error('Item not found'), { statusCode: 404 });

    if (item.addedBy.toString() !== userId.toString() &&
        squad.creator.toString() !== userId.toString()) {
      throw Object.assign(new Error('Not authorized'), { statusCode: 403 });
    }

    item.deleteOne();
    await squad.save();
    return squad;
  }

  async getUserSquads(userId) {
    return Squad.find({ members: userId })
      .populate('creator', 'name profilePhoto')
      .populate('members', 'name profilePhoto')
      .sort({ updatedAt: -1 });
  }
}

module.exports = new SquadService();
