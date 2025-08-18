import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, TrendingUp, Star, Award } from "lucide-react";

const ProgressIncentive = () => {
  const monthlyProgress = 78; // אחוז התקדמות לחודש
  const currentRank = 3; // מיקום נוכחי
  const totalEmployees = 12; // סך עובדים
  const monthlyGoal = 85; // יעד חודשי באחוזים
  const currentScore = 2340; // נקודות נוכחיות
  const targetScore = 3000; // יעד נקודות

  const achievements = [
    { icon: Star, title: "כוכב השבוע", earned: true },
    { icon: Trophy, title: "מובילי הביצועים", earned: true },
    { icon: Target, title: "יעד חודשי", earned: false },
    { icon: Award, title: "שירות מצוין", earned: true }
  ];

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case 2: return "bg-gray-100 text-gray-800 border-gray-300";
      case 3: return "bg-orange-100 text-orange-800 border-orange-300";
      default: return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return "🏆";
    }
  };

  return (
    <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <span className="text-xl font-bold text-emerald-700">התקדמות חודשית</span>
          </div>
          <Badge className={`${getRankColor(currentRank)} font-bold`}>
            {getRankIcon(currentRank)} מקום {currentRank} מתוך {totalEmployees}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* אחוז התקדמות */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">התקדמות ליעד החודשי</span>
            <span className="text-lg font-bold text-emerald-600">{monthlyProgress}%</span>
          </div>
          <Progress value={monthlyProgress} className="h-3 bg-emerald-100" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{currentScore} נקודות</span>
            <span>יעד: {targetScore} נקודות</span>
          </div>
        </div>

        {/* הישגים */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-700 flex items-center space-x-2">
            <Award className="h-4 w-4 text-emerald-600" />
            <span>הישגים</span>
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    achievement.earned
                      ? "bg-emerald-100 border-emerald-300 text-emerald-700"
                      : "bg-gray-50 border-gray-200 text-gray-400"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className={`h-4 w-4 ${achievement.earned ? "text-emerald-600" : "text-gray-400"}`} />
                    <span className="text-xs font-medium">{achievement.title}</span>
                  </div>
                  {achievement.earned && (
                    <div className="mt-1">
                      <span className="text-xs text-emerald-600">✓ הושג</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* תמריץ */}
        <div className="bg-white p-4 rounded-lg border border-emerald-200">
          <div className="text-center space-y-2">
            <Trophy className="h-6 w-6 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-emerald-700">קרוב ליעד!</h4>
            <p className="text-sm text-gray-600">
              עוד רק {targetScore - currentScore} נקודות ותגיע ליעד החודשי
            </p>
            <div className="text-xs text-emerald-600 font-medium">
              💰 פרס של 500₪ בונוס מחכה לך!
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressIncentive;