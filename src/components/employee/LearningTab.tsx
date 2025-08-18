import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Users, Star, Play, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  progress: number;
  category: string;
  difficulty: 'מתחיל' | 'בינוני' | 'מתקדם';
  rating: number;
  enrolled: number;
  completed: boolean;
  thumbnail: string;
}

const LearningTab = () => {
  const [courses] = useState<Course[]>([
    {
      id: '1',
      title: 'שירות לקוחות מעולה',
      description: 'למד כיצד לספק שירות לקוחות יוצא דופן ולבנות קשרים חזקים עם לקוחות',
      duration: '2 שעות',
      progress: 75,
      category: 'שירות לקוחות',
      difficulty: 'בינוני',
      rating: 4.8,
      enrolled: 234,
      completed: false,
      thumbnail: '🎯'
    },
    {
      id: '2',
      title: 'מיומנויות תקשורת בעבודה',
      description: 'פתח מיומנויות תקשורת יעילות לעבודה בצוות ולניהול קונפליקטים',
      duration: '1.5 שעות',
      progress: 100,
      category: 'תקשורת',
      difficulty: 'מתחיל',
      rating: 4.6,
      enrolled: 567,
      completed: true,
      thumbnail: '💬'
    },
    {
      id: '3',
      title: 'ניהול זמן ויעילות',
      description: 'אסטרטגיות מעשיות לניהול זמן טוב יותר והגברת הפרודוקטיביות',
      duration: '3 שעות',
      progress: 30,
      category: 'פרודוקטיביות',
      difficulty: 'מתקדם',
      rating: 4.9,
      enrolled: 189,
      completed: false,
      thumbnail: '⏰'
    },
    {
      id: '4',
      title: 'בטיחות במקום העבודה',
      description: 'הכרת חוקי הבטיחות והגהות הבסיסיות לעבודה בטוחה',
      duration: '1 שעה',
      progress: 0,
      category: 'בטיחות',
      difficulty: 'מתחיל',
      rating: 4.5,
      enrolled: 892,
      completed: false,
      thumbnail: '🛡️'
    },
    {
      id: '5',
      title: 'מנהיגות וחדשנות',
      description: 'פתח כישורי מנהיגות וחשיבה יצירתית לקידום בקריירה',
      duration: '4 שעות',
      progress: 0,
      category: 'מנהיגות',
      difficulty: 'מתקדם',
      rating: 4.7,
      enrolled: 156,
      completed: false,
      thumbnail: '🚀'
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all');

  const filteredCourses = courses.filter(course => {
    if (filter === 'in-progress') return course.progress > 0 && !course.completed;
    if (filter === 'completed') return course.completed;
    return true;
  });

  const handleStartCourse = (courseId: string, courseTitle: string) => {
    toast({
      title: "קורס החל",
      description: `התחלת ללמוד: ${courseTitle}`,
    });
  };

  const handleContinueCourse = (courseId: string, courseTitle: string) => {
    toast({
      title: "המשך לימוד",
      description: `ממשיך ללמוד: ${courseTitle}`,
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'מתחיל': return 'bg-green-100 text-green-800';
      case 'בינוני': return 'bg-yellow-100 text-yellow-800';
      case 'מתקדם': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="text-4xl">📚</div>
        <h2 className="text-2xl font-bold">מרכז הלמידה שלי</h2>
        <p className="text-muted-foreground">השתלם והתפתח מקצועית עם קורסי הלמידה שלנו</p>
      </div>

      {/* Filter Buttons */}
      <div className="flex justify-center space-x-reverse space-x-4">
        <Button 
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          className="text-right"
        >
          כל הקורסים
        </Button>
        <Button 
          variant={filter === 'in-progress' ? 'default' : 'outline'}
          onClick={() => setFilter('in-progress')}
          className="text-right"
        >
          בתהליך למידה
        </Button>
        <Button 
          variant={filter === 'completed' ? 'default' : 'outline'}
          onClick={() => setFilter('completed')}
          className="text-right"
        >
          הושלמו
        </Button>
      </div>

      {/* Courses Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="text-right">
              <div className="flex items-start justify-between">
                <div className="text-3xl">{course.thumbnail}</div>
                <div className="space-y-2">
                  <Badge className={getDifficultyColor(course.difficulty)}>
                    {course.difficulty}
                  </Badge>
                  {course.completed && (
                    <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      הושלם
                    </Badge>
                  )}
                </div>
              </div>
              <CardTitle className="text-lg">{course.title}</CardTitle>
              <CardDescription className="text-right">
                {course.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Course Stats */}
              <div className="flex justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {course.duration}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {course.enrolled} רשומים
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {course.rating}
                </div>
              </div>

              {/* Progress Bar */}
              {course.progress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>התקדמות</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2">
                {course.completed ? (
                  <Button className="w-full" variant="outline">
                    <BookOpen className="h-4 w-4 ml-2" />
                    צפה שוב
                  </Button>
                ) : course.progress > 0 ? (
                  <Button 
                    className="w-full"
                    onClick={() => handleContinueCourse(course.id, course.title)}
                  >
                    <Play className="h-4 w-4 ml-2" />
                    המשך למידה
                  </Button>
                ) : (
                  <Button 
                    className="w-full"
                    onClick={() => handleStartCourse(course.id, course.title)}
                  >
                    <Play className="h-4 w-4 ml-2" />
                    התחל קורס
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Learning Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-right">הסטטיסטיקות שלי</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                {courses.filter(c => c.completed).length}
              </div>
              <div className="text-sm text-muted-foreground">קורסים הושלמו</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {courses.filter(c => c.progress > 0 && !c.completed).length}
              </div>
              <div className="text-sm text-muted-foreground">קורסים בתהליך</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {Math.round(courses.reduce((acc, c) => acc + c.progress, 0) / courses.length)}%
              </div>
              <div className="text-sm text-muted-foreground">התקדמות כללית</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LearningTab;