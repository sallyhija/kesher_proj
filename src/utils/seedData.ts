import { Timestamp } from 'firebase/firestore';
import { firestoreService, userService, messageService, scheduleService, reportService, swapOfferService, User, Message, Schedule, Report, SwapOffer } from '@/services/firestore';

// Sample users data
const sampleUsers: Omit<User, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    email: 'manager@kesher.com',
    name: 'דוד כהן',
    role: 'manager',
    department: 'ניהול',
    position: 'מנהל כללי',
    phone: '050-1234567',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    isActive: true
  },
  {
    email: 'employee1@kesher.com',
    name: 'שרה לוי',
    role: 'employee',
    department: 'שירות לקוחות',
    position: 'נציג שירות',
    phone: '050-2345678',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    isActive: true
  },
  {
    email: 'employee2@kesher.com',
    name: 'יואב גבריאל',
    role: 'employee',
    department: 'שירות לקוחות',
    position: 'נציג בכיר',
    phone: '050-3456789',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    isActive: true
  },
  {
    email: 'employee3@kesher.com',
    name: 'מיכל דוד',
    role: 'employee',
    department: 'שירות לקוחות',
    position: 'נציג שירות',
    phone: '050-4567890',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    isActive: true
  }
];

// Sample messages data
const sampleMessages: Omit<Message, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    senderId: 'manager@kesher.com',
    senderName: 'דוד כהן',
    recipientId: 'employee1@kesher.com',
    recipientName: 'שרה לוי',
    subject: 'עדכון משמרת',
    content: 'שלום שרה, אנא שימי לב לשינוי במשמרת שלך ביום רביעי הקרוב.',
    type: 'message',
    isRead: false,
    priority: 'medium'
  },
  {
    senderId: 'manager@kesher.com',
    senderName: 'דוד כהן',
    recipientId: 'employee2@kesher.com',
    recipientName: 'יואב גבריאל',
    subject: 'ביצועים מצוינים',
    content: 'יואב, ביצועיך השבוע היו מעולים! המשך כך.',
    type: 'email',
    isRead: true,
    priority: 'low'
  },
  {
    senderId: 'system',
    senderName: 'מערכת',
    recipientId: 'employee3@kesher.com',
    recipientName: 'מיכל דוד',
    subject: 'תזכורת - פגישה שבועית',
    content: 'תזכורת: פגישה שבועית מחר בשעה 10:00',
    type: 'notification',
    isRead: false,
    priority: 'high'
  }
];

// Sample schedules data
const getSampleSchedules = (): Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>[] => {
  const schedules: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>[] = [];
  const today = new Date();
  
  // Generate schedules for the next 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Morning shift
    schedules.push({
      userId: 'employee1@kesher.com',
      userName: 'שרה לוי',
      date: Timestamp.fromDate(date),
      startTime: '08:00',
      endTime: '16:00',
      shiftType: 'morning',
      status: 'scheduled',
      notes: i === 0 ? 'משמרת רגילה' : undefined
    });
    
    // Afternoon shift
    schedules.push({
      userId: 'employee2@kesher.com',
      userName: 'יואב גבריאל',
      date: Timestamp.fromDate(date),
      startTime: '16:00',
      endTime: '00:00',
      shiftType: 'afternoon',
      status: 'scheduled'
    });
    
    // Night shift
    schedules.push({
      userId: 'employee3@kesher.com',
      userName: 'מיכל דוד',
      date: Timestamp.fromDate(date),
      startTime: '00:00',
      endTime: '08:00',
      shiftType: 'night',
      status: 'scheduled'
    });
  }
  
  return schedules;
};

// Sample reports data
const sampleReports: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'דוח ביצועים שבועי',
    description: 'דוח ביצועים של הצוות השבוע',
    type: 'performance',
    data: {
      totalCalls: 1247,
      avgWaitTime: '2:34',
      satisfaction: 4.2,
      staffOnDuty: 12
    },
    createdBy: 'manager@kesher.com'
  },
  {
    title: 'דוח נוכחות חודשי',
    description: 'דוח נוכחות עובדים לחודש נוכחי',
    type: 'attendance',
    data: {
      totalDays: 22,
      presentDays: 20,
      absentDays: 2,
      lateDays: 1
    },
    createdBy: 'manager@kesher.com'
  },
  {
    title: 'דוח תקשורת',
    description: 'סטטיסטיקות תקשורת פנימית',
    type: 'communication',
    data: {
      totalMessages: 156,
      emailsSent: 89,
      notifications: 67,
      responseTime: '15min'
    },
    createdBy: 'system'
  }
];

