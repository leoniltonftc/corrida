import React, { useState, useMemo } from 'react';
import type { AppData } from '../types';
import { SettingsIcon, CategoryIcon, TeamIcon, RaceIcon, ResultsIcon, StandingsIcon } from './Icons';
import { Button } from './common/Button';
import type { View } from '../../App';

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
  setView: (view: View) => void;
  obsMasterEnabled: boolean;
  setObsMasterEnabled: (enabled: boolean) => void;
  handleLogout: () => void;
}

type Tab = 'settings' | 'categories' | 'teams' | 'races' | 'results' | 'standings';

const AdminPanel: React.FC<AdminPanelProps> = ({ data, handleDataUpdate, isProcessing, setView, obsMasterEnabled, setObsMasterEnabled, handleLogout }) => {
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
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4 md:p-8">
      <div className="container mx-auto max-w-7xl">
        <header className="text-center mb-8 p-6 bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700">
          <h1 className="text-3xl md:text-4xl font-bold text-teal-400">{championshipTitle}</h1>
          <p className="text-lg text-slate-300">{clubName}</p>
          <div className="mt-4 flex flex-wrap justify-center items-center gap-4">
             <Button onClick={() => setView('dashboard')}>⬅️ Voltar ao Dashboard</Button>
             <Button variant='secondary' onClick={() => setView('public')}>Ver Exibição Pública</Button>
             <Button variant='danger' onClick={handleLogout}>Sair</Button>
          </div>
        </header>

        <main>
          <div className="flex flex-col md:flex-row bg-slate-800/50 backdrop-blur-lg rounded-xl p-2 md:p-4 mb-8 gap-2 border border-slate-700">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center text-sm md:text-base p-3 rounded-lg transition-all duration-300 ${activeTab === tab.id ? 'bg-teal-500 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700/50'}`}
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