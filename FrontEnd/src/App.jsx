import React from 'react'
import { Route, Routes } from 'react-router-dom'
import AdminLogin from './pages/Admin/AdminLogin'
import Dashboard from './pages/Admin/Dashboard'
import Home from './pages/Home'
import RoomPage from './pages/Room'
import RoomDetails from './pages/RoomDetails'
import { CartProvider } from './context/CartContext'
import CartSidebar from './components/minicomponents/CartSidebar'
import RoomManager from './pages/Admin/RoomManager'
import RoomForm from './pages/Admin/RoomForm'
import CheckoutPage from './pages/CheckoutPage'
import InvoiceManager from './pages/Admin/InvoiceManager'
import InvoiceDetails from './pages/Admin/InvoiceDetails'
import ServiceDetails from './pages/ServiceDetails'
import ServiceManager from './pages/Admin/ServiceManager'
import ServiceForm from './pages/Admin/ServiceForm'
import ServiceListingPage from './pages/ServicePage'
import FindPage from './pages/Find'
import OfferPage from './pages/OfferPage'
import OfferManager from './pages/Admin/OfferManager'
import OfferForm from './pages/Admin/OfferForm'
import OfferDetails from './pages/OfferDetails'
import CheckoutSuccess from './pages/CheckoutSucessPage'
import CheckoutFail from './pages/CheckoutFailPage'
import ContactPage from './pages/ContactPage'
import EmployeeManager from './pages/Admin/EmployeeManager'
import ScrollToTop from './components/minicomponents/ScrollToTop'
import { Toaster } from 'react-hot-toast';

const App = () => {
  return (
    <CartProvider>
        <CartSidebar />
        <Toaster position="top-right" reverseOrder={false} />
        <ScrollToTop />
        <Routes>
          {/* ... Client Routes ... */}
          <Route path='/' element={<Home />} />
          <Route path='/danh-sach-phong' element={<RoomPage />} />
          <Route path='/danh-sach-phong/:slug' element={<RoomDetails />} />
          <Route path='/thanh-toan' element={<CheckoutPage />} />
          <Route path="/checkout-success" element={<CheckoutSuccess />} />
          <Route path="/checkout-fail" element={<CheckoutFail />} />
          <Route path='/uu-dai' element={<OfferPage />} />
          <Route path='/uu-dai/:slug' element={<OfferDetails />} />
          <Route path="/trai-nghiem" element={<ServiceListingPage serviceType="EXPERIENCE" />} />
          <Route path="/am-thuc" element={<ServiceListingPage serviceType="DINING" />} />
          <Route path="/kham-pha" element={<ServiceListingPage serviceType="DISCOVER" />} />
          <Route path="/trai-nghiem/:slug" element={<ServiceDetails />} />
          <Route path="/kham-pha/:slug" element={<ServiceDetails />} />
          <Route path="/am-thuc/:slug" element={<ServiceDetails />} />
          <Route path='/tim-kiem' element={<FindPage />} />
          <Route path='/lien-he' element={<ContactPage />} />
          
          {/* ... Admin Routes ... */}
          <Route path='/hotel/admin' element={<AdminLogin />} />
          <Route path='/hotel/admin/dashboard' element={<Dashboard />} />
          <Route path='/hotel/admin/phong' element={<RoomManager />} />
          <Route path='/hotel/admin/phong/them' element={<RoomForm />} />
          <Route path='/hotel/admin/phong/sua/:id' element={<RoomForm />} />
          <Route path='/hotel/admin/hoa-don' element={<InvoiceManager />} />
          <Route path='/hotel/admin/hoa-don/:code' element={<InvoiceDetails />} />
          <Route 
              path="/hotel/admin/trai-nghiem" 
              element={<ServiceManager pageType="EXPERIENCE" />} 
          />
          <Route 
              path="/hotel/admin/trai-nghiem/them" 
              element={<ServiceForm pageType="EXPERIENCE" />} 
          />
          <Route 
              path="/hotel/admin/trai-nghiem/sua/:id" 
              element={<ServiceForm pageType="EXPERIENCE" />} 
          />
          <Route 
              path="/hotel/admin/am-thuc" 
              element={<ServiceManager pageType="DINING" />} 
          />
          <Route 
              path="/hotel/admin/am-thuc/them" 
              element={<ServiceForm pageType="DINING" />} 
          />
          <Route 
              path="/hotel/admin/am-thuc/sua/:id" 
              element={<ServiceForm pageType="DINING" />} 
          />
          <Route 
              path="/hotel/admin/kham-pha" 
              element={<ServiceManager pageType="DISCOVER" />} 
          />
          <Route 
              path="/hotel/admin/kham-pha/them" 
              element={<ServiceForm pageType="DISCOVER" />} 
          />
          <Route 
              path="/hotel/admin/kham-pha/sua/:id" 
              element={<ServiceForm pageType="DISCOVER" />} 
          />
          <Route path='/hotel/admin/uu-dai' element={<OfferManager />} />
          <Route path='/hotel/admin/uu-dai/them' element={<OfferForm />} />
          <Route path='/hotel/admin/uu-dai/sua/:id' element={<OfferForm />} />
          <Route path="/hotel/admin/nhan-vien" element={<EmployeeManager />} />
        </Routes>
    </CartProvider>
  )
}

export default App