// Sample swap offers data
const getSampleSwapOffers = (): Omit<SwapOffer, 'id' | 'createdAt' | 'updatedAt'>[] => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const nextMonth = new Date();
  nextMonth.setDate(nextMonth.getDate() + 30);

  return [
    {
      employeeId: 'employee1@kesher.com',
      employeeName: 'שרה לוי',
      employeeDepartment: 'שירות לקוחות',
      employeeRating: 4.8,
      employeeCompletedSwaps: 12,
      currentShift: {
        date: Timestamp.fromDate(tomorrow),
        startTime: '08:00',
        endTime: '16:00',
        shiftType: 'morning',
        location: 'משרד ראשי'
      },
      desiredShift: {
        date: Timestamp.fromDate(nextWeek),
        startTime: '16:00',
        endTime: '00:00',
        shiftType: 'afternoon',
        location: 'משרד ראשי'
      },
      reason: 'יש לי פגישה חשובה ביום שני',
      status: 'active',
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) // 7 days from now
    },
    {
      employeeId: 'employee2@kesher.com',
      employeeName: 'יואב גבריאל',
      employeeDepartment: 'שירות לקוחות',
      employeeRating: 4.9,
      employeeCompletedSwaps: 8,
      currentShift: {
        date: Timestamp.fromDate(nextWeek),
        startTime: '16:00',
        endTime: '00:00',
        shiftType: 'afternoon',
        location: 'משרד ראשי'
      },
      desiredShift: {
        date: Timestamp.fromDate(tomorrow),
        startTime: '08:00',
        endTime: '16:00',
        shiftType: 'morning',
        location: 'משרד ראשי'
      },
      reason: 'מעדיף משמרות בוקר',
      status: 'active',
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)) // 14 days from now
    },
    {
      employeeId: 'employee3@kesher.com',
      employeeName: 'מיכל דוד',
      employeeDepartment: 'שירות לקוחות',
      employeeRating: 4.7,
      employeeCompletedSwaps: 15,
      currentShift: {
        date: Timestamp.fromDate(nextWeek),
        startTime: '00:00',
        endTime: '08:00',
        shiftType: 'night',
        location: 'משרד ראשי'
      },
      desiredShift: {
        date: Timestamp.fromDate(nextWeek),
        startTime: '08:00',
        endTime: '16:00',
        shiftType: 'morning',
        location: 'משרד ראשי'
      },
      reason: 'משמרת לילה לא מתאימה לי כרגע',
      status: 'active',
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) // 30 days from now
    }
  ];
};

// Function to seed all data
export async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    // Seed users
    console.log('Seeding users...');
    for (const user of sampleUsers) {
      await userService.add(user);
    }
    
    // Seed messages
    console.log('Seeding messages...');
    for (const message of sampleMessages) {
      await messageService.add(message);
    }
    
    // Seed schedules
    console.log('Seeding schedules...');
    const schedules = getSampleSchedules();
    for (const schedule of schedules) {
      await scheduleService.add(schedule);
    }
    
    // Seed reports
    console.log('Seeding reports...');
    for (const report of sampleReports) {
      await reportService.add(report);
    }
    
    // Seed swap offers
    console.log('Seeding swap offers...');
    const swapOffers = getSampleSwapOffers();
    for (const swapOffer of swapOffers) {
      await swapOfferService.add(swapOffer);
    }
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Function to clear all data (for testing)
export async function clearDatabase() {
  try {
    console.log('Clearing database...');
    
    // Get all documents and delete them
    const users = await userService.getAll();
    const messages = await messageService.getAll();
    const schedules = await scheduleService.getAll();
    const reports = await reportService.getAll();
    const swapOffers = await swapOfferService.getAll();
    
    // Delete users
    for (const user of users) {
      if (user.id) {
        await userService.delete(user.id);
      }
    }
    
    // Delete messages
    for (const message of messages) {
      if (message.id) {
        await messageService.delete(message.id);
      }
    }
    
    // Delete schedules
    for (const schedule of schedules) {
      if (schedule.id) {
        await scheduleService.delete(schedule.id);
      }
    }
    
    // Delete reports
    for (const report of reports) {
      if (report.id) {
        await reportService.delete(report.id);
      }
    }
    
    // Delete swap offers
    for (const swapOffer of swapOffers) {
      if (swapOffer.id) {
        await swapOfferService.delete(swapOffer.id);
      }
    }
    
    console.log('Database cleared successfully!');
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
} 