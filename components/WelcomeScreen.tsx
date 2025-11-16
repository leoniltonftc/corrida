import React from 'react';
import { Button } from './common/Button';
import type { View } from '../../App';

interface WelcomeScreenProps {
  setView: (view: View) => void;
}

const FeatureCard: React.FC<{ title: string, description: string, icon: string }> = ({ title, description, icon }) => (
    <div className="bg-slate-800/50 backdrop-blur-lg p-6 rounded-lg text-center border border-slate-700 transform hover:scale-105 transition-transform duration-300">
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-lg font-semibold mb-2 text-teal-400">{title}</h3>
        <p className="text-sm text-slate-300">{description}</p>
    </div>
);


const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ setView }) => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-900 text-slate-200">
            <div className="w-full max-w-5xl text-center">
                <header className="mb-12">
                    <h1 className="text-5xl md:text-6xl font-bold mb-4 text-teal-400">🏁 Sistema de Gerenciamento de Regatas</h1>
                    <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto">
                        A solução completa para organizar, gerenciar e transmitir seus eventos de vela com profissionalismo e eficiência.
                    </p>
                </header>

                <main className="mb-12">
                    <h2 className="text-3xl font-bold mb-8 text-purple-400">Funcionalidades Principais</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard 
                            icon="🗂️"
                            title="Gerenciamento Completo"
                            description="Cadastre categorias, equipes com tripulação detalhada, corridas e resultados de forma centralizada."
                        />
                         <FeatureCard 
                            icon="⏱️"
                            title="Resultados em Tempo Real"
                            description="Registre chegadas durante corridas ativas e veja a classificação ser atualizada instantaneamente."
                        />
                         <FeatureCard 
                            icon="📺"
                            title="Modos de Visualização"
                            description="Exiba resultados ao vivo em TVs, overlays para OBS e uma página pública para espectadores."
                        />
                         <FeatureCard 
                            icon="🌦️"
                            title="Previsão do Tempo"
                            description="Obtenha dados meteorológicos automáticos para o local e data da corrida ao criá-la."
                        />
                         <FeatureCard 
                            icon="📄"
                            title="Relatórios e Exportação"
                            description="Exporte todos os dados para CSV ou gere relatórios em PDF para impressão e arquivamento."
                        />
                         <FeatureCard 
                            icon="💾"
                            title="Persistência de Dados"
                            description="Todos os seus dados são salvos automaticamente no navegador, garantindo segurança e continuidade."
                        />
                    </div>
                </main>
                
                <div className="bg-slate-800/50 backdrop-blur-lg p-8 rounded-2xl border border-slate-700">
                     <h2 className="text-3xl font-bold mb-4 text-purple-400">Nosso Objetivo</h2>
                     <p className="text-lg text-slate-300 max-w-3xl mx-auto mb-8">
                        Simplificar a complexa tarefa de gerenciar uma regata, fornecendo aos organizadores uma ferramenta poderosa e intuitiva, ao mesmo tempo que engajamos o público com informações em tempo real e de fácil acesso.
                     </p>
                    <Button size="lg" variant="success" onClick={() => setView('login')}>
                        Acessar Sistema
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default WelcomeScreen;