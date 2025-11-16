import React, { useMemo } from 'react';
import type { AppData, Standing } from '../types';
import { Button } from './common/Button';
import { calculateStandings } from '../utils/standings';
import type { View } from '../../App';


interface PublicDisplayProps {
  data: AppData;
  setView: (view: View) => void;
  // These props are not used in this simplified component but are part of the interface
  handleDataUpdate: (prompt: string, optimisticUpdate?: (prevData: AppData) => AppData) => Promise<void>;
  isProcessing: boolean;
}

const PublicDisplay: React.FC<PublicDisplayProps> = ({ data, setView }) => {
  const { settings, categories, teams, races, results } = data;
  const currentSettings = settings[settings.length - 1];

  const standingsByCategory = useMemo(() => {
    const standingMap = new Map<string, Standing[]>();
    categories.forEach(category => {
        const categoryTeams = teams.filter(t => t.categoryId === category.id);
        const categoryResults = results.filter(r => categoryTeams.some(t => t.id === r.teamId));
        if (categoryTeams.length > 0) {
            standingMap.set(category.name, calculateStandings(categoryResults, categoryTeams));
        }
    });
    return standingMap;
  }, [categories, teams, results]);
  
  const teamsByCategory = useMemo(() => {
    const teamMap = new Map<string, { categoryName: string; teams: AppData['teams'] }>();
    const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name));
    
    sortedCategories.forEach(category => {
        const categoryTeams = teams
            .filter(t => t.categoryId === category.id)
            .sort((a, b) => a.name.localeCompare(b.name));
        if (categoryTeams.length > 0) {
            teamMap.set(category.id, { categoryName: category.name, teams: categoryTeams });
        }
    });
    return Array.from(teamMap.values());
  }, [categories, teams]);

  const activeRace = races.find(r => r.status === 'active');
  const nextRaces = races.filter(r => r.status === 'scheduled').slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4 md:p-8">
      <div className="container mx-auto max-w-7xl">
        <header className="text-center mb-8 p-6 bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700">
          <h1 className="text-3xl md:text-4xl font-bold text-teal-400">{currentSettings?.championshipTitle || 'Campeonato de Vela'}</h1>
          <p className="text-lg text-slate-300">{currentSettings?.location || 'Iate Clube'}</p>
          <div className="mt-4 flex justify-center gap-4">
            <Button onClick={() => setView('tv')}>📺 Modo TV</Button>
            <Button variant="secondary" onClick={() => setView('dashboard')}>🏠 Voltar ao Dashboard</Button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-purple-400 mb-4 pb-3 border-b-2 border-slate-700">🏆 Classificação Ao Vivo</h2>
             <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-2">
                {Array.from(standingsByCategory.entries()).map(([categoryName, standings]) => (
                  <div key={categoryName}>
                    <h3 className="text-xl font-semibold text-teal-400 mb-3">{categoryName}</h3>
                    <div className="space-y-2">
                    {standings.map((s, index) => (
                      <div key={s.teamId} className="grid grid-cols-[40px_1fr_auto] items-center p-3 bg-slate-700/50 rounded-lg">
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${index === 0 ? 'bg-amber-400 text-slate-900' : index === 1 ? 'bg-slate-400 text-slate-900' : index === 2 ? 'bg-orange-500 text-white' : 'bg-teal-600 text-white'}`}>
                            {index + 1}
                        </div>
                        <div>
                            <p className="font-semibold text-slate-100">{s.teamName}</p>
                            <p className="text-xs text-slate-400">{s.skipper}</p>
                        </div>
                        <div className="text-right">
                           {s.latestRaceTime ? (
                            <p className="font-mono text-lg text-teal-300">{s.latestRaceTime}</p>
                            ) : (
                                <div className="text-right">
                                    <p className="text-sm text-slate-300 truncate" title={s.crew.map(c => c.name).join(', ')}>
                                        {s.crew.map(c => c.name).join(', ')}
                                    </p>
                                    <p className="text-xs text-slate-500">Tripulação</p>
                                </div>
                            )}
                        </div>
                      </div>
                    ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
          
          <aside className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl p-6 shadow-2xl space-y-6">
              <div>
                <h3 className="text-xl font-bold text-purple-400 mb-3 pb-2 border-b-2 border-slate-700">
                    {activeRace ? '🟢 Corrida Ativa' : '📋 Status'}
                </h3>
                {activeRace ? (
                    <div className="bg-emerald-900/50 border-l-4 border-emerald-500 p-4 rounded space-y-1">
                        <p className="font-bold text-emerald-300">{activeRace.name}</p>
                        <p className="text-sm text-slate-300">Categoria: {categories.find(c=>c.id === activeRace.categoryId)?.name}</p>
                        {(activeRace.windSpeed !== undefined && activeRace.windDirection) && (
                          <p className="text-sm text-slate-300">🌬️ Vento: {activeRace.windSpeed} km/h, {activeRace.windDirection}</p>
                        )}
                        {(activeRace.temperature !== undefined) && (
                          <p className="text-sm text-slate-300">🌡️ Temp: {activeRace.temperature}°C</p>
                        )}
                        {(activeRace.rain !== undefined) && (
                          <p className="text-sm text-slate-300">💧 Chuva: {activeRace.rain} mm</p>
                        )}
                        {(activeRace.humidity !== undefined) && (
                          <p className="text-sm text-slate-300">💦 Umidade: {activeRace.humidity}%</p>
                        )}
                    </div>
                ) : <p className="text-center p-4 text-slate-400">Nenhuma corrida ativa.</p>}
              </div>

              <div>
                <h3 className="text-xl font-bold text-purple-400 mb-3 pb-2 border-b-2 border-slate-700">📅 Próximas Corridas</h3>
                <div className="space-y-2">
                {nextRaces.length > 0 ? nextRaces.map(race => (
                    <div key={race.id} className="bg-teal-900/50 p-3 rounded-lg">
                        <p className="font-semibold text-teal-300">{race.name}</p>
                        <p className="text-sm text-slate-300">
                            {new Date(race.date).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {categories.find(c=>c.id === race.categoryId)?.name}
                        </p>
                    </div>
                )) : <p className="text-center p-4 text-slate-400">Nenhuma corrida programada.</p>}
                </div>
              </div>
          </aside>

           {teamsByCategory.length > 0 && (
            <div className="lg:col-span-3 bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl p-6 shadow-2xl">
              <h2 className="text-2xl font-bold text-purple-400 mb-4 pb-3 border-b-2 border-slate-700">👥 Equipes Inscritas</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8 max-h-[60vh] overflow-y-auto pr-2">
                {teamsByCategory.map(({ categoryName, teams }) => (
                  <div key={categoryName}>
                    <h3 className="text-lg font-semibold text-teal-400 mb-2">{categoryName}</h3>
                    <ul className="space-y-1">
                      {teams.map(team => (
                        <li key={team.id} className="text-sm p-2 bg-slate-700/50 rounded">
                          <span className="font-medium text-slate-100">{team.name}</span>
                          {team.cidade && <span className="text-xs text-slate-400 block">Cidade: {team.cidade}</span>}
                          <span className="text-xs text-slate-400 block">Popeiro: {team.skipper}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PublicDisplay;