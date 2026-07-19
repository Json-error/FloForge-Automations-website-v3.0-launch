import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "@/pages/Landing";
import PrivacyPolicy from "@/pages/PrivacyPolicy";

function App() {
  return (
    <div className="App font-inter">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
