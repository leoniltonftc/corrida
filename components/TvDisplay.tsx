import React, { useMemo } from 'react';
import type { AppData, Standing } from '../types';
import { Button } from './common/Button';
import { calculateStandings } from '../utils/standings';
import type { View } from '../../App';

interface TvDisplayProps {
  data: AppData;
  setView: (view: View) => void;
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
    <div className="fixed inset-0 bg-slate-900 text-slate-200 font-sans flex flex-col overflow-hidden">
      <header className="flex-shrink-0 flex justify-between items-center p-6 bg-slate-950/50 backdrop-blur-lg border-b border-slate-700">
        <div>
          <h1 className="text-3xl font-bold text-teal-400">{currentSettings?.championshipTitle || 'Campeonato de Vela'}</h1>
          <p className="text-lg text-slate-300">{currentSettings?.location || 'Iate Clube'}</p>
        </div>
        <Button variant="danger" onClick={() => setView('dashboard')}>Sair do Modo TV</Button>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 overflow-hidden">
        <section className="lg:col-span-2 bg-slate-800/50 backdrop-blur-lg rounded-xl border border-slate-700 p-6 flex flex-col overflow-hidden">
          <div className="flex-shrink-0 flex justify-between items-center mb-4 pb-3 border-b-2 border-slate-700">
            <h2 className="text-2xl font-bold text-purple-400">🏆 Classificação Geral</h2>
            <div className="bg-rose-600 px-4 py-1 rounded-full text-sm font-semibold animate-pulse">
              🔴 AO VIVO
            </div>
          </div>
          <div className="flex-1 overflow-y-auto pr-2">
            {Array.from(standingsByCategory.entries()).map(([categoryName, standings]) => (
              <div key={categoryName} className="mb-8">
                <h3 className="text-xl font-semibold text-teal-400 mb-3">{categoryName}</h3>
                <div className="space-y-3">
                {standings.slice(0, 10).map((s, index) => (
                   <div key={s.teamId} className="grid grid-cols-[50px_1fr_auto] items-center p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors duration-300">
                      <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-lg ${index === 0 ? 'bg-amber-400 text-slate-900' : index === 1 ? 'bg-slate-400 text-slate-900' : index === 2 ? 'bg-orange-500 text-white' : 'bg-teal-600'}`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-bold text-slate-100">{s.teamName}</p>
                        <p className="text-sm text-slate-400">{s.skipper}</p>
                      </div>
                      <div className="text-right">
                         {s.latestRaceTime ? (
                            <>
                                <p className="font-mono text-lg">{s.latestRaceTime}</p>
                                <p className="text-sm text-slate-400">Último Tempo</p>
                            </>
                        ) : (
                            <div className="text-right">
                                <p className="font-semibold text-sm truncate text-slate-300" title={s.crew.map(c => `${c.name} (${c.funcao})`).join(', ')}>
                                    {s.crew.map(c => c.name).join(', ')}
                                </p>
                                <p className="text-xs text-slate-400">Tripulação</p>
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
        
        <aside className="bg-slate-800/50 backdrop-blur-lg rounded-xl border border-slate-700 p-6 space-y-6 overflow-y-auto">
            <div>
              <h3 className="text-xl font-bold mb-3 pb-2 border-b border-slate-700 text-purple-400">
                {activeRace ? '🟢 Corrida Ativa' : '📋 Status'}
              </h3>
              {activeRace ? (
                <div className="bg-emerald-500/20 p-4 rounded-lg space-y-1">
                    <p className="font-bold text-lg text-emerald-300">{activeRace.name}</p>
                    <p className="text-slate-300">Categoria: {categories.find(c=>c.id === activeRace.categoryId)?.name}</p>
                    {(activeRace.windSpeed !== undefined && activeRace.windDirection) && (
                      <p className="text-slate-300">🌬️ Vento: {activeRace.windSpeed} km/h, {activeRace.windDirection}</p>
                    )}
                    {(activeRace.temperature !== undefined) && (
                      <p className="text-slate-300">🌡️ Temp: {activeRace.temperature}°C</p>
                    )}
                    {(activeRace.rain !== undefined) && (
                      <p className="text-slate-300">💧 Chuva: {activeRace.rain} mm</p>
                    )}
                    {(activeRace.humidity !== undefined) && (
                      <p className="text-slate-300">💦 Umidade: {activeRace.humidity}%</p>
                    )}
                </div>
              ) : <p className="text-center p-4 text-slate-400">Nenhuma corrida ativa no momento.</p>}
            </div>
             <div>
              <h3 className="text-xl font-bold mb-3 pb-2 border-b border-slate-700 text-purple-400">📅 Próximas Corridas</h3>
              <div className="space-y-2">
              {races.filter(r => r.status === 'scheduled').slice(0, 3).map(race => (
                <div key={race.id} className="bg-teal-500/20 p-3 rounded-lg">
                    <p className="font-semibold text-teal-300">{race.name}</p>
                    <p className="text-sm text-slate-300">
                        {new Date(race.date).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {categories.find(c=>c.id === race.categoryId)?.name}
                    </p>
                </div>
              ))}
              </div>
            </div>
             {teamsByCategory.length > 0 && (
              <div>
                  <h3 className="text-xl font-bold mb-3 pb-2 border-b border-slate-700 text-purple-400">👥 Equipes Inscritas</h3>
                  <div className="space-y-4">
                      {teamsByCategory.map(({ categoryName, teams }) => (
                          <div key={categoryName}>
                              <h4 className="font-semibold text-teal-400">{categoryName}</h4>
                              <ul className="list-disc list-inside text-sm text-slate-300 pl-2 mt-1 space-y-0.5">
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