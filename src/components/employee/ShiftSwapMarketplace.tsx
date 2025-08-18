import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  BookOpen, 
  Clock, 
  Users, 
  Play,
  Star,
  Award,
  Calendar,
  CheckCircle,
  Lock,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorAvatar?: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  rating: number;
  enrolledStudents: number;
  progress?: number;
  isEnrolled: boolean;
  isCompleted: boolean;
  thumbnail?: string;
  tags: string[];
  lastUpdated: string;
}

const LearningCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Mock data for courses
  const mockCourses: Course[] = [
    {
      id: '1',
      title: 'יסודות שירות לקוחות',
      description: 'למדו את העקרונות הבסיסיים של שירות לקוחות מעולה, כולל תקשורת יעילה ופתרון בעיות.',
      instructor: 'דנה כהן',
      duration: '4 שעות',
      level: 'beginner',
      category: 'שירות לקוחות',
      rating: 4.8,
      enrolledStudents: 156,
      progress: 75,
      isEnrolled: true,
      isCompleted: false,
      tags: ['תקשורת', 'שירות לקוחות', 'בסיסי'],
      lastUpdated: '2024-01-15'
    },
    {
      id: '2',
      title: 'ניהול זמן מתקדם',
      description: 'טכניקות מתקדמות לניהול זמן יעיל במקום העבודה ובחיים האישיים.',
      instructor: 'יוסי לוי',
      duration: '6 שעות',
      level: 'intermediate',
      category: 'פיתוח אישי',
      rating: 4.6,
      enrolledStudents: 89,
      progress: 0,
      isEnrolled: false,
      isCompleted: false,
      tags: ['ניהול זמן', 'יעילות', 'ארגון'],
      lastUpdated: '2024-01-10'
    },
    {
      id: '3',
      title: 'כישורי מנהיגות',
      description: 'פיתוח כישורי מנהיגות וניהול צוותים בצורה אפקטיבית.',
      instructor: 'מיכל רוזן',
      duration: '8 שעות',
      level: 'advanced',
      category: 'מנהיגות',
      rating: 4.9,
      enrolledStudents: 234,
      progress: 100,
      isEnrolled: true,
      isCompleted: true,
      tags: ['מנהיגות', 'ניהול', 'צוות'],
      lastUpdated: '2024-01-20'
    },
    {
      id: '4',
      title: 'תקשורת דיגיטלית',
      description: 'כלים וטכניקות לתקשורת יעילה בעולם הדיגיטלי.',
      instructor: 'עומר דוד',
      duration: '3 שעות',
      level: 'beginner',
      category: 'תקשורת',
      rating: 4.4,
      enrolledStudents: 67,
      progress: 0,
      isEnrolled: false,
      isCompleted: false,
      tags: ['דיגיטלי', 'תקשורת', 'טכנולוגיה'],
      lastUpdated: '2024-01-12'
    },
    {
      id: '5',
      title: 'פתרון בעיות יצירתי',
      description: 'שיטות יצירתיות לזיהוי ופתרון בעיות מורכבות במקום העבודה.',
      instructor: 'נועה אברהם',
      duration: '5 שעות',
      level: 'intermediate',
      category: 'פיתוח אישי',
      rating: 4.7,
      enrolledStudents: 123,
      progress: 30,
      isEnrolled: true,
      isCompleted: false,
      tags: ['יצירתיות', 'פתרון בעיות', 'חשיבה'],
      lastUpdated: '2024-01-18'
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setCourses(mockCourses);
      setLoading(false);
    }, 1000);
  }, []);

  const getLevelText = (level: string) => {
    switch (level) {
      case 'beginner': return 'מתחיל';
      case 'intermediate': return 'בינוני';
      case 'advanced': return 'מתקדם';
      default: return 'לא ידוע';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'שירות לקוחות': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'פיתוח אישי': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'מנהיגות': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'תקשורת': return 'bg-teal-100 text-teal-800 border-teal-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleEnrollCourse = async (courseId: string) => {
    try {
      // Simulate API call
      setCourses(prev => prev.map(course => 
        course.id === courseId 
          ? { ...course, isEnrolled: true, progress: 0 }
          : course
      ));

      toast({
        title: "נרשמת בהצלחה",
        description: "הקורס נוסף לרשימת הקורסים שלך",
      });
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהרשמה לקורס",
        variant: "destructive",
      });
    }
  };

  const handleContinueCourse = (courseId: string) => {
    toast({
      title: "פתיחת קורס",
      description: "הקורס נפתח במערכת הלמידה",
    });
  };

  const filteredCourses = courses.filter(course => {
    const categoryMatch = selectedCategory === 'all' || course.category === selectedCategory;
    const levelMatch = selectedLevel === 'all' || course.level === selectedLevel;
    return categoryMatch && levelMatch;
  });

  const categories = ['all', ...Array.from(new Set(courses.map(c => c.category)))];
  const levels = ['all', 'beginner', 'intermediate', 'advanced'];

  const enrolledCourses = courses.filter(c => c.isEnrolled);
  const completedCourses = courses.filter(c => c.isCompleted);
  const inProgressCourses = enrolledCourses.filter(c => !c.isCompleted);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">קורסי למידה</h1>
          <p className="text-lg text-gray-600">פתחו את הכישורים שלכם עם קורסים מקצועיים</p>
        </div>
        <div className="flex items-center space-x-2">
          <Award className="h-6 w-6 text-emerald-600" />
          <span className="text-sm text-gray-600">נקודות למידה: 1,250</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{enrolledCourses.length}</p>
                <p className="text-sm text-gray-600">קורסים נרשמים</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Play className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">{inProgressCourses.length}</p>
                <p className="text-sm text-gray-600">בתהליך למידה</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-purple-600">{completedCourses.length}</p>
                <p className="text-sm text-gray-600">הושלמו</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Star className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">4.7</p>
                <p className="text-sm text-gray-600">דירוג ממוצע</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">קטגוריה:</label>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'כל הקטגוריות' : category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">רמה:</label>
              <select 
                value={selectedLevel} 
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                {levels.map(level => (
                  <option key={level} value={level}>
                    {level === 'all' ? 'כל הרמות' : getLevelText(level)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-500">טוען קורסים...</p>
            </CardContent>
          </Card>
        ) : filteredCourses.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">לא נמצאו קורסים</h3>
              <p className="text-gray-600">
                נסו לשנות את הפילטרים או לחזור מאוחר יותר
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Course Header */}
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-lg">{course.title}</h3>
                          {course.isCompleted && (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              <CheckCircle className="h-3 w-3 ml-1" />
                              הושלם
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">{course.description}</p>
                        
                        {/* Instructor Info */}
                        <div className="flex items-center space-x-3 mb-3">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {course.instructor.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-700">{course.instructor}</span>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-sm text-gray-600">{course.rating}</span>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="outline" className={getCategoryColor(course.category)}>
                            {course.category}
                          </Badge>
                          <Badge variant="outline" className={getLevelColor(course.level)}>
                            {getLevelText(course.level)}
                          </Badge>
                          {course.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Course Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>{course.enrolledStudents} תלמידים</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>עודכן: {new Date(course.lastUpdated).toLocaleDateString('he-IL')}</span>
                      </div>
                    </div>

                    {/* Progress Bar for Enrolled Courses */}
                    {course.isEnrolled && !course.isCompleted && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>התקדמות</span>
                          <span>{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    {course.isEnrolled ? (
                      course.isCompleted ? (
                        <Button variant="outline" size="sm" className="text-green-600 border-green-200">
                          <CheckCircle className="h-4 w-4 ml-1" />
                          הושלם
                        </Button>
                      ) : (
                        <Button 
                          size="sm"
                          onClick={() => handleContinueCourse(course.id)}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          <Play className="h-4 w-4 ml-1" />
                          המשך למידה
                        </Button>
                      )
                    ) : (
                      <Button 
                        size="sm"
                        onClick={() => handleEnrollCourse(course.id)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <BookOpen className="h-4 w-4 ml-1" />
                        הרשמה לקורס
                      </Button>
                    )}
                    
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 ml-1" />
                      פרטים נוספים
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Learning Paths */}
      <Card>
        <CardHeader>
          <CardTitle>מסלולי למידה מומלצים</CardTitle>
          <CardDescription>
            מסלולים מותאמים אישית לפיתוח הקריירה שלכם
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-blue-600 mb-2">מסלול שירות לקוחות</h4>
              <p className="text-sm text-gray-600 mb-3">3 קורסים • 12 שעות</p>
              <Progress value={60} className="h-2 mb-2" />
              <p className="text-xs text-gray-500">60% הושלם</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-purple-600 mb-2">מסלול מנהיגות</h4>
              <p className="text-sm text-gray-600 mb-3">4 קורסים • 16 שעות</p>
              <Progress value={25} className="h-2 mb-2" />
              <p className="text-xs text-gray-500">25% הושלם</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-green-600 mb-2">מסלול פיתוח אישי</h4>
              <p className="text-sm text-gray-600 mb-3">2 קורסים • 8 שעות</p>
              <Progress value={100} className="h-2 mb-2" />
              <p className="text-xs text-gray-500">100% הושלם</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LearningCourses;
