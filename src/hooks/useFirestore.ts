import { useState, useEffect, useCallback } from 'react';
import { QueryConstraint, where, orderBy, Timestamp } from 'firebase/firestore';
import { firestoreService, userService, messageService, scheduleService, reportService, FirestoreService, User, Message, Schedule, Report, requestService, ShiftRequest, shiftTemplateService, ShiftTemplate, swapOfferService, SwapOffer } from '@/services/firestore';

// Generic hook for Firestore collections
export function useFirestoreCollection<T>(
  service: FirestoreService<T>,
  constraints: QueryConstraint[] = [],
  dependencies: any[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = service.subscribeToCollection(
      (newData) => {
        setData(newData);
        setLoading(false);
      },
      constraints,
      (err) => {
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, dependencies);

  const add = useCallback(async (item: Omit<T, 'id'>) => {
    try {
      return await service.add(item);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [service]);

  const update = useCallback(async (id: string, updates: Partial<T>) => {
    try {
      await service.update(id, updates);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [service]);

  const remove = useCallback(async (id: string) => {
    try {
      await service.delete(id);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [service]);

  return {
    data,
    loading,
    error,
    add,
    update,
    remove
  };
}

// Specific hooks for each collection
export function useUsers(role?: 'employee' | 'manager') {
  const constraints = role ? [where('role', '==', role), where('isActive', '==', true)] : [];
  return useFirestoreCollection(userService, constraints, [role]);
}

export function useMessages(userId?: string, type?: 'email' | 'message' | 'notification') {
  const constraints: QueryConstraint[] = [];
  if (userId) {
    constraints.push(where('recipientId', '==', userId));
  }
  if (type) {
    constraints.push(where('type', '==', type));
  }
  constraints.push(orderBy('createdAt', 'desc'));
  
  return useFirestoreCollection(messageService, constraints, [userId, type]);
}

export function useSchedules(userId?: string, startDate?: Date, endDate?: Date) {
  const constraints: QueryConstraint[] = [];
  if (userId) {
    constraints.push(where('userId', '==', userId));
  }
  if (startDate && endDate) {
    constraints.push(
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate))
    );
    // Don't use orderBy when filtering by date range to avoid composite index requirement
    // Sorting will be done client-side in the component
  } else {
    // Only use orderBy when not filtering by date
    constraints.push(orderBy('date', 'asc'));
  }
  
  return useFirestoreCollection(scheduleService, constraints, [userId, startDate, endDate]);
}

export function useReports(type?: string) {
  const constraints = type ? [where('type', '==', type), orderBy('createdAt', 'desc')] : [orderBy('createdAt', 'desc')];
  return useFirestoreCollection(reportService, constraints, [type]);
}

// New: hook for shift requests
export function useShiftRequests(status?: 'pending' | 'approved' | 'rejected') {
  const constraints: QueryConstraint[] = [];
  if (status) {
    constraints.push(where('status', '==', status));
    // Avoid orderBy here to prevent composite index requirement
  } else {
    constraints.push(orderBy('createdAt', 'desc'));
  }

  return useFirestoreCollection<ShiftRequest>(requestService, constraints, [status]);
}

// New: hook for shift templates
export function useShiftTemplates() {
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
  return useFirestoreCollection<ShiftTemplate>(shiftTemplateService, constraints, []);
}

// New: hook for swap offers
export function useSwapOffers(status?: 'active' | 'pending' | 'completed' | 'expired' | 'cancelled') {
  const constraints: QueryConstraint[] = [];
  if (status) {
    constraints.push(where('status', '==', status));
    // When filtering by status, we can't use orderBy without a composite index
    // The data will be ordered in the component instead
  } else {
    // Only use orderBy when not filtering by status
    constraints.push(orderBy('createdAt', 'desc'));
  }
  
  return useFirestoreCollection<SwapOffer>(swapOfferService, constraints, [status]);
}

// Hook for unread messages count
export function useUnreadMessagesCount(userId?: string) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = messageService.subscribeToCollection(
      (messages) => {
        const unreadCount = messages.filter(msg => 
          msg.recipientId === userId && !msg.isRead
        ).length;
        setCount(unreadCount);
        setLoading(false);
      },
      [
        where('recipientId', '==', userId),
        where('isRead', '==', false)
      ]
    );

    return () => unsubscribe();
  }, [userId]);

  return { count, loading };
}

// Hook for user authentication state
export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This would integrate with Firebase Auth
    // For now, we'll use a simple localStorage approach
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      // In a real app, this would use Firebase Auth
      const user = await firestoreService.getUserByEmail(email);
      if (user) {
        setUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        return user;
      }
      throw new Error('User not found');
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('currentUser');
  }, []);

  return {
    user,
    loading,
    login,
    logout
  };
} 