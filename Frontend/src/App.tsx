import './App.css';
import { Route, Routes } from 'react-router-dom';
import Dashboard from './Screens/Dashboard';
import UploadJson from './Screens/UploadJson';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Dashboard />} />
      <Route path='/upload-json' element={<UploadJson />} />
    </Routes>
  );
}

export default App;
