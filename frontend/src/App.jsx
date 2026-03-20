import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import Home from './pages/Home';
import Analysis from './pages/Analysis';
import Pathway from './pages/Pathway';
import { DiagnosticQuiz } from './components/DiagnosticQuiz';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 mt-16 flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analyze" element={<Analysis />} />
          <Route path="/pathway" element={<Pathway />} />
          <Route path="/quiz" element={<DiagnosticQuiz />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
