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
          <Route path='/list-rooms' element={<RoomPage />} />
          <Route path='rooms/:slug' element={<RoomDetails />} />
          <Route path='/checkout' element={<CheckoutPage />} />
          <Route path="/checkout-success" element={<CheckoutSuccess />} />
          <Route path="/checkout-fail" element={<CheckoutFail />} />
          <Route path='/offers' element={<OfferPage />} />
          <Route path='/offers/:slug' element={<OfferDetails />} />
          <Route path="/experience" element={<ServiceListingPage serviceType="EXPERIENCE" />} />
          <Route path="/dining" element={<ServiceListingPage serviceType="DINING" />} />
          <Route path="/discover" element={<ServiceListingPage serviceType="DISCOVER" />} />
          <Route path='/:serviceType/:slug' element={<ServiceDetails />} />
          <Route path='/find' element={<FindPage />} />
          <Route path='/contact' element={<ContactPage />} />
          
          {/* ... Admin Routes ... */}
          <Route path='/hotel/admin' element={<AdminLogin />} />
          <Route path='/hotel/admin/dashboard' element={<Dashboard />} />
          <Route path='/hotel/admin/rooms' element={<RoomManager />} />
          <Route path='/hotel/admin/rooms/add' element={<RoomForm />} />
          <Route path='/hotel/admin/rooms/edit/:id' element={<RoomForm />} />
          <Route path='/hotel/admin/invoices' element={<InvoiceManager />} />
          <Route path='/hotel/admin/invoices/:code' element={<InvoiceDetails />} />
          <Route 
              path="/hotel/admin/experience" 
              element={<ServiceManager pageType="EXPERIENCE" />} 
          />
          <Route 
              path="/hotel/admin/experience/add" 
              element={<ServiceForm pageType="EXPERIENCE" />} 
          />
          <Route 
              path="/hotel/admin/experience/edit/:id" 
              element={<ServiceForm pageType="EXPERIENCE" />} 
          />
          <Route 
              path="/hotel/admin/dining" 
              element={<ServiceManager pageType="DINING" />} 
          />
          <Route 
              path="/hotel/admin/dining/add" 
              element={<ServiceForm pageType="DINING" />} 
          />
          <Route 
              path="/hotel/admin/dining/edit/:id" 
              element={<ServiceForm pageType="DINING" />} 
          />
          <Route 
              path="/hotel/admin/discover" 
              element={<ServiceManager pageType="DISCOVER" />} 
          />
          <Route 
              path="/hotel/admin/discover/add" 
              element={<ServiceForm pageType="DISCOVER" />} 
          />
          <Route 
              path="/hotel/admin/discover/edit/:id" 
              element={<ServiceForm pageType="DISCOVER" />} 
          />
          <Route path='/hotel/admin/offers' element={<OfferManager />} />
          <Route path='/hotel/admin/offers/add' element={<OfferForm />} />
          <Route path='/hotel/admin/offers/edit/:id' element={<OfferForm />} />
          <Route path="/hotel/admin/employees" element={<EmployeeManager />} />
        </Routes>
    </CartProvider>
  )
}

export default App
