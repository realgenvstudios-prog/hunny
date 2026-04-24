import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar/Navbar';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import SandwichesPage from './pages/SandwichesPage';
import SaladsPage from './pages/SaladsPage';
import ShawarmaPage from './pages/ShawarmaPage';
import FriesPage from './pages/FriesPage';
import WafflesPage from './pages/WafflesPage';
import PastriesPage from './pages/PastriesPage';
import RiceMealsPage from './pages/RiceMealsPage';
import FreshJuicePage from './pages/FreshJuicePage';
import IceCreamsPage from './pages/IceCreamsPage';
import ChickenWingsPage from './pages/ChickenWingsPage';
import PancakesPage from './pages/PancakesPage';
import CateringPage from './pages/CateringPage';
import CateringBuildPage from './pages/CateringBuildPage';
import ContactPage from './pages/ContactPage';
import AuthPage from './pages/AuthPage';
import CartPage from './pages/CartPage';
import MyOrdersPage from './pages/MyOrdersPage';
import ChipsDipsPage from './pages/ChipsDipsPage';
import JuicesBoxPage from './pages/JuicesBoxPage';
import NotFoundPage from './pages/NotFoundPage';
import './App.css';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/menu/sandwiches" element={<SandwichesPage />} />
          <Route path="/menu/salads" element={<SaladsPage />} />
          <Route path="/menu/shawarma" element={<ShawarmaPage />} />
          <Route path="/menu/fries" element={<FriesPage />} />
          <Route path="/menu/waffles" element={<WafflesPage />} />
          <Route path="/menu/pastries" element={<PastriesPage />} />
          <Route path="/menu/rice-meals" element={<RiceMealsPage />} />
          <Route path="/menu/fresh-juice" element={<FreshJuicePage />} />
          <Route path="/menu/ice-creams" element={<IceCreamsPage />} />
          <Route path="/menu/chicken-wings" element={<ChickenWingsPage />} />
          <Route path="/menu/pancakes" element={<PancakesPage />} />
          <Route path="/catering" element={<CateringPage />} />
          <Route path="/catering/build" element={<CateringBuildPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/signin" element={<AuthPage />} />
          <Route path="/join" element={<AuthPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<MyOrdersPage />} />
          <Route path="/chips-dips" element={<ChipsDipsPage />} />
          <Route path="/juices-box" element={<JuicesBoxPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </>
  );
}

export default App;

