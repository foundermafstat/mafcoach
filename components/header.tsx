'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ModeToggle } from './mode-toggle';
import { Button } from '@/components/ui/button';
import {
	MessageSquare,
	User,
	ChevronDown,
	Award,
	LogOut,
	Settings,
	Database,
	History,
	LayoutGrid,
} from 'lucide-react';
import { usePlayer } from './player-provider';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';

import { useHeader } from '@/components/header-context';

function HeaderInner() {
	const pathname = usePathname();
	const { isAIChatVisible, toggleAIChat, playerName, playerLevel } =
		usePlayer();

	// Navigation items divided by categories
	const mafiaTutorialItems = [
		{ name: 'Game Rules', path: '/rules' },
		{ name: 'Game Roles', path: '/roles' },
		{ name: 'Strategies', path: '/strategies' },
		{ name: 'Game Board', path: '/game-board' },
	];

	const adminItems = [
		{ name: 'API Settings', path: '/admin/settings' },
		{ name: 'API Keys', path: '/api-keys' },
		{ name: 'Database Management', path: '/admin/database' },
	];

	const sensayTrainingItems = [
		{ name: 'AI Training', path: '/training' },
		{ name: 'Replicas', path: '/replicas' },
		{ name: 'Chat History', path: '/chat-history' },
		{ name: 'Training Stats', path: '/training-stats' },
	];

	const gameItems = [
		{ name: 'Lobby', path: '/lobby' },
		{ name: 'Betting', path: '/betting' },
		{ name: 'Investment', path: '/investment' },
	];

	const experimentalItems = [
		{ name: 'Experimental API', path: '/experimental' },
	];

	const progressPercentage =
		(playerLevel.currentXP / playerLevel.requiredXP) * 100;

	const { headerState } = useHeader();
	return (
		<header className="border-b text-white">
			<div className="container mx-auto px-4 py-3 flex items-center justify-between">
				<div className="flex items-center gap-4">
					<h1 className="text-xl font-bold">MafCoach</h1>

					<nav className="hidden md:flex items-center gap-6">
						<Link
							href="/"
							className={`text-sm font-medium transition-colors hover:text-mafia-300 ${
								pathname === '/' ? 'text-mafia-300' : 'text-white'
							}`}
						>
							Home
						</Link>

						{/* Dropdown menu for mafia tutorial */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className="flex items-center gap-1 text-white hover:bg-mafia-800 hover:text-white px-2 py-1 h-auto"
								>
									<span className="text-sm font-medium">Mafia Tutorial</span>
									<ChevronDown size={14} />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								{mafiaTutorialItems.map((item) => (
									<DropdownMenuItem key={item.path} asChild>
										<Link
											href={item.path}
											className={
												pathname === item.path
													? 'bg-mafia-100 dark:bg-mafia-800'
													: ''
											}
										>
											{item.name}
										</Link>
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>

						{/* Dropdown menu for game pages */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className="flex items-center gap-1 text-white hover:bg-mafia-800 hover:text-white px-2 py-1 h-auto"
								>
									<span className="text-sm font-medium">Game</span>
									<ChevronDown size={14} />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								{gameItems.map((item) => (
									<DropdownMenuItem key={item.path} asChild>
										<Link
											href={item.path}
											className={
												pathname === item.path
													? 'bg-mafia-100 dark:bg-mafia-800'
													: ''
											}
										>
											{item.name}
										</Link>
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>

						{/* Dropdown menu for administration */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className="flex items-center gap-1 text-white hover:bg-mafia-800 hover:text-white px-2 py-1 h-auto"
								>
									<span className="text-sm font-medium">Administration</span>
									<ChevronDown size={14} />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								{adminItems.map((item) => (
									<DropdownMenuItem key={item.path} asChild>
										<Link
											href={item.path}
											className={
												pathname === item.path
													? 'bg-mafia-100 dark:bg-mafia-800'
													: ''
											}
										>
											{item.name}
										</Link>
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>

						{/* Dropdown menu for AI training through Sensay API */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className="flex items-center gap-1 text-white hover:bg-mafia-800 hover:text-white px-2 py-1 h-auto"
								>
									<span className="text-sm font-medium">AI Training</span>
									<ChevronDown size={14} />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								{sensayTrainingItems.map((item) => (
									<DropdownMenuItem key={item.path} asChild>
										<Link
											href={item.path}
											className={
												pathname === item.path
													? 'bg-mafia-100 dark:bg-mafia-800'
													: ''
											}
										>
											{item.name}
										</Link>
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>

						{/* Dropdown menu for experimental API */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className="flex items-center gap-1 text-white hover:bg-mafia-800 hover:text-white px-2 py-1 h-auto"
								>
									<span className="text-sm font-medium">Experimental</span>
									<ChevronDown size={14} />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								{experimentalItems.map((item) => (
									<DropdownMenuItem key={item.path} asChild>
										<Link
											href={item.path}
											className={
												pathname === item.path
													? 'bg-mafia-100 dark:bg-mafia-800'
													: ''
											}
										>
											{item.name}
										</Link>
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
					</nav>
				</div>

				<div className="flex items-center gap-3">
					<Button
						variant="ghost"
						size="icon"
						onClick={toggleAIChat}
						className="text-white hover:bg-mafia-800 hover:text-white"
						title={isAIChatVisible ? 'Hide AI Assistant' : 'Show AI Assistant'}
					>
						<MessageSquare
							className={isAIChatVisible ? 'text-mafia-300' : 'text-white'}
						/>
					</Button>

					<Button
						variant="ghost"
						size="icon"
						className="text-white hover:bg-mafia-800 hover:text-white"
						asChild
					>
						<Link href="/game-board" title="Game Board">
							<LayoutGrid className="h-5 w-5" />
						</Link>
					</Button>

					<ModeToggle />

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								className="flex items-center gap-2 text-white hover:bg-mafia-800 hover:text-white"
							>
								<div className="flex items-center gap-2">
									<div className="bg-mafia-700 rounded-full p-1">
										<User size={16} />
									</div>
									<span className="hidden sm:inline">{playerName}</span>
									<div className="flex items-center gap-1 bg-mafia-800 rounded-full px-2 py-0.5 text-xs">
										<Award size={12} className="text-yellow-400" />
										<span>{playerLevel.level}</span>
									</div>
								</div>
								<ChevronDown size={16} />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-64">
							<DropdownMenuLabel>
								<div className="flex flex-col gap-1">
									<span>{playerName}</span>
									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<Award size={14} className="text-yellow-500" />
										<span>Level {playerLevel.level}</span>
									</div>
									<div className="mt-2 space-y-1">
										<div className="flex justify-between text-xs">
											<span>Experience</span>
											<span>
												{playerLevel.currentXP}/{playerLevel.requiredXP} XP
											</span>
										</div>
										<Progress
											value={progressPercentage}
											className="h-2 bg-mafia-200"
											indicatorClassName="bg-mafia-600"
										/>
									</div>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem>
								<User className="mr-2 h-4 w-4" />
								<span>Profile</span>
							</DropdownMenuItem>
							<DropdownMenuItem>
								<Award className="mr-2 h-4 w-4" />
								<span>Achievements</span>
							</DropdownMenuItem>
							<DropdownMenuItem>
								<Settings className="mr-2 h-4 w-4" />
								<span>Settings</span>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem>
								<LogOut className="mr-2 h-4 w-4" />
								<span>Sign out</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	);
}

export default HeaderInner;
