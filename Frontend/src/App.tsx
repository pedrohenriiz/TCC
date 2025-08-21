import './App.css';
import { Route, Routes } from 'react-router-dom';
import Dashboard from './Screens/Dashboard';
import UploadJson from './Screens/UploadJson';
import UploadCsv from './Screens/UploadCsv';
import ColumnMapper from './Screens/ColumnMapper';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Dashboard />} />
      <Route path='/upload-json' element={<UploadJson />} />
      <Route path='/upload-csv' element={<UploadCsv />} />
      <Route path='/column-mapper' element={<ColumnMapper />} />
    </Routes>
  );
}

export default App;
