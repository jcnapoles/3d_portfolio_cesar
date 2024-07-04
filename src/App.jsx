import { BrowserRouter } from "react-router-dom";
import { useEffect } from 'react';
import { About, Contact, Experience, Feedbacks, Hero, Navbar, Tech, Works, StarsCanvas } from "./components";

function useFavicon() {
  useEffect(() => {
    const link = document.querySelector("link[rel*='icon']");
    const theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

    if (theme === 'dark') {
      link.href = '/favicon-white.svg';
    } else {
      link.href = '/favicon-black.svg';
    }
  }, []);
}

const App = () => {
  useFavicon();
  return (
    <BrowserRouter>
      <div className='relative z-0 bg-primary'>        
        <Navbar />
        <Hero />
        <About />
        <Experience />
        <Tech />
        <Works />
        <Feedbacks />       
        <Contact />     
        <StarsCanvas />
      </div>
    </BrowserRouter>
  );
}

export default App;
