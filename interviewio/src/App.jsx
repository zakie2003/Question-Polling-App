import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Choice from './page/choice';
import Student from './page/Student';
import Poll from './page/Poll';
import Teacher from './page/Teacher';
import Removed from './page/Removed';
import History from './page/history';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Choice />} />
        <Route path='/student' element={<Student/>} />
        <Route path='/student/poll' element={<Poll/>} />
        <Route path='/teacher' element={<Teacher/>} />
        <Route path='/removed' element={<Removed/>} />
        <Route path='/history' element={<History/>} />
      </Routes>
    </Router>
  );
}

export default App;
