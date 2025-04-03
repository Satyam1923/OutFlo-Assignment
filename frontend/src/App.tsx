import CampaignsDashboard from "./components/campaigns-dashboard";
import MessageGenerator from "./components/message-generator";

export default function App() {
  return (
    <main className="min-h-screen bg-gray-200 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <CampaignsDashboard />
          <MessageGenerator />
        </div>
      </div>
    </main>
  );
}
