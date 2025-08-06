import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Player } from '../types';

interface PlayerNameComboboxProps {
  value: string;
  onChange: (value: string) => void;
  onAddPlayer?: (name: string) => void;
  placeholder?: string;
  disabled?: boolean;
  currentGamePlayers?: Player[];
}

export default function PlayerNameCombobox({ value, onChange, onAddPlayer, placeholder = 'Entrez un nom', disabled = false, currentGamePlayers = [] }: PlayerNameComboboxProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [inputValue, setInputValue] = useState(value);
  const [selectedFromDropdown, setSelectedFromDropdown] = useState<string | null>(null);
  const { games } = useStore();

  // Synchronize internal state with prop value
  useEffect(() => {
    setInputValue(value);
    setSelectedFromDropdown(null); // Reset selection when value changes
  }, [value]);

  // Extract all unique player names from past games
  useEffect(() => {
    const pastPlayerNames = new Set<string>();
    
    // Collect all player names from past games
    games.forEach(game => {
      game.players.forEach(player => {
        pastPlayerNames.add(player.name);
      });
    });
    
    // Convert to array and sort alphabetically
    const sortedNames = Array.from(pastPlayerNames).sort();
    
    // Filter out names that are already used in the current game
    const filteredNames = sortedNames.filter(name =>
      !currentGamePlayers.some(player => player.name.trim().toLowerCase() === name.trim().toLowerCase())
    );
    
    // Create proper Player objects with unique IDs (using name as identifier for the dropdown)
    setFilteredPlayers(filteredNames.map(name => ({
      id: `temp-${name}`, // Use a temporary prefix to distinguish from real IDs
      name
    })));
  }, [games, currentGamePlayers]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setSelectedFromDropdown(null); // Clear selection when typing
    
    // Filter players based on input
    const filtered = games
      .flatMap(game => game.players)
      .map(p => p.name)
      .filter(name => name.toLowerCase().includes(newValue.toLowerCase()))
      .sort()
      // Filter out names that are already used in the current game
      .filter(name =>
        !currentGamePlayers.some(player => player.name.trim().toLowerCase() === name.trim().toLowerCase())
      )
      // Create proper Player objects with unique IDs (using name as identifier for the dropdown)
      .map(name => ({
        id: `temp-${name}`, // Use a temporary prefix to distinguish from real IDs
        name
      }));
    
    setFilteredPlayers(filtered);
  };

  // Handle selecting a player from the dropdown
  const handleSelect = (name: string) => {
    setInputValue(name);
    onChange(name);
    setIsFocused(false);
    setSelectedFromDropdown(name); // Track that this was selected from dropdown
  };

  // Check if a name is already in use in the current game session (case insensitive)
  const isNameInUse = (name: string): boolean => {
    return currentGamePlayers.some(player =>
      player.name.trim().toLowerCase() === name.trim().toLowerCase()
    );
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            // Only add player when Enter is pressed
            if (inputValue.trim() !== '') {
              // Prevent adding duplicate names in current session
              if (isNameInUse(inputValue.trim())) {
                return; // Don't allow duplicate names to be added
              }
              // Call the parent's addPlayer function with either:
              // 1. The selected dropdown item (if one was chosen)
              // 2. The current input value
              const nameToAdd = selectedFromDropdown || inputValue.trim();
              if (onAddPlayer) {
                onAddPlayer(nameToAdd);
              }
            }
          }
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 150)}
        placeholder={placeholder}
        disabled={disabled}
        className="input w-full"
        aria-label="Nom du joueur"
      />
      
      {isFocused && filteredPlayers.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-surface border border-accent rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredPlayers.map((player) => (
            <li
              key={player.id}
              className="px-3 py-2 hover:bg-accent cursor-pointer"
              onClick={() => handleSelect(player.name)}
            >
              {player.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}