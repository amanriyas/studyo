import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Leaderboard from "../components/Leaderboard";
import medal from "../assets/medal.png";

const LeaderboardPage = () => {
  return (
    <div className="relative min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 fixed top-0 left-0 h-full">
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="flex-1 ml-64 p-6">
        <Header title="Leaderboard" pageIcon={medal} />
        
        {/* Increase margin to add space between header and leaderboard */}
        <div className="mt-40 w-full">
          <Leaderboard />
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
