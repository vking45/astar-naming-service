import NavBar from './components/NavBar.jsx';
import Hero from './components/Hero.jsx';
import styles from './styles.js';
import Faqs from './components/Faqs.jsx';

const App = () => {
  return (
    <div className="bg-primary w-full overflow-hidden">
      <div className={`${styles.paddingX} ${styles.flexCenter}`}>
        <div className={`${styles.boxWidth}`}>
          <NavBar />
        </div>
      </div>

      <div className={`bg-primary ${styles.flexStart}`}>
        <div className={`${styles.boxWidth}`}>
          <Hero />
        </div>
      </div>

      <div className={`bg-primary ${styles.paddingX} ${styles.flexStart}`}>
        <div className={`${styles.boxWidth}`}>
          {/* Features
          How It Works
          FAQs
          Footer */}
          <Faqs />
        </div>
      </div>
    </div>
  )
}

export default App