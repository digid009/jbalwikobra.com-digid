import { GameTitle } from '../types';

// This represents the actual game data from your database
// Based on the CSV file you provided: game_titles table
export const actualGameData: GameTitle[] = [
  {
    id: '78a5a712-f1ad-4ce3-856e-75a518c90da0',
    slug: 'roblox',
    name: 'Roblox',
    description: '',
    icon: 'Zap',
    color: '#f472b6',
    logoUrl: 'logos/roblox-1757346180071_4ixp1batp9a.jpg',
    isPopular: false,
    isActive: true,
    sortOrder: 0,
    createdAt: '2025-08-30 00:11:59.94246+00',
    updatedAt: '2025-08-30 00:11:59.94246+00'
  },
  {
    id: '6df60d8d-65ec-482f-ba35-afc290b1ecec',
    slug: 'mobile-legends',
    name: 'Mobile Legends',
    description: '',
    icon: 'Shield',
    color: '#1e40af',
    logoUrl: 'logos/mobile-legends-1757346168108_l06jyht9mz.jpg',
    isPopular: true,
    isActive: true,
    sortOrder: 1,
    createdAt: '2025-08-29 15:56:56.211302+00',
    updatedAt: '2025-08-29 20:31:07.611466+00'
  },
  {
    id: 'b1d4e6e2-774a-4f00-9a66-e019d8566841',
    slug: 'free-fire',
    name: 'Free Fire',
    description: '',
    icon: 'Zap',
    color: '#ea580c',
    logoUrl: 'logos/free-fire-1757346155730_vscxizrmici.jpg',
    isPopular: true,
    isActive: true,
    sortOrder: 3,
    createdAt: '2025-08-29 15:56:56.211302+00',
    updatedAt: '2025-08-29 20:31:07.611466+00'
  }
];

/**
 * Service to get game titles directly from your database data
 * This uses the actual data from your game_titles table
 */
export class GameDataService {
  /**
   * Get all active game titles sorted by sort_order
   */
  static getActiveGames(): GameTitle[] {
    return actualGameData
      .filter(game => game.isActive === true)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  /**
   * Get game names for form dropdown
   */
  static getGameNames(): string[] {
    const activeGames = this.getActiveGames();
    return activeGames.map(game => game.name);
  }

  /**
   * Get popular games
   */
  static getPopularGames(): GameTitle[] {
    return actualGameData
      .filter(game => game.isActive === true && game.isPopular === true)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  /**
   * Get game by name
   */
  static getGameByName(name: string): GameTitle | undefined {
    return actualGameData.find(game => 
      game.name.toLowerCase() === name.toLowerCase() && game.isActive === true
    );
  }
}
