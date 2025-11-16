import React, { useEffect, useMemo } from 'react';
import type { AppData, Standing } from '../types';
import { calculateStandings } from '../utils/standings';
import type { View } from '../../App';

interface ObsOverlayProps {
  data: AppData;
  obsMasterEnabled: boolean;
  setView: (view: View) => void;
  // Unused props
  handleDataUpdate: (prompt: string, optimisticUpdate?: (prevData: AppData) => AppData) => Promise<void>;
  isProcessing: boolean;
}

const ObsOverlay: React.FC<ObsOverlayProps> = ({ data, obsMasterEnabled }) => {
    const { categories, teams, races, results } = data;

    const visibleRaces = useMemo(() => races.filter(r => r.obsVisible), [races]);
    const displayRace = useMemo(() => {
        return visibleRaces.find(r => r.status === 'active') || 
               visibleRaces.filter(r => r.status === 'finished').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    }, [visibleRaces]);

    const standingsToShow = useMemo(() => {
        if (!displayRace) return [];

        const raceCategory = categories.find(c => c.id === displayRace.categoryId);
        if (!raceCategory) return [];

        const categoryTeams = teams.filter(t => t.categoryId === raceCategory.id);
        const categoryResults = results.filter(r => categoryTeams.some(t => t.id === r.teamId));

        return calculateStandings(categoryResults, categoryTeams);

    }, [displayRace, categories, teams, results]);
    
    useEffect(() => {
        document.body.style.backgroundColor = 'transparent';
        return () => {
            document.body.style.backgroundColor = '';
        };
    }, []);

    if (!obsMasterEnabled) {
        return <div className="p-8 text-white font-bold text-2xl text-center">Overlay desativado.</div>;
    }

    if (!displayRace) {
        return <div className="p-8 text-white font-bold text-2xl text-center">Nenhuma corrida ativa ou finalizada para exibir.</div>;
    }

    return (
        <div className="p-8">
            <div className="w-full max-w-xl bg-gradient-to-br from-slate-800/95 to-slate-900/95 text-white rounded-2xl shadow-2xl border-2 border-slate-700/50 backdrop-blur-lg">
                <header className="p-5 text-center border-b-2 border-slate-700">
                    <h1 className="text-3xl font-bold tracking-wide text-teal-400">{displayRace.name}</h1>
                    <div className="flex justify-center items-center gap-3 mt-1 text-lg text-slate-300">
                        <span className="bg-rose-600 px-3 py-0.5 rounded-full text-xs font-semibold animate-pulse">AO VIVO</span>
                        <span>{categories.find(c => c.id === displayRace.categoryId)?.name}</span>
                    </div>
                </header>
                <div className="p-4 space-y-2">
                    {standingsToShow.slice(0, 10).map((s, index) => (
                        <div key={s.teamId} className="grid grid-cols-[50px_1fr_auto] items-center p-3 bg-slate-700/50 rounded-lg">
                            <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-lg ${index === 0 ? 'bg-amber-400 text-slate-900' : index === 1 ? 'bg-slate-400 text-slate-900' : index === 2 ? 'bg-orange-500 text-white' : 'bg-teal-600'}`}>
                                {index + 1}
                            </div>
                            <div>
                                <p className="font-bold text-lg text-slate-100">{s.teamName}</p>
                                <p className="text-sm text-slate-400">{s.skipper}</p>
                            </div>
                            <div className="text-right">
                                {s.latestRaceTime ? (
                                    <>
                                        <p className="font-mono text-2xl">{s.latestRaceTime}</p>
                                        <p className="text-xs text-slate-400">TEMPO</p>
                                    </>
                                ) : (
                                    <div>
                                        <p className="font-semibold text-base truncate" title={s.crew.map(c => c.name).join(', ')}>
                                            {s.crew.map(c => c.name).join(', ')}
                                        </p>
                                        <p className="text-xs text-slate-400">TRIPULAÇÃO</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ObsOverlay;