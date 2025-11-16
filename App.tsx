import React, { useState, useEffect, useCallback } from 'react';
import type { AppData } from './types';
import { geminiService } from './services/geminiService';
import { LoadingSpinner } from './components/Icons';

// Lazy load components
const WelcomeScreen = React.lazy(() => import('./components/WelcomeScreen'));
const LoginScreen = React.lazy(() => import('./components/LoginScreen'));
const DashboardScreen = React.lazy(() => import('./components/DashboardScreen'));
const AdminPanel = React.lazy(() => import('./components/AdminPanel'));
const TvDisplay = React.lazy(() => import('./components/TvDisplay'));
const ObsOverlay = React.lazy(() => import('./components/ObsOverlay'));
const PublicDisplay = React.lazy(() => import('./components/PublicDisplay'));

const LOCAL_STORAGE_KEY = 'regattaAppData';

export type View = 'welcome' | 'login' | 'dashboard' | 'admin' | 'public' | 'tv' | 'obs';

const App: React.FC = () => {
    const [view, setView] = useState<View>('welcome');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [data, setData] = useState<AppData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [obsMasterEnabled, setObsMasterEnabled] = useState(true);

    const initializeData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedData) {
                setData(JSON.parse(savedData));
            } else {
                const initialData = await geminiService.getInitialData();
                setData(initialData);
            }
        } catch (err) {
            setError('Falha ao carregar os dados. Verifique a configuração da API e tente novamente.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        initializeData();
    }, [initializeData]);

    const handleDataUpdate = useCallback(async (prompt: string, optimisticUpdate?: (prevData: AppData) => AppData) => {
        if (!data) return;

        setIsProcessing(true);
        setError(null);
        
        const previousData = data;
        if (optimisticUpdate) {
            setData(optimisticUpdate(data));
        }

        try {
            const updatedData = await geminiService.updateData(prompt, data);
            setData(updatedData);
            // Save to localStorage on successful update
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedData));
        } catch (err) {
            setError('Ocorreu um erro ao salvar os dados. Suas alterações podem não ter sido salvas.');
            console.error(err);
            // Revert optimistic update on failure
            setData(previousData);
        } finally {
            setIsProcessing(false);
        }
    }, [data]);
    
    const handleLogin = () => {
        setIsLoggedIn(true);
        setView('dashboard');
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setView('welcome');
    };


    const renderView = () => {
        if (isLoading || !data) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-300">
                    <LoadingSpinner color="text-teal-400" />
                    <p className="mt-4 text-lg">Carregando Sistema de Regatas...</p>
                    {error && <p className="mt-2 text-rose-400">{error}</p>}
                </div>
            );
        }
        
        const commonProps = { data, handleDataUpdate, isProcessing, setView, initializeData };
        
        if (!isLoggedIn) {
            switch(view) {
                case 'login':
                    return <LoginScreen onLogin={handleLogin} />;
                case 'welcome':
                default:
                    return <WelcomeScreen setView={setView} />;
            }
        }

        switch (view) {
            case 'admin':
                return <AdminPanel {...commonProps} obsMasterEnabled={obsMasterEnabled} setObsMasterEnabled={setObsMasterEnabled} handleLogout={handleLogout} />;
            case 'public':
                return <PublicDisplay {...commonProps} />;
            case 'tv':
                return <TvDisplay {...commonProps} />;
            case 'obs':
                return <ObsOverlay {...commonProps} obsMasterEnabled={obsMasterEnabled} />;
            case 'dashboard':
            default:
                return <DashboardScreen setView={setView} data={data} handleLogout={handleLogout} />;
        }
    };
    
    return (
        <div className="min-h-screen font-['Roboto',_sans-serif]">
            <React.Suspense fallback={
                 <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-300">
                    <LoadingSpinner color="text-teal-400" />
                    <p className="mt-4 text-lg">Carregando visualização...</p>
                </div>
            }>
                {renderView()}
            </React.Suspense>
        </div>
    );
};

export default App;