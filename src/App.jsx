import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { AppProvider } from "./context/AppContext";
import { DonorProvider } from "./context/DonorContext";
import SplashScreen from "./components/SplashScreen";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Map from "./features/map";
import Chat from "./features/chat";
import Feed from "./pages/Feed";
import FamilyVault from "./pages/FamilyVault";
import Passport from "./pages/Passport";

function AppRoutes() {
  const { dir, lang } = useLanguage();
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/map" element={<Map />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/feed" element={<Feed />} />
      <Route path="/family" element={<FamilyVault />} />
      <Route path="/passport" element={<Passport />} />
    </Routes>
  );
}

function AppShell() {
  const [showSplash, setShowSplash] = useState(true);
  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <DonorProvider>
        <AppProvider>
          <AppShell />
        </AppProvider>
      </DonorProvider>
    </LanguageProvider>
  );
}
