import { Routes, Route } from 'react-router-dom'
import './App.css'
import NavBar from './component/NavBar/NavBar'
import InputForm from './component/InputForm/InputForm'
import Footer from './component/Footer/footer'
import Login from './component/Auth/Login'
import Register from './component/Auth/Register'
import AdminPanel from './component/Admin/AdminPanel'
import UserDashboard from './component/Dashboard/UserDashboard'
import Documentation from './component/Documentation/Documentation'
import CompanyList from './component/CompanyList/CompanyList'
import CompanyApplication from './component/CompanyApplication/CompanyApplication'

const App = () => {
  return (
    <div>
      <NavBar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<InputForm />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/documentations" element={<Documentation />} />
          <Route path="/companies" element={<CompanyList />} />
          <Route path="/apply/:companyId" element={<CompanyApplication />} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}

export default App