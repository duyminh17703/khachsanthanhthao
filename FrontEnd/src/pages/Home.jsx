// src/pages/Home.jsx
import React from "react";
import MainLayout from "../layout/MainLayout";
import Hero from "../components/home/Hero";
import FeatureRooms from "../components/home/FeatureRooms";
import FeatureOffers from "../components/home/FeatureOffers";
import FeatureDiscover from "../components/home/FeatureDiscover";
import FeatureFood from "../components/home/FeatureFood";
import FeatureServices from "../components/home/FeatureServices";
import Footer from "../layout/Footer";

const Home = () => {
  return (
    <MainLayout>
      <Hero />
      <FeatureRooms />
      <FeatureOffers />
      <FeatureDiscover />
      <FeatureFood />
      <FeatureServices />
      <Footer />
    </MainLayout>
  );
};

export default Home;
