import './App.css';
import { Route, Routes } from 'react-router-dom';
import Dashboard from './Screens/Dashboard';
import UploadJson from './Screens/UploadJson';
import UploadCsv from './Screens/UploadCsv';
import ColumnMapper from './Screens/ColumnMapper';
import SettingsPage from './Screens/Settings';
import Layout from './components/Layout';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path='/' element={<Dashboard />} />
        <Route path='/upload-json' element={<UploadJson />} />
        <Route path='/upload-csv' element={<UploadCsv />} />
        <Route path='/column-mapper' element={<ColumnMapper />} />
        <Route path='/settings' element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
