export interface User {
  _id: string;
  name: string;
  email: string;
  bio: string;
  profilePhoto: string;
  homeCity: string;
  interests: Interest[];
  travelStyle: TravelStyle;
  squads: Squad[] | string[];
  createdAt: string;
}

export type Interest =
  | 'adventure' | 'beaches' | 'culture' | 'food' | 'hiking'
  | 'history' | 'luxury' | 'nature' | 'nightlife' | 'photography'
  | 'road-trips' | 'skiing' | 'solo-travel' | 'spirituality' | 'wildlife';

export type TravelStyle = 'budget' | 'mid-range' | 'luxury' | 'backpacker';

export type TripStatus = 'planning' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled';

export interface Budget {
  min: number;
  max: number;
  currency: string;
}

export interface Trip {
  _id: string;
  creator: User;
  destination: string;
  startDate: string;
  endDate: string;
  budget: Budget;
  budgetLevel: TravelStyle;
  interests: Interest[];
  description: string;
  coverImage: string;
  squad: Squad | null;
  isPublic: boolean;
  status: TripStatus;
  maxGroupSize: number;
  matchScore?: number;
  createdAt: string;
}

export type SquadStatus = 'forming' | 'confirmed' | 'ongoing' | 'completed';

export interface ItineraryItem {
  _id: string;
  day: number;
  date?: string;
  activity: string;
  location?: string;
  notes?: string;
  time?: string;
  addedBy: Pick<User, '_id' | 'name' | 'profilePhoto'>;
}

export interface JoinRequest {
  _id: string;
  user: Pick<User, '_id' | 'name' | 'profilePhoto' | 'homeCity'>;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
}

export interface Squad {
  _id: string;
  name: string;
  destination: string;
  description: string;
  coverImage: string;
  creator: User;
  members: User[];
  maxMembers: number;
  trip: Trip | null;
  itinerary: ItineraryItem[];
  joinRequests: JoinRequest[];
  isPrivate: boolean;
  status: SquadStatus;
  chatRoom: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  squad: string;
  sender: Pick<User, '_id' | 'name' | 'profilePhoto'>;
  content: string;
  type: 'text' | 'system' | 'itinerary-update';
  createdAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  errors?: { field: string; message: string }[];
}
