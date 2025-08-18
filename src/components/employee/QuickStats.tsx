
import { Card, CardContent } from "@/components/ui/card";
<<<<<<< HEAD
import { MessageSquare, Calendar, Trophy, Star, TrendingUp, Gift, Award, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
=======
import { MessageSquare, Mail, Calendar, Coffee } from "lucide-react";
>>>>>>> 2de4dde9bb700f9ede6e0ac9e651f0b3244783f9

interface QuickStatsProps {
  unreadMessages: number;
  onOpenMessages?: () => void;
  onOpenCalendar?: () => void;
  onOpenBreakSettings?: () => void;
}

<<<<<<< HEAD
const QuickStats = ({ unreadMessages, onOpenMessages, onOpenCalendar }: QuickStatsProps) => {
  // Mock data for employee info
  const currentRank = 3;
  const totalEmployees = 25;
  const monthlyProgress = 85;
  const bonusPoints = 1250;
  const nextBonus = 1500;
  const employeeLevel = "מתקדם";
  const performanceScore = 92;

  return (
    <div className="space-y-6 mb-8 flex justify-center" dir="rtl">
      <div className="w-full max-w-6xl">
        {/* Top Row - Original Cards */}
        <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onOpenMessages}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">הודעות חדשות</p>
                  <p className="text-2xl font-bold text-emerald-600">{unreadMessages}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onOpenCalendar}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">משמרות השבוע</p>
                  <p className="text-2xl font-bold text-violet-600">5</p>
                </div>
                <Calendar className="h-8 w-8 text-violet-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row - Employee Info Card (Centered) */}
        <div className="flex justify-center">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 max-w-4xl w-full">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                {/* Employee Level & Ranking */}
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-full">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-800">{employeeLevel}</p>
                      <p className="text-sm text-gray-600">רמה מקצועית</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-700">מיקום #{currentRank} מתוך {totalEmployees}</span>
                  </div>
                </div>

                {/* Performance Score */}
                <div className="text-center">
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <div className="mb-2">
                      <span className="text-2xl font-bold text-blue-600">{performanceScore}</span>
                      <span className="text-sm text-gray-600">/100</span>
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-2">ציון ביצועים</p>
                    <Progress value={performanceScore} className="h-2 bg-gray-100" />
                  </div>
                </div>

                {/* Bonus Points */}
                <div className="text-center">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-100">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <div className="bg-purple-500 p-1 rounded-full">
                        <Star className="h-4 w-4 text-white fill-current" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">נקודות בונוס</span>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{bonusPoints}</p>
                      <p className="text-xs text-gray-500">יעד: {nextBonus}</p>
                    </div>
                  </div>
                </div>

                {/* Monthly Progress & Achievements */}
                <div className="text-center">
                  <div className="space-y-3">
                    <div className="flex items-center justify-center space-x-2">
                      <Target className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">התקדמות חודשית</span>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-green-600">{monthlyProgress}%</p>
                      <Progress value={monthlyProgress} className="h-2 mt-1" />
                    </div>
                    <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 px-3 py-1 text-xs font-medium">
                      <TrendingUp className="h-3 w-3 ml-1" />
                      עובד מצטיין
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
=======
const QuickStats = ({ unreadMessages, unreadEmails, onOpenMessages, onOpenEmails, onOpenCalendar, onOpenBreakSettings }: QuickStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" dir="rtl">
      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onOpenMessages}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">הודעות חדשות</p>
              <p className="text-2xl font-bold text-emerald-600">{unreadMessages}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-emerald-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onOpenEmails}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">מיילים חדשים</p>
              <p className="text-2xl font-bold text-green-600">{unreadEmails}</p>
            </div>
            <Mail className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onOpenCalendar}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">משמרות השבוע</p>
              <p className="text-2xl font-bold text-violet-600">5</p>
            </div>
            <Calendar className="h-8 w-8 text-violet-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onOpenBreakSettings}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">הפסקה פעילה</p>
              <p className="text-lg font-bold text-orange-600">15 דקות</p>
              <p className="text-xs text-gray-500">נותרו</p>
            </div>
            <div className="relative">
              <Coffee className="h-8 w-8 text-orange-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </CardContent>
      </Card>
>>>>>>> 2de4dde9bb700f9ede6e0ac9e651f0b3244783f9
    </div>
  );
};

export default QuickStats;
