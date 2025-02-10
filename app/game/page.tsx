'use client';

import { Metadata } from "next";
import { useState, useEffect } from "react";
import Image from 'next/image';
import { Scenes, Scene, Option } from "./textNodes"; 

const imagePaths: { [key: number]: string } = {
  0: "/images/game/placeholder-title.jpeg",
  101: "/images/game/placeholder.jpeg",
  102: "/images/game/placeholder.jpeg",
  103: "/images/game/placeholder.jpeg",
  104: "/images/game/placeholder.jpeg",
};

export default function Game() {
  // Single variable for fade duration in ms
  const fadeDuration = 700;
  
  const [currentScene, setCurrentScene] = useState<number>(0);
  const [previousOptionText, setPreviousOptionText] = useState<string>('');
  // Only store opacity state; transition properties are defined inline
  const [fade, setFade] = useState("opacity-100");

  const currentNode: Scene | undefined = Scenes.find(
    (node) => node.id === currentScene
  );

  if (!currentNode) {
    return <div>Error: Scene not found</div>; 
  }

  const handleOptionSelect = (nextScene: number, optionText: string) => {
    setFade("opacity-0");
    setTimeout(() => {
      setPreviousOptionText(optionText);
      setCurrentScene(nextScene);
      setFade("opacity-100");
    }, fadeDuration);
  };

  return (
    <div className="container max-w-6xl py-6 lg:py-10">
      {/* <h1 className="block font-black text-4xl lg:text-5xl text-center mb-10">
        BAC Love Story
      </h1> */}
      
      <div className="flex flex-col mx-auto p-5 border border-gray-300 rounded-lg lg:w-3/4">
        <div 
          className={`flex-1 overflow-y-auto mb-2 transition-opacity ${fade}`} 
          style={{ transitionDuration: `${fadeDuration}ms` }}
        >
          {currentNode.id === 0 && (
            <center><b>Title Screen</b></center>
          )}

          {currentNode.id > 0 && (
            <>
              <center>
                <b>Scene #{currentNode.id}</b>
                {previousOptionText && (
                  <p><i>Previously selected: {previousOptionText}</i></p>
                )}
              </center>
              <p style={{ whiteSpace: 'pre-line' }}>{currentNode.text}</p>
            </>
          )}

          {(currentNode.id === 0 || currentNode.id > 100) && (
              <Image 
                src={imagePaths[currentNode.id]} 
                alt="Scene Image" 
                width={500}
                height={300}
                className="mt-4 mb-4 mx-auto w-full lg:w-1/2" 
              />
          )}

        </div>
        <div 
          className={`flex flex-col lg:flex-row gap-2 justify-center transition-opacity ${fade}`} 
          style={{ transitionDuration: `${fadeDuration}ms` }}
        >
          {currentNode.options.map((option: Option, index) => (
            <button
              key={`${currentNode.id}-${index}`}
              onClick={() => handleOptionSelect(option.nextScene, option.text)}
              className="px-4 py-2 bg-[#ea4167] text-white text-center text-base cursor-pointer rounded-md transition-colors hover:bg-[#d03457] active:scale-90"
            >
              {option.text}
            </button>
          ))}
          {currentNode.options.length === 0 && <p>Game Over</p>}
        </div>
      </div>
    </div>
  );
}
