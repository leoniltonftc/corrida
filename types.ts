// FIX: Removed self-import of `CrewMember` to resolve declaration conflict.

export interface Settings {
  id: string;
  type: 'settings';
  championshipTitle: string;
  location: string;
  dates?: string;
  organizer?: string;
  description?: string;
  timestamp: string;
}

export interface Category {
  id: string;
  type: 'category';
  name: string;
  description?: string;
}

export type CrewFunction = 'Apoio' | 'Bolineiro' | 'Estás Mestre' | 'Proeiro' | 'Topo de Proa' | 'Topo de Ré';

export interface CrewMember {
  name: string;
  funcao: CrewFunction;
}

export interface Team {
  id: string;
  type: 'team';
  name: string;
  cidade: string;
  categoryId: string;
  skipper: string;
  crew: CrewMember[];
}

export type RaceStatus = 'scheduled' | 'active' | 'finished';

export interface Race {
  id: string;
  type: 'race';
  name: string;
  categoryId: string;
  date: string;
  status: RaceStatus;
  startTime?: string;
  windSpeed?: number;
  windDirection?: string;
  temperature?: number;
  rain?: number;
  humidity?: number;
  obsVisible: boolean;
  timestamp: string;
}

export interface Result {
  id: string;
  type: 'result';
  raceId: string;
  teamId: string;
  position: number;
  finishTime?: string;
  elapsedTimeMs?: number;
  notes?: string;
  timestamp: string;
}

export interface AppData {
  settings: Settings[];
  categories: Category[];
  teams: Team[];
  races: Race[];
  results: Result[];
}

export interface Standing {
  teamId: string;
  teamName: string;
  skipper: string;
  crew: CrewMember[];
  bestPosition: number | null;
  latestRaceTime?: string;
}