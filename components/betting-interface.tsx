"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface BettingOption {
  multiplier: string
  isHighlighted?: boolean
  isRed?: boolean
}

export default function BettingInterface() {
  const [selectedMultiplier, setSelectedMultiplier] = useState<string>("6X")
  const [currentBid, setCurrentBid] = useState<number>(200)
  const [timer, setTimer] = useState<string>("00:30")

  const wheelOptions: BettingOption[] = [
    { multiplier: "2X" },
    { multiplier: "3X" },
    { multiplier: "2X" },
    { multiplier: "9X", isHighlighted: true },
    { multiplier: "2X" },
    { multiplier: "3X" },
    { multiplier: "2X" },
    { multiplier: "6X", isHighlighted: true },
    { multiplier: "2X" },
    { multiplier: "3X" },
    { multiplier: "2X" },
    { multiplier: "17X", isRed: true },
    { multiplier: "2X" },
    { multiplier: "3X" },
    { multiplier: "2X" },
    { multiplier: "$" },
  ]

  const bottomOptions = ["3X", "2X", "6X", "3X", "2X"]

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Bid Wheel */}
      <Card className="p-4 flex-1">
        <div className="relative">
          <div className="flex flex-col items-center">
            <div className="w-full flex justify-center items-center mb-4">
              <div className="relative">
                <div className="w-64 h-64 rounded-full bg-dark-200 flex items-center justify-center">
                  <div className="w-44 h-44 rounded-full bg-dark-100 flex flex-col items-center justify-center">
                    <div className="text-4xl font-semibold text-white">{currentBid}$</div>
                    <div className="text-xs text-gray-400">current bid</div>
                  </div>
                </div>
                <div className="absolute top-0 left-0 w-full h-full">
                  {wheelOptions.map((option, index) => {
                    const angle = (index * 22.5) - 90
                    const radians = angle * Math.PI / 180
                    const radius = 112
                    const x = Math.cos(radians) * radius + 128
                    const y = Math.sin(radians) * radius + 128
                    
                    return (
                      <div 
                        key={index}
                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 px-2 py-1 rounded ${
                          option.isHighlighted 
                            ? 'bg-gold-400 text-dark-100 font-bold' 
                            : option.isRed 
                              ? 'bg-red-600 text-white font-bold'
                              : option.multiplier === "$" 
                                ? 'bg-green-600 text-white font-bold'
                                : 'bg-gray-600 text-white'
                        }`}
                        style={{
                          left: `${x}px`,
                          top: `${y}px`,
                        }}
                      >
                        {option.multiplier}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
            
            <div className="flex justify-center gap-2 mt-4">
              {bottomOptions.map((option, index) => {
                const isSelected = option === selectedMultiplier
                return (
                  <button 
                    key={index}
                    className={`w-12 h-12 flex items-center justify-center ${
                      isSelected 
                        ? 'bg-gold-400 text-dark-100' 
                        : 'bg-dark-200 text-white'
                    } rounded`}
                    onClick={() => setSelectedMultiplier(option)}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <Button variant="gold" className="w-full">Place a Bet</Button>
        </div>
      </Card>
      
      {/* Timer Wheel */}
      <Card className="p-4 flex-1">
        <div className="relative">
          <div className="flex flex-col items-center">
            <div className="w-full flex justify-center items-center mb-4">
              <div className="relative">
                <div className="w-64 h-64 rounded-full bg-dark-200 flex items-center justify-center">
                  <div className="w-44 h-44 rounded-full bg-dark-100 flex flex-col items-center justify-center">
                    <div className="text-4xl font-semibold text-white">{timer}</div>
                    <div className="text-xs text-gray-400">until next round</div>
                  </div>
                </div>
                <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
                  <div className="text-gold-400">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L4 9H11L9 15L20 8H13L15 2L12 2Z" fill="currentColor" />
                    </svg>
                  </div>
                </div>
                <div className="absolute top-0 left-0 w-full h-full">
                  {wheelOptions.map((option, index) => {
                    const angle = (index * 22.5) - 90
                    const radians = angle * Math.PI / 180
                    const radius = 112
                    const x = Math.cos(radians) * radius + 128
                    const y = Math.sin(radians) * radius + 128
                    
                    return (
                      <div 
                        key={index}
                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 px-2 py-1 rounded ${
                          option.isHighlighted 
                            ? 'bg-gold-400 text-dark-100 font-bold' 
                            : option.isRed 
                              ? 'bg-red-600 text-white font-bold'
                              : option.multiplier === "$" 
                                ? 'bg-green-600 text-white font-bold'
                                : 'bg-gray-600 text-white'
                        }`}
                        style={{
                          left: `${x}px`,
                          top: `${y}px`,
                        }}
                      >
                        {option.multiplier}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
            
            <div className="mt-6 w-full">
              <p className="text-white text-center mb-2">Bet Amount</p>
              <div className="flex items-center justify-center">
                <div className="bg-dark-100 w-64 h-12 rounded-md relative">
                  <div className="absolute right-1 top-1 bottom-1 bg-gold-400 text-dark-100 px-3 rounded flex items-center justify-center font-semibold">
                    235
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
