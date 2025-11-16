import React, { useMemo } from 'react';
import type { AppData, Standing } from '../types';
import { Button } from './common/Button';
import { calculateStandings } from '../utils/standings';

interface TvDisplayProps {
  data: AppData;
  setView: (view: 'admin' | 'public' | 'tv' | 'obs' | 'dashboard') => void;
  // These props are not used in this simplified component but are part of the interface
  handleDataUpdate: (prompt: string, optimisticUpdate?: (prevData: AppData) => AppData) => Promise<void>;
  isProcessing: boolean;
}

const TvDisplay: React.FC<TvDisplayProps> = ({ data, setView }) => {
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

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#0c1445] to-[#1e3c72] text-white font-sans flex flex-col overflow-hidden">
      <header className="flex-shrink-0 flex justify-between items-center p-6 bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div>
          <h1 className="text-3xl font-bold">{currentSettings?.championshipTitle || 'Campeonato de Vela'}</h1>
          <p className="text-lg opacity-80">{currentSettings?.location || 'Iate Clube'}</p>
        </div>
        <Button variant="danger" onClick={() => setView('dashboard')}>Sair do Modo TV</Button>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 overflow-hidden">
        <section className="lg:col-span-2 bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-6 flex flex-col overflow-hidden">
          <div className="flex-shrink-0 flex justify-between items-center mb-4 pb-3 border-b-2 border-white/20">
            <h2 className="text-2xl font-bold">🏆 Classificação Geral</h2>
            <div className="bg-red-600 px-4 py-1 rounded-full text-sm font-semibold animate-pulse">
              🔴 AO VIVO
            </div>
          </div>
          <div className="flex-1 overflow-y-auto pr-2">
            {Array.from(standingsByCategory.entries()).map(([categoryName, standings]) => (
              <div key={categoryName} className="mb-8">
                <h3 className="text-xl font-semibold text-blue-300 mb-3">{categoryName}</h3>
                <div className="space-y-3">
                {standings.slice(0, 10).map((s, index) => (
                   <div key={s.teamId} className="grid grid-cols-[50px_1fr_auto] items-center p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors duration-300">
                      <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-lg ${index === 0 ? 'bg-yellow-400 text-gray-900' : index === 1 ? 'bg-gray-400 text-gray-900' : index === 2 ? 'bg-yellow-600 text-white' : 'bg-blue-500'}`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-bold">{s.teamName}</p>
                        <p className="text-sm opacity-70">{s.skipper}</p>
                      </div>
                      <div className="text-right">
                         {s.latestRaceTime ? (
                            <>
                                <p className="font-mono text-lg">{s.latestRaceTime}</p>
                                <p className="text-sm opacity-70">Último Tempo</p>
                            </>
                        ) : (
                            <div className="text-right">
                                <p className="font-semibold text-sm truncate" title={s.crew.map(c => `${c.name} (${c.funcao})`).join(', ')}>
                                    {s.crew.map(c => c.name).join(', ')}
                                </p>
                                <p className="text-xs opacity-70">Tripulação</p>
                            </div>
                        )}
                      </div>
                   </div>
                ))}
                </div>
              </div>
            ))}
          </div>
        </section>
        
        <aside className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-6 space-y-6 overflow-y-auto">
            <div>
              <h3 className="text-xl font-bold mb-3 pb-2 border-b border-white/20">
                {activeRace ? '🟢 Corrida Ativa' : '📋 Status'}
              </h3>
              {activeRace ? (
                <div className="bg-green-500/20 p-4 rounded-lg space-y-1">
                    <p className="font-bold text-lg">{activeRace.name}</p>
                    <p className="opacity-80">Categoria: {categories.find(c=>c.id === activeRace.categoryId)?.name}</p>
                    {(activeRace.windSpeed !== undefined && activeRace.windDirection) && (
                      <p className="opacity-80">🌬️ Vento: {activeRace.windSpeed} km/h, {activeRace.windDirection}</p>
                    )}
                    {(activeRace.temperature !== undefined) && (
                      <p className="opacity-80">🌡️ Temp: {activeRace.temperature}°C</p>
                    )}
                    {(activeRace.rain !== undefined) && (
                      <p className="opacity-80">💧 Chuva: {activeRace.rain} mm</p>
                    )}
                    {(activeRace.humidity !== undefined) && (
                      <p className="opacity-80">💦 Umidade: {activeRace.humidity}%</p>
                    )}
                </div>
              ) : <p className="text-center p-4 opacity-70">Nenhuma corrida ativa no momento.</p>}
            </div>
             <div>
              <h3 className="text-xl font-bold mb-3 pb-2 border-b border-white/20">📅 Próximas Corridas</h3>
              <div className="space-y-2">
              {races.filter(r => r.status === 'scheduled').slice(0, 3).map(race => (
                <div key={race.id} className="bg-blue-500/20 p-3 rounded-lg">
                    <p className="font-semibold">{race.name}</p>
                    <p className="text-sm opacity-80">
                        {new Date(race.date).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {categories.find(c=>c.id === race.categoryId)?.name}
                    </p>
                </div>
              ))}
              </div>
            </div>
             {teamsByCategory.length > 0 && (
              <div>
                  <h3 className="text-xl font-bold mb-3 pb-2 border-b border-white/20">👥 Equipes Inscritas</h3>
                  <div className="space-y-4">
                      {teamsByCategory.map(({ categoryName, teams }) => (
                          <div key={categoryName}>
                              <h4 className="font-semibold text-blue-300">{categoryName}</h4>
                              <ul className="list-disc list-inside text-sm opacity-80 pl-2 mt-1 space-y-0.5">
                                  {teams.map(team => (
                                      <li key={team.id}>{team.name} {team.cidade && `(${team.cidade})`}</li>
                                  ))}
                              </ul>
                          </div>
                      ))}
                  </div>
              </div>
            )}
        </aside>

      </main>
    </div>
  );
};

export default TvDisplay;