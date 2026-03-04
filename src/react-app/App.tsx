import { BrowserRouter as Router, Routes, Route } from "react-router";
import LandingPage from "@/react-app/pages/Landing";
import DashboardLayout from "@/react-app/components/DashboardLayout";
import ChatPage from "@/react-app/pages/Chat";
import GamesPage from "@/react-app/pages/Games";
import ReadingsPage from "@/react-app/pages/Readings";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/chat"
          element={
            <DashboardLayout>
              <ChatPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/games"
          element={
            <DashboardLayout>
              <GamesPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/readings"
          element={
            <DashboardLayout>
              <ReadingsPage />
            </DashboardLayout>
          }
        />
      </Routes>
    </Router>
  );
}
