import type { Result, Team, Standing, CrewMember } from '../types';

export function calculateStandings(results: Result[], teams: Team[]): Standing[] {
  // O tipo do mapa interno inclui propriedades necessárias para cálculo e ordenação
  const standingsMap = new Map<string, {
    teamId: string;
    teamName: string;
    skipper: string;
    crew: CrewMember[];
    bestPosition: number | null;
    latestRaceTime?: string;
    latestRaceTimestamp: string;
    racesCount: number;
  }>();

  teams.forEach(team => {
    standingsMap.set(team.id, {
      teamId: team.id,
      teamName: team.name,
      skipper: team.skipper,
      crew: team.crew,
      racesCount: 0,
      bestPosition: null,
      latestRaceTimestamp: '1970-01-01T00:00:00.000Z'
    });
  });

  results.forEach(result => {
    const standing = standingsMap.get(result.teamId);
    if (standing) {
      standing.racesCount += 1;
      
      if (standing.bestPosition === null || result.position < standing.bestPosition) {
        standing.bestPosition = result.position;
      }

      // Rastreia o tempo da última corrida pelo timestamp
      if (result.timestamp > standing.latestRaceTimestamp) {
          standing.latestRaceTimestamp = result.timestamp;
          standing.latestRaceTime = result.finishTime;
      }
    }
  });

  const sortedStandings = Array.from(standingsMap.values())
    .filter(s => s.racesCount > 0)
    .sort((a, b) => {
      // Ordena pela melhor posição (menor é melhor). Nulos vão para o fim.
      if (a.bestPosition === null) return 1;
      if (b.bestPosition === null) return -1;
      if (a.bestPosition !== b.bestPosition) {
        return a.bestPosition - b.bestPosition;
      }
      
      // Critério de desempate: mais corridas é melhor
      if (a.racesCount !== b.racesCount) {
        return b.racesCount - a.racesCount;
      }

      // Critério de desempate final: ordem alfabética pelo nome da equipe
      return a.teamName.localeCompare(b.teamName);
    });

    // Mapeia para o tipo público Standing, omitindo campos de cálculo interno
    return sortedStandings.map(({ racesCount, latestRaceTimestamp, ...rest }) => rest);
}