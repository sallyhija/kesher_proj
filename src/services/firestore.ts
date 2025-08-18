import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp,
  writeBatch,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Types for our data models
export interface User {
  id?: string;
  email: string;
  name: string;
  role: 'employee' | 'manager';
  department?: string;
  position?: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Message {
  id?: string;
  senderId: string;
  senderName: string;
  recipientId?: string;
  recipientName?: string;
  subject: string;
  content: string;
  type: 'email' | 'message' | 'notification';
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Schedule {
  id?: string;
  userId: string;
  userName: string;
  date: Timestamp;
  startTime: string;
  endTime: string;
  shiftType: 'morning' | 'afternoon' | 'night';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Report {
  id?: string;
  title: string;
  description: string;
  type: 'performance' | 'attendance' | 'communication' | 'general';
  data: any;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// New: Shift change request model
export interface ShiftRequest {
  id?: string;
  requesterId: string;
  requesterName: string;
  originalScheduleId?: string; // optional link to a schedule
  original: {
    date?: Timestamp;
    startTime?: string;
    endTime?: string;
    shiftType?: 'morning' | 'afternoon' | 'night';
  };
  requestedChanges: {
    newDate?: Timestamp;
    newStartTime?: string;
    newEndTime?: string;
    newShiftType?: 'morning' | 'afternoon' | 'night';
    swapWithUserId?: string;
    swapWithUserName?: string;
  };
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  managerNote?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// New: Swap offer model
export interface SwapOffer {
  id?: string;
  employeeId: string;
  employeeName: string;
  employeeDepartment: string;
  employeeRating?: number;
  employeeCompletedSwaps?: number;
  currentShift: {
    scheduleId?: string;
    date: Timestamp;
    startTime: string;
    endTime: string;
    shiftType: 'morning' | 'afternoon' | 'night';
    location: string;
  };
  desiredShift: {
    date: Timestamp;
    startTime: string;
    endTime: string;
    shiftType: 'morning' | 'afternoon' | 'night';
    location: string;
  };
  reason: string;
  status: 'active' | 'pending' | 'completed' | 'expired' | 'cancelled';
  interestedParties?: string[]; // Array of user IDs who showed interest
  acceptedBy?: string; // User ID who accepted the swap
  acceptedAt?: Timestamp;
  managerApproved?: boolean;
  managerApprovedBy?: string;
  managerApprovedAt?: Timestamp;
  expiresAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// New: Shift template model
export interface ShiftTemplate {
  id?: string;
  name: string;
  shiftType: 'morning' | 'afternoon' | 'night';
  startTime: string;
  endTime: string;
  notes?: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Generic CRUD operations
export class FirestoreService<T> {
  private collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  // Get all documents
  async getAll(constraints: QueryConstraint[] = []): Promise<T[]> {
    try {
      const q = query(collection(db, this.collectionName), ...constraints);
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
    } catch (error) {
      console.error(`Error getting all ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Get document by ID
  async getById(id: string): Promise<T | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as T;
      }
      return null;
    } catch (error) {
      console.error(`Error getting ${this.collectionName} by ID:`, error);
      throw error;
    }
  }

  // Add new document
  async add(data: Omit<T, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error adding ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Update document
  async update(id: string, data: Partial<T>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error(`Error updating ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Delete document
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Real-time listener
  subscribeToCollection(
    callback: (data: T[]) => void,
    constraints: QueryConstraint[] = [],
    onError?: (error: any) => void
  ) {
    const q = query(collection(db, this.collectionName), ...constraints);
    return onSnapshot(
      q,
      (querySnapshot) => {
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as T[];
        callback(data);
      },
      (error) => {
        console.error(`onSnapshot error for ${this.collectionName}:`, error);
        if (onError) onError(error);
      }
    );
  }
}

// Specific service instances
export const userService = new FirestoreService<User>('users');
export const messageService = new FirestoreService<Message>('messages');
export const scheduleService = new FirestoreService<Schedule>('schedules');
export const reportService = new FirestoreService<Report>('reports');
export const requestService = new FirestoreService<ShiftRequest>('shiftRequests');
export const shiftTemplateService = new FirestoreService<ShiftTemplate>('shiftTemplates');
export const swapOfferService = new FirestoreService<SwapOffer>('swapOffers');

// Specialized functions for common operations
export const firestoreService = {
  // User operations
  async getUsersByRole(role: 'employee' | 'manager'): Promise<User[]> {
    return userService.getAll([where('role', '==', role), where('isActive', '==', true)]);
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const users = await userService.getAll([where('email', '==', email), limit(1)]);
    return users.length > 0 ? users[0] : null;
  },

  // Message operations
  async getMessagesForUser(userId: string, type?: 'email' | 'message' | 'notification'): Promise<Message[]> {
    const constraints: QueryConstraint[] = [
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc')
    ];
    if (type) {
      constraints.unshift(where('type', '==', type));
    }
    return messageService.getAll(constraints);
  },

  async getUnreadMessages(userId: string): Promise<Message[]> {
    return messageService.getAll([
      where('recipientId', '==', userId),
      where('isRead', '==', false),
      orderBy('createdAt', 'desc')
    ]);
  },

  // Schedule operations
  async getSchedulesForUser(userId: string, startDate?: Date, endDate?: Date): Promise<Schedule[]> {
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      orderBy('date', 'asc')
    ];
    
    if (startDate && endDate) {
      constraints.push(
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate))
      );
    }
    
    return scheduleService.getAll(constraints);
  },

  async getSchedulesForDate(date: Date): Promise<Schedule[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return scheduleService.getAll([
      where('date', '>=', Timestamp.fromDate(startOfDay)),
      where('date', '<=', Timestamp.fromDate(endOfDay)),
      orderBy('date', 'asc')
    ]);
  },

  // Report operations
  async getReportsByType(type: string): Promise<Report[]> {
    return reportService.getAll([
      where('type', '==', type),
      orderBy('createdAt', 'desc')
    ]);
  },

  // Batch operations
  async batchUpdateMessages(messages: { id: string; updates: Partial<Message> }[]): Promise<void> {
    const batch = writeBatch(db);
    
    messages.forEach(({ id, updates }) => {
      const docRef = doc(db, 'messages', id);
      batch.update(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    });
    
    await batch.commit();
  }
}; 