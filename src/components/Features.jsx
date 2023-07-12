import React, { useEffect, useState, useRef } from 'react';
import { FaRocket, FaLock, FaCode } from 'react-icons/fa';

const FeaturesSection = () => {
  const [isVisible, setIsVisible] = useState([false, false, false]);
  const featureRefs = useRef([React.createRef(), React.createRef(), React.createRef()]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setIsVisible((prevState) => {
            const updatedState = [...prevState];
            updatedState[index] = true;
            return updatedState;
          });
        }
      });
    }, { threshold: 0.8 });

    featureRefs.current.forEach((ref) => observer.observe(ref.current));

    return () => {
      featureRefs.current.forEach((ref) => observer.unobserve(ref.current));
    };
  }, []);

  const featureAnimationClass = (index) => isVisible[index] ? 'transform scale-100 opacity-100' : 'transform scale-90 opacity-0';

  const featureElements = [
    { Icon: FaRocket, title: 'Feature 1' },
    { Icon: FaLock, title: 'Feature 2' },
    { Icon: FaCode, title: 'Feature 3' },
  ];

  return (
    <div id="features" className="bg-gray-800 text-white py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-8 text-center font-mono">
          Explore Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {featureElements.map((feature, index) => (
            <div
              ref={featureRefs.current[index]}
              key={index}
              className={`bg-gray-700 p-6 rounded-lg transition duration-700 ease-out ${featureAnimationClass(index)}`}
            >
              <feature.Icon className="text-4xl mb-4" />
              <h3 className="text-2xl font-semibold mb-4 font-mono">{feature.title}</h3>
              <p className="text-lg font-mono">
                Dummy feature description. Elaborate on the benefits and how it
                can improve the user experience.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;
