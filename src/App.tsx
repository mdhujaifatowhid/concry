import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Create from './pages/Create';
import ConfessionView from './pages/ConfessionView';
import Manage from './pages/Manage';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Layout from './components/Layout';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<Create />} />
          <Route path="/c/:id" element={<ConfessionView />} />
          <Route path="/m/:secret" element={<Manage />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </Layout>
    </Router>
  );
}
