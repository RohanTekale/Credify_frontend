import React, { useState } from 'react';
import Tilt from 'react-parallax-tilt';

const CreditCard3D = () => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <Tilt
      tiltMaxAngleX={25}  // Increased for pronounced left-right tilt as per image
      tiltMaxAngleY={10}  // Slight vertical tilt to match image perspective
      perspective={800}   // Adjusted for a more dramatic 3D effect
      scale={1.1}         // Slightly larger scale to emphasize 3D
      className="w-full max-w-lg mx-auto" // Increased width to match image size
    >
      <div
        className="relative w-full h-64 cursor-pointer"
        onClick={handleCardClick}
        style={{ transformStyle: 'preserve-3d', transition: 'transform 0.6s' }}
      >
        <div
          className={`absolute w-full h-full rounded-xl shadow-xl bg-gradient-to-br from-[#1A1F2B] to-[#2B2F3D] backface-hidden ${isFlipped ? 'hidden' : 'block'}`}
        >
          {/* Front of the card */}
          <div className="p-6 text-white">
            <div className="flex justify-between items-center mb-6">
              <div className="w-12 h-8 bg-gray-300 rounded flex items-center justify-center"></div> {/* Chip */}
              <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                <span className="text-xs">☑</span> {/* Contactless symbol */}
              </div>
            </div>
            <p className="text-lg tracking-widest mb-6">1234 5678 9012 3456</p>
            <div className="flex justify-between text-sm">
              <div>
                <p className="text-gray-400">FROM</p>
                <p className="font-semibold">John Doe</p>
              </div>
            </div>
          </div>
        </div>
        <div
          className={`absolute w-full h-full rounded-xl shadow-xl bg-gradient-to-br from-[#1A1F2B] to-[#2B2F3D] backface-hidden ${isFlipped ? 'block' : 'hidden'}`}
          style={{ transform: 'rotateY(180deg)' }}
        >
          {/* Back of the card */}
          <div className="p-6 text-white">
            <div className="h-12 bg-gray-800 w-full mt-4 rounded"></div> {/* Magnetic strip */}
            <div className="mt-8 flex justify-end">
              <div>
                <p className="text-sm text-gray-400">CVV</p>
                <p className="font-semibold bg-white text-black px-4 py-1 rounded">123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Tilt>
  );
};

export default CreditCard3D;