import styles from '../styles';
import { questions } from '../constants';
import { FiPlus, FiMinus } from 'react-icons/fi';
import React, { useState } from 'react'

const Faqs = () => {
  const [ activeQuestion, setActiveQuestion ] = useState(null);

  const toggleQuestion = (id) => {
    if (activeQuestion === id) {
      setActiveQuestion(null);
    } else {
      setActiveQuestion(id);
    }
  };

  return (
    <section id='faq' className={`${styles.paddingY}`}>
      <h1 className='text-center font-poppins ss:text-[32px] text-[22px] text-white'>Frequently Asked <span className='text-gradient'>Questions</span></h1>
      <div className="py-10 space-y-5">
          {questions.map((q, index) => (
            <div key={q.id}>
              <div
                className={`${
                  index > 0 ? 'border-t border-gray-700 pt-6' : ''
                } flex justify-between items-center cursor-pointer`}
                onClick={() => toggleQuestion(q.id)}
              >
                <h3 className="text-gradient poppins text-xl">{q.question}</h3>
                <div
                  className={`text-2xl transition-all duration-500 ease-in-out transform ${
                    activeQuestion === q.id ? 'rotate-180' : ''
                  }`}
                >
                  {activeQuestion === q.id ? <FiMinus color='white' /> : <FiPlus color='white' />}
                </div>
              </div>
              <div
                className={`${
                  activeQuestion === q.id ? 'max-h-32' : 'max-h-0'
                } overflow-hidden mt-4 poppins text-gray-300 transition-all duration-500 ease-in-out`}
              >
                <p className={`${styles.paragraph} mt-5`}>{q.answer}</p>
              </div>
            </div>
          ))}
        </div>
    </section>
  )
}

export default Faqs