import './App.css';
import { Route, Routes } from 'react-router-dom';
import Dashboard from './Screens/Dashboard';
import ColumnMapper from './Screens/ColumnMapper';
import SettingsPage from './Screens/Settings';
import Layout from './components/Layout';
import TableConfigsList from './Screens/TableConfigs/List';
import DataTypesPage from './Screens/Settings/DataSettings';
import TableConfigsShow from './Screens/TableConfigs/Show';
import ProjectsList from './Screens/MigrationProject/List';
import ProjectForm from './Screens/MigrationProject/Show';
import MappingPage from './Screens/Mapping';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path='/' element={<Dashboard />} />
        <Route path='/column-mapper' element={<ColumnMapper />} />
        <Route path='/settings' element={<SettingsPage />} />
        <Route path='/tables-configs' element={<TableConfigsList />} />
        <Route path='/tipos' element={<DataTypesPage />} />
        <Route path='/tables-config/:id' element={<TableConfigsShow />} />
        <Route path='/migration-projects' element={<ProjectsList />} />
        <Route path='/migration-project/:id' element={<ProjectForm />} />

        <Route
          path='/migration-project/:id/mapping'
          element={<MappingPage />}
        />
      </Route>
    </Routes>
  );
}

export default App;
