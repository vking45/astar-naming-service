import Landing from './views/Landing';
import Dashboard from './views/Dashboard';
import { BrowserRouter as Router, Route, Routes} from "react-router-dom";

function App() {
  return (
    <div className="relative min-h-screen">
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home/:name" element={<Dashboard />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
