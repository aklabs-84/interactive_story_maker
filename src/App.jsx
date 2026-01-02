import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import EditorPage from './pages/EditorPage';
import PlayerPage from './pages/PlayerPage';
import ManagerPage from './pages/ManagerPage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/editor" element={<EditorPage />} />
                <Route path="/player" element={<PlayerPage />} />
                <Route path="/manager" element={<ManagerPage />} />
            </Routes>
        </Router>
    );
}

export default App;
