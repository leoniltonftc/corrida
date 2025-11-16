import type { Result, Team, Standing, CrewMember } from '../types';

export function calculateStandings(results: Result[], teams: Team[]): Standing[] {
  const standingsMap = new Map<string, {
    teamId: string;
    teamName: string;
    skipper: string;
    crew: CrewMember[];
    categoryName: string;
    racesCount: number;
    bestPosition: number | null;
    latestRaceTime?: string;
    latestRaceTimestamp: string;
  }>();

  teams.forEach(team => {
    standingsMap.set(team.id, {
      teamId: team.id,
      teamName: team.name,
      skipper: team.skipper,
      crew: team.crew,
      categoryName: '',
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

      // Track the latest race time by timestamp
      if (result.timestamp > standing.latestRaceTimestamp) {
          standing.latestRaceTimestamp = result.timestamp;
          standing.latestRaceTime = result.finishTime;
      }
    }
  });

  // Since there are no points, we can sort by best position, then number of races.
  return Array.from(standingsMap.values())
    .filter(s => s.racesCount > 0)
    .sort((a, b) => {
      // Sort by best position (lower is better). Nulls go to the end.
      if (a.bestPosition === null) return 1;
      if (b.bestPosition === null) return -1;
      if (a.bestPosition !== b.bestPosition) {
        return a.bestPosition - b.bestPosition;
      }
      
      // Tie-breaker: more races is better
      if (a.racesCount !== b.racesCount) {
        return b.racesCount - a.racesCount;
      }

      // Final tie-breaker: alphabetical by team name
      return a.teamName.localeCompare(b.teamName);
    });
}