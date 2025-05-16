import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { useTheme } from './ThemeProvider';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const leaderboardData = [
  { rank: 1, name: "John Ms CS", points: 10001 },
  { rank: 2, name: "Fatima Bsc CS", points: 10000 },
  { rank: 3, name: "Tom Bsc AI", points: 9691 },
  { rank: 4, name: "Ahmed MEng", points: 9524 },
  { rank: 5, name: "Sara Bsc AI", points: 9333 },
  { rank: 6, name: "Omar Bsc CS", points: 9000 },
];

const Leaderboard = () => {
  const { isDark } = useTheme();

  const rankingData = {
    labels: leaderboardData.map((item) => item.name),
    datasets: [
      {
        label: "Points",
        data: leaderboardData.map((item) => item.points), 
        backgroundColor: [
          "#FFD700", 
          "#C0C0C0", 
          "#CD7F32", 
          isDark ? "#4B5563" : "#FFFFFF", 
          isDark ? "#4B5563" : "#FFFFFF",
          isDark ? "#4B5563" : "#FFFFFF"
        ],
        borderColor: isDark ? "#6B7280" : "#000000",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className={`p-8 w-full max-w-screen-xl mx-auto ${isDark ? "bg-gray-900" : ""}`}> 
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bar Chart Ranking */}
        <div className={`p-6 rounded-lg md:col-span-2 col-span-1 w-full h-96 shadow-md ${
          isDark ? "bg-gray-800" : "bg-[#9ec67f] bg-opacity-60"
        }`}>
          <h2 className={`text-xl font-semibold mb-4 ${
            isDark ? "text-white" : "text-black"
          }`}>Overall Rankings</h2>
          <div className="h-4/5">
            <Bar
              data={rankingData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    backgroundColor: isDark ? "rgba(0,0,0,0.9)" : "rgba(0,0,0,0.8)",
                    titleFont: {
                      family: "monospace",
                      size: 14
                    },
                    bodyFont: {
                      family: "monospace",
                      size: 12
                    },
                    callbacks: {
                      label: function(context) {
                        return `Points: ${context.raw}`;
                      },
                      title: function(context) {
                        const index = context[0].dataIndex;
                        return `Rank #${leaderboardData[index].rank}: ${leaderboardData[index].name}`;
                      }
                    }
                  }
                },
                scales: {
                  x: {
                    grid: {
                      display: false
                    },
                    ticks: {
                      color: isDark ? "#F3F4F6" : "#000000",
                      font: {
                        family: "monospace"
                      }
                    },
                  },
                  y: {
                    grid: {
                      color: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                    },
                    ticks: {
                      color: isDark ? "#F3F4F6" : "#000000",
                      font: {
                        family: "monospace"
                      },
                      callback: function(value) {
                        if (value >= 1000) {
                          return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                        }
                        return value;
                      }
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Personal Achievements */}
        <div className={`p-6 rounded-lg shadow-md ${
          isDark ? "bg-gray-800" : "bg-[#9ec67f] bg-opacity-30"
        }`}>
          <h2 className={`text-xl font-semibold mb-4 ${
            isDark ? "text-white" : "text-black"
          }`}>Personal Achievements</h2>
          <div className={`mb-4 p-3 rounded-md border-l-4 ${
            isDark ? "bg-gray-700 border-blue-500" : "bg-white bg-opacity-60 border-blue-700"
          }`}>
            <p className={`text-lg ${
              isDark ? "text-white" : "text-black"
            }`}>Current Rank: <span className={`font-bold ${
              isDark ? "text-blue-400" : "text-blue-800"
            }`}>4</span></p>
          </div>
          <div className="space-y-3">
            {[
              "Completed AI Mastery Course",
              "Ranked #1 in Functional Programming",
              "Published a Research Paper on Databases",
              "Scored 98% in Algorithm Challenges"
            ].map((achievement, index) => (
              <div key={index} className="flex items-start">
                <div className={`mr-2 mt-1 ${
                  isDark ? "text-green-400" : "text-green-700"
                }`}>✓</div>
                <p className={isDark ? "text-gray-300" : ""}>{achievement}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Subject-Specific Ranking */}
        <div className={`p-6 rounded-lg md:col-span-3 col-span-1 shadow-md ${
          isDark ? "bg-gray-800" : "bg-[#9ec67f] bg-opacity-60"
        }`}>
          <h2 className={`text-xl font-semibold mb-4 ${
            isDark ? "text-white" : "text-black"
          }`}>Subject-Specific Ranking - Your rankings in different subjects</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { subject: "Artificial Intelligence", rank: 1 },
              { subject: "Functional Programming", rank: 2 },
              { subject: "Team Project", rank: 3 }
            ].map((item, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                isDark ? "bg-gray-700 border-gray-600" : "bg-white bg-opacity-40 border-gray-300"
              }`}>
                <div className="flex justify-between items-center">
                  <h3 className={`font-semibold ${
                    isDark ? "text-white" : "text-black"
                  }`}>{item.subject}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    isDark ? "bg-gray-600 text-white" : "bg-gray-200 text-black"
                  }`}>Rank {item.rank}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;