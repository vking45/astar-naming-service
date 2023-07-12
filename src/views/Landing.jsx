import React from 'react'
import '../App.css'; 
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import HeroSection2 from '../components/HeroSection2';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import FAQ from '../components/FAQ';
import HeroSection3 from '../components/HeroSection3'
import Animated from '../components/Animated';
function Landing() {
  return (
    <div>
    <Animated />
    <Navbar />
    <HeroSection />
    <HeroSection2 />
    <HeroSection3 />
    <Features />
    <HowItWorks />
    <FAQ />
    </div>
  )
}

export default Landing;