import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Documents } from './pages/Documents/Documents';
import { EmployeesList } from './pages/Employees/EmployeesList';
import { EmployeeDetail } from './pages/Employees/EmployeeDetail';
import { Finance } from './pages/Finance/Finance';
import { Pipeline } from './pages/Pipeline/Pipeline';
import { ProjectsList } from './pages/Projects/ProjectsList';
import { AddProject } from './pages/Projects/AddProject';
import { ProjectDetail } from './pages/Projects/ProjectDetail';
import { Sales } from './pages/Sales/Sales';
import { Settings } from './pages/Settings/Settings';
import { Login } from './pages/Login/Login';

export default function App() {
  return (
    <Routes>
      <Route path='/login' element={<Login />} />
      <Route path='/' element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path='projects' element={<ProjectsList />} />
        <Route path='projects/new' element={<AddProject />} />
        <Route path='projects/:id' element={<ProjectDetail />} />
        <Route path='employees' element={<EmployeesList />} />
        <Route path='employees/:id' element={<EmployeeDetail />} />
        <Route path='sales' element={<Sales />} />
        <Route path='finance' element={<Finance />} />
        <Route path='pipeline' element={<Pipeline />} />
        <Route path='documents' element={<Documents />} />
        <Route path='settings' element={<Settings />} />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Route>
    </Routes>
  );
}
