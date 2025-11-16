import React, { useState, useMemo } from 'react';
import type { AppData } from '../types';
import { SettingsIcon, CategoryIcon, TeamIcon, RaceIcon, ResultsIcon, StandingsIcon } from './Icons';
import { Button } from './common/Button';

// Import tab components
import SettingsTab from './admin/SettingsTab';
import CategoriesTab from './admin/CategoriesTab';
import TeamsTab from './admin/TeamsTab';
import RacesTab from './admin/RacesTab';
import ResultsTab from './admin/ResultsTab';
import StandingsTab from './admin/StandingsTab';


interface AdminPanelProps {
  data: AppData;
  handleDataUpdate: (prompt: string, optimisticUpdate?: (prevData: AppData) => AppData) => Promise<void>;
  isProcessing: boolean;
  setView: (view: 'admin' | 'public' | 'tv' | 'obs' | 'dashboard') => void;
  obsMasterEnabled: boolean;
  setObsMasterEnabled: (enabled: boolean) => void;
}

type Tab = 'settings' | 'categories' | 'teams' | 'races' | 'results' | 'standings';

const AdminPanel: React.FC<AdminPanelProps> = ({ data, handleDataUpdate, isProcessing, setView, obsMasterEnabled, setObsMasterEnabled }) => {
  const [activeTab, setActiveTab] = useState<Tab>('settings');

  const currentSettings = useMemo(() => data.settings[data.settings.length - 1] || null, [data.settings]);
  const championshipTitle = currentSettings?.championshipTitle || 'Campeonato de Vela';
  const clubName = currentSettings?.location || 'Iate Clube';

  const renderTabContent = () => {
    const commonProps = { data, handleDataUpdate, isProcessing };
    switch (activeTab) {
        case 'settings':
            return <SettingsTab {...commonProps} />;
        case 'categories':
            return <CategoriesTab {...commonProps} />;
        case 'teams':
            return <TeamsTab {...commonProps} />;
        case 'races':
            return <RacesTab {...commonProps} obsMasterEnabled={obsMasterEnabled} setObsMasterEnabled={setObsMasterEnabled} />;
        case 'results':
            return <ResultsTab {...commonProps} />;
        case 'standings':
            return <StandingsTab {...commonProps} />;
        default:
            return null;
    }
  };
  
  const tabs: { id: Tab; name: string; icon: React.ReactElement }[] = [
    { id: 'settings', name: 'Configurações', icon: <SettingsIcon /> },
    { id: 'categories', name: 'Categorias', icon: <CategoryIcon /> },
    { id: 'teams', name: 'Equipes', icon: <TeamIcon /> },
    { id: 'races', name: 'Corridas', icon: <RaceIcon /> },
    { id: 'results', name: 'Resultados', icon: <ResultsIcon /> },
    { id: 'standings', name: 'Classificação', icon: <StandingsIcon /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white p-4 md:p-8">
      <div className="container mx-auto max-w-7xl">
        <header className="text-center mb-8 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
          <h1 className="text-3xl md:text-4xl font-bold text-shadow-lg">{championshipTitle}</h1>
          <p className="text-lg opacity-90">{clubName}</p>
          <div className="mt-4 flex flex-wrap justify-center items-center gap-4">
             <Button onClick={() => setView('dashboard')}>⬅️ Voltar ao Dashboard</Button>
             <Button variant='secondary' onClick={() => setView('public')}>Ver Exibição Pública</Button>
          </div>
        </header>

        <main>
          <div className="flex flex-col md:flex-row bg-white/10 backdrop-blur-md rounded-xl p-2 md:p-4 mb-8 gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center text-sm md:text-base p-3 rounded-lg transition-all duration-300 ${activeTab === tab.id ? 'bg-white/90 text-[#1e3c72] shadow-md' : 'text-white/80 hover:bg-white/20'}`}
              >
                {tab.icon}
                <span className="">{tab.name}</span>
              </button>
            ))}
          </div>

          <div className="tab-content">
             {renderTabContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;