import React, { useState } from 'react';
import { FiPlus, FiMinus } from 'react-icons/fi';

const FAQ = () => {
  const [activeQuestion, setActiveQuestion] = useState(null);

  const questions = [
    {
      id: 1,
      question: 'What is Polkadot Naming Service?',
      answer: 'Polkadot Naming Service is a decentralized domain name system built on the Polkadot network, providing an easy-to-use interface for managing domain names.',
    },
    {
      id: 2,
      question: 'How do I register a domain?',
      answer: 'To register a domain, search for the desired domain using our search bar and follow the registration process. After completing the payment, your domain will be registered.',
    },
    {
      id: 3,
      question: 'What are the benefits of using Polkadot Naming Service?',
      answer: 'Using Polkadot Naming Service offers a number of benefits, such as increased security, censorship resistance, and easy integration with blockchain-based applications.',
    },
    {
      id: 4,
      question: 'Can I transfer my domain to another owner?',
      answer: 'Yes, you can transfer your domain to another owner by following the domain transfer process on our platform. This ensures a secure and transparent transfer of ownership.',
    },
    {
      id: 5,
      question: 'How do I link my domain to an IPFS hash?',
      answer: 'To link your domain to an IPFS hash, you can use the Polkadot Naming Service dashboard to configure your domain settings and input the IPFS hash you want to link it to.',
    },
  ];

  const toggleQuestion = (id) => {
    if (activeQuestion === id) {
      setActiveQuestion(null);
    } else {
      setActiveQuestion(id);
    }
  };

  return (
    <div className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-8 text-center bebas-neue transition duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-105">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {questions.map((q, index) => (
            <div key={q.id}>
              <div
                className={`${
                  index > 0 ? 'border-t border-gray-700 pt-6' : ''
                } flex justify-between items-center cursor-pointer`}
                onClick={() => toggleQuestion(q.id)}
              >
                <h3 className="font-bold poppins text-xl">{q.question}</h3>
                <div
                  className={`text-2xl transition-all duration-500 ease-in-out transform ${
                    activeQuestion === q.id ? 'rotate-180' : ''
                  }`}
                >
                  {activeQuestion === q.id ? <FiMinus /> : <FiPlus />}
                </div>
              </div>
              <div
                className={`${
                  activeQuestion === q.id ? 'max-h-32' : 'max-h-0'
                } overflow-hidden mt-4 poppins text-gray-300 transition-all duration-500 ease-in-out`}
              >
                <p>{q.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
