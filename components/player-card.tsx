'use client';

import { motion } from 'framer-motion';
import { Moon, Shield, Check, X, Trash2, Skull, Vote } from 'lucide-react';
import { Card } from '@/components/ui/card';

// Import types from game-board
interface Player {
	id: number;
	name: string;
	role: string;
	state: string;
	isRevealed: boolean;
}

interface PlayerCardProps {
	player: Player;
	isSelected: boolean;
	onClick: () => void;
}

// Role color mapping
const roleColors: Record<string, string> = {
	Civilian: 'bg-dark-300 text-blue-300',
	Sheriff: 'bg-dark-300 text-gold-400',
	'Mafia Don': 'bg-dark-300 text-red-500',
	Mafia: 'bg-dark-300 text-red-400',
};

export default function PlayerCard({
	player,
	isSelected,
	onClick,
}: PlayerCardProps) {
	// Determine if player is dead
	const isDead = player.state === 'shot' || player.state === 'deleted';

	// Get state indicator
	const getStateIndicator = () => {
		switch (player.state) {
			case 'shot':
				return <Moon className="absolute top-2 right-2 h-4 w-4 text-red-500" />;
			case 'sheriff':
				return (
					<Shield className="absolute top-2 right-2 h-4 w-4 text-gold-400" />
				);
			case 'verified-red':
				return (
					<Check className="absolute top-2 right-2 h-4 w-4 text-green-500" />
				);
			case 'verified-black':
				return <X className="absolute top-2 right-2 h-4 w-4 text-red-500" />;
			case 'deleted':
				return (
					<Trash2 className="absolute top-2 right-2 h-4 w-4 text-gray-400" />
				);
			case 'voting':
				return (
					<Vote className="absolute top-2 right-2 h-4 w-4 text-blue-400" />
				);
			default:
				return null;
		}
	};

	return (
		<div className="square-card-container">
			<motion.div
				initial={false}
				animate={{ rotateY: player.isRevealed ? 180 : 0 }}
				transition={{ duration: 0.6, type: 'spring' }}
				className="square-card preserve-3d cursor-pointer"
				onClick={onClick}
			>
				{/* Front of card */}
				<Card
					className={`absolute w-full h-full backface-hidden border ${
						isSelected ? 'border-gold-400' : 'border-dark-500'
					} ${isDead ? 'opacity-60' : ''} bg-dark-300 rounded-xl`}
				>
					<div className="p-3 text-center flex flex-col items-center justify-center h-full">
						<h3 className="font-medium text-sm">{player.name}</h3>
						{isDead && (
							<div className="mt-2 flex justify-center">
								<Skull className="h-6 w-6 text-gray-500" />
							</div>
						)}
						{getStateIndicator()}
					</div>
				</Card>

				{/* Back of card (role) */}
				<Card
					className={`absolute w-full h-full backface-hidden rotateY-180 border ${
						isSelected ? 'border-gold-400' : 'border-dark-500'
					} ${isDead ? 'opacity-60' : ''} bg-dark-300 rounded-xl`}
				>
					<div
						className={`p-3 text-center flex flex-col items-center justify-center h-full ${
							roleColors[player.role] || ''
						}`}
					>
						<h3 className="font-medium text-sm">{player.role}</h3>
						{getStateIndicator()}
					</div>
				</Card>
			</motion.div>
		</div>
	);
}
