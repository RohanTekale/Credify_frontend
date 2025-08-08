import React, { useState } from 'react';
import BackgroundParticles from '../components/BackgroundParticles';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'What is Credify?',
      answer: 'Credify is a modern financial platform offering secure and efficient solutions.',
    },
    {
      question: 'How do I sign up?',
      answer: 'Click "Get Started" on the homepage or navigate to the Register page.',
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, we use industry-standard encryption to protect your data.',
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0F0F1C] to-[#1A1B2F] flex items-center justify-center px-4">
      <BackgroundParticles />
      <div className="relative z-10 text-white max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">Frequently Asked Questions</h1>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-[#1F2235] p-4 rounded-xl shadow-xl">
              <button
                className="w-full text-left text-lg font-semibold flex justify-between items-center"
                onClick={() => toggleFAQ(index)}
              >
                {faq.question}
                <span>{openIndex === index ? '-' : '+'}</span>
              </button>
              {openIndex === index && (
                <p className="text-gray-400 mt-2">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;