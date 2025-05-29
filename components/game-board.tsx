'use client';

import { useState, useEffect } from 'react';
import PlayerCard from './player-card';
import { Button } from '@/components/ui/button';
import { Moon, Shield, Check, X, Trash2, RotateCcw, Vote } from 'lucide-react';

// Define player roles
type PlayerRole = 'Civilian' | 'Sheriff' | 'Mafia Don' | 'Mafia';

// Define player states
type PlayerState =
	| 'default'
	| 'shot'
	| 'sheriff'
	| 'verified-red'
	| 'verified-black'
	| 'deleted'
	| 'voting';

// Define player data structure
interface Player {
	id: number;
	name: string;
	role: PlayerRole;
	state: PlayerState;
	isRevealed: boolean;
}

// Generate initial players with specified roles
const generatePlayers = (): Player[] => {
	// Create array with exact role distribution
	const roles: PlayerRole[] = [
		'Civilian',
		'Civilian',
		'Civilian',
		'Civilian',
		'Civilian',
		'Civilian',
		'Sheriff',
		'Mafia Don',
		'Mafia',
		'Mafia',
	];

	// Shuffle roles
	for (let i = roles.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[roles[i], roles[j]] = [roles[j], roles[i]];
	}

	return Array.from({ length: 10 }, (_, i) => ({
		id: i + 1,
		name: `Player ${i + 1}`,
		role: roles[i],
		state: 'default',
		isRevealed: false,
	}));
};

export default function GameBoard() {
	// Используем null для начального состояния, чтобы избежать гидратации
	const [players, setPlayers] = useState<Player[] | null>(null);
	const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
	const [currentAction, setCurrentAction] = useState<PlayerState | null>(null);

	// Инициализируем состояние игроков только на клиенте
	useEffect(() => {
		setPlayers(generatePlayers());
	}, []);

	// Handle card click
	const handleCardClick = (id: number) => {
		if (!players) return;

		if (currentAction) {
			// Apply action to the player
			setPlayers(
				players.map((player) =>
					player.id === id ? { ...player, state: currentAction } : player
				)
			);
			setCurrentAction(null);
		} else {
			// Toggle reveal
			setPlayers(
				players.map((player) =>
					player.id === id
						? { ...player, isRevealed: !player.isRevealed }
						: player
				)
			);
		}

		setSelectedPlayer(id);
	};

	// Reset the game
	const resetGame = () => {
		setPlayers(generatePlayers());
		setSelectedPlayer(null);
		setCurrentAction(null);
	};

	// Select an action
	const selectAction = (action: PlayerState) => {
		setCurrentAction((prevAction) => (prevAction === action ? null : action));
	};

	// Показываем загрузку, пока не инициализированы игроки
	if (!players) {
		return (
			<div className="flex items-center justify-center h-64 text-white">
				Загрузка игровой доски...
			</div>
		);
	}

	return (
		<div className="space-y-4 bg-dark-300 p-4 rounded-xl">
			<div className="grid grid-cols-5 gap-3">
				{players.slice(0, 5).map((player) => (
					<PlayerCard
						key={player.id}
						player={player}
						isSelected={selectedPlayer === player.id}
						onClick={() => handleCardClick(player.id)}
					/>
				))}
			</div>

			<div className="grid grid-cols-5 gap-3">
				{players.slice(5, 10).map((player) => (
					<PlayerCard
						key={player.id}
						player={player}
						isSelected={selectedPlayer === player.id}
						onClick={() => handleCardClick(player.id)}
					/>
				))}
			</div>

			<div className="border-t border-dark-500 pt-3">
				<h3 className="text-sm font-medium mb-2 text-white">Player Actions</h3>
				<div className="flex flex-wrap gap-2">
					<Button
						variant="outline"
						size="sm"
						className={`border-dark-500 text-white ${
							currentAction === 'shot' ? 'bg-dark-400' : 'bg-dark-300'
						}`}
						onClick={() => selectAction('shot')}
					>
						<Moon className="mr-1 h-3 w-3 text-red-500" />
						Shot
					</Button>

					<Button
						variant="outline"
						size="sm"
						className={`border-dark-500 text-white ${
							currentAction === 'sheriff' ? 'bg-dark-400' : 'bg-dark-300'
						}`}
						onClick={() => selectAction('sheriff')}
					>
						<Shield className="mr-1 h-3 w-3 text-gold-400" />
						Sheriff
					</Button>

					<Button
						variant="outline"
						size="sm"
						className={`border-dark-500 text-white ${
							currentAction === 'verified-red' ? 'bg-dark-400' : 'bg-dark-300'
						}`}
						onClick={() => selectAction('verified-red')}
					>
						<Check className="mr-1 h-3 w-3 text-green-500" />
						Red
					</Button>

					<Button
						variant="outline"
						size="sm"
						className={`border-dark-500 text-white ${
							currentAction === 'verified-black' ? 'bg-dark-400' : 'bg-dark-300'
						}`}
						onClick={() => selectAction('verified-black')}
					>
						<X className="mr-1 h-3 w-3 text-red-500" />
						Black
					</Button>

					<Button
						variant="outline"
						size="sm"
						className={`border-dark-500 text-white ${
							currentAction === 'voting' ? 'bg-dark-400' : 'bg-dark-300'
						}`}
						onClick={() => selectAction('voting')}
					>
						<Vote className="mr-1 h-3 w-3 text-blue-400" />
						Voting
					</Button>

					<Button
						variant="outline"
						size="sm"
						className={`border-dark-500 text-white ${
							currentAction === 'deleted' ? 'bg-dark-400' : 'bg-dark-300'
						}`}
						onClick={() => selectAction('deleted')}
					>
						<Trash2 className="mr-1 h-3 w-3 text-gray-400" />
						Delete
					</Button>

					<Button
						variant="outline"
						size="sm"
						className={`border-dark-500 text-white ${
							currentAction === 'default' ? 'bg-dark-400' : 'bg-dark-300'
						}`}
						onClick={() => selectAction('default')}
					>
						<RotateCcw className="mr-1 h-3 w-3 text-blue-400" />
						Reset
					</Button>
				</div>
			</div>

			<div className="flex justify-between items-center border-t border-dark-500 pt-3 text-white">
				<div>
					{selectedPlayer && (
						<div className="text-xs">
							Selected:{' '}
							<span className="font-medium">Player {selectedPlayer}</span>
							{currentAction && (
								<span className="ml-2 text-mafia-600">
									• Action: {currentAction.replace('-', ' ')}
								</span>
							)}
						</div>
					)}
				</div>
				<Button
					variant="destructive"
					size="sm"
					onClick={resetGame}
					className="text-xs py-1 h-7"
				>
					Reset Game
				</Button>
			</div>

			<div className="border-t pt-3">
				<h3 className="text-sm font-medium mb-2 text-mafia-800 dark:text-mafia-300">
					Legend
				</h3>
				<div className="grid grid-cols-4 gap-2 text-xs">
					<div className="flex items-center">
						<Shield className="h-3 w-3 mr-1 text-mafia-600" />
						<span>Sheriff</span>
					</div>
					<div className="flex items-center">
						<Check className="h-3 w-3 mr-1 text-green-600" />
						<span>Verified Civilian</span>
					</div>
					<div className="flex items-center">
						<X className="h-3 w-3 mr-1 text-mafia-600" />
						<span>Verified Mafia</span>
					</div>
					<div className="flex items-center">
						<Vote className="h-3 w-3 mr-1 text-blue-600" />
						<span>Voting</span>
					</div>
				</div>
			</div>
		</div>
	);
}
