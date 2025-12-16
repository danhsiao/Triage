import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CaseList from './components/CaseList';
import CaseDetail from './components/CaseDetail';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<CaseList />} />
          <Route path="/cases/:id" element={<CaseDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

