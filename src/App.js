import { BrowserRouter as Router, Route, Routes} from "react-router-dom";
import { Fragment } from 'react';

function App() {
  return (
    <div className="relative min-h-screen">
      <Router>
        <Routes>
          <Route path="/" element={<Fragment />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
