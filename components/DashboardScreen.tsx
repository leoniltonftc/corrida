import React from 'react';
import type { AppData } from '../types';
import { Button } from './common/Button';
import type { View } from '../../App';

interface DashboardScreenProps {
  setView: (view: View) => void;
  data: AppData;
  handleLogout: () => void;
}

const DashboardCard: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({ title, description, children }) => (
    <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 text-slate-200 rounded-2xl p-8 text-center shadow-2xl hover:shadow-teal-500/20 transform hover:-translate-y-1 transition-all duration-300">
        <h2 className="text-2xl font-bold text-teal-400 mb-2">{title}</h2>
        <p className="text-slate-400 mb-6 min-h-[40px]">{description}</p>
        {children}
    </div>
);

const DashboardScreen: React.FC<DashboardScreenProps> = ({ setView, data, handleLogout }) => {
    const currentSettings = data.settings[data.settings.length - 1];
    const championshipTitle = currentSettings?.championshipTitle || 'Sistema de Regatas';

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-900 text-slate-200">
            <div className="w-full max-w-6xl">
                <header className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-2 text-teal-400">{championshipTitle}</h1>
                    <p className="text-xl text-slate-300">Painel de Controle Principal</p>
                </header>

                <main className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <DashboardCard title="👨‍💼 Painel Administrativo" description="Gerenciar categorias, equipes, corridas e resultados.">
                        <Button className="w-full" onClick={() => setView('admin')}>
                            Acessar Painel
                        </Button>
                    </DashboardCard>

                    <DashboardCard title="📺 Exibição para TV" description="Visualização em tela cheia para acompanhamento ao vivo.">
                        <Button variant="success" className="w-full" onClick={() => setView('tv')}>
                            Abrir Modo TV
                        </Button>
                    </DashboardCard>

                    <DashboardCard title="🎥 Overlay para OBS" description="Classificação com fundo transparente para transmissões.">
                        <Button variant="success" className="w-full" onClick={() => setView('obs')}>
                            Abrir Overlay OBS
                        </Button>
                    </DashboardCard>

                    <DashboardCard title="👥 Visualização Pública" description="Acompanhar resultados e classificações.">
                        <Button variant="secondary" className="w-full" onClick={() => setView('public')}>
                            Ver Resultados
                        </Button>
                    </DashboardCard>
                </main>
                <footer className="text-center mt-12">
                    <Button variant='danger' onClick={handleLogout}>Sair do Sistema</Button>
                </footer>
            </div>
        </div>
    );
};

export default DashboardScreen;