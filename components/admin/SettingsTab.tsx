import React, { useState, useEffect } from 'react';
import type { AppData, Settings } from '../../types';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';

interface SettingsTabProps {
  data: AppData;
  handleDataUpdate: (prompt: string, optimisticUpdate?: (prevData: AppData) => AppData) => Promise<void>;
  isProcessing: boolean;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ data, handleDataUpdate, isProcessing }) => {
    const [formData, setFormData] = useState<Partial<Settings>>({});
    const currentSettings = data.settings[data.settings.length - 1] || null;
    
    useEffect(() => {
        if (currentSettings) {
            setFormData(currentSettings);
        }
    }, [currentSettings]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        let prompt;
        let optimisticUpdate;

        if (currentSettings) {
            const updatedSettings = { ...currentSettings, ...formData, timestamp: new Date().toISOString() };
            prompt = `Update the following item of type 'settings' in the data: ${JSON.stringify(updatedSettings)}`;
            optimisticUpdate = (prevData: AppData) => ({
                ...prevData,
                settings: prevData.settings.map(s => s.id === updatedSettings.id ? updatedSettings : s)
            });
        } else {
            const newSettings: Settings = {
                id: `settings_${Date.now()}`,
                type: 'settings',
                timestamp: new Date().toISOString(),
                ...formData,
            } as Settings;
            prompt = `Add the following new item of type 'settings' to the data: ${JSON.stringify(newSettings)}`;
            optimisticUpdate = (prevData: AppData) => ({
                ...prevData,
                settings: [...prevData.settings, newSettings]
            });
        }
        await handleDataUpdate(prompt, optimisticUpdate);
    };

    const handleClearData = () => {
        if (window.confirm("Você tem certeza que deseja apagar TODOS os dados do campeonato? Esta ação não pode ser desfeita.")) {
            localStorage.removeItem('regattaAppData');
            window.location.reload();
        }
    };

    return (
        <div className="space-y-6">
            <Card title="Configurações do Campeonato">
                <form onSubmit={handleSubmit}>
                    <div className="grid md:grid-cols-2 gap-4">
                        <Input label="Título do Campeonato" id="championshipTitle" name="championshipTitle" type="text" value={formData.championshipTitle || ''} onChange={handleInputChange} required />
                        <Input label="Local do Campeonato" id="location" name="location" type="text" value={formData.location || ''} onChange={handleInputChange} required />
                        <Input label="Período do Campeonato" id="dates" name="dates" type="text" value={formData.dates || ''} onChange={handleInputChange} />
                        <Input label="Organizador" id="organizer" name="organizer" type="text" value={formData.organizer || ''} onChange={handleInputChange} />
                    </div>
                    <Textarea label="Descrição do Evento" id="description" name="description" value={formData.description || ''} onChange={handleInputChange} rows={4} />
                    <div className="mt-4">
                        <Button type="submit" isLoading={isProcessing}>
                            {currentSettings ? 'Atualizar Configurações' : 'Salvar Configurações'}
                        </Button>
                    </div>
                </form>
            </Card>

            <Card title="Gerenciamento de Dados">
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-yellow-800">Limpar Dados Locais</h3>
                        <p className="text-sm text-yellow-700">Esta ação irá apagar todos os dados salvos no seu navegador. Use com cuidado.</p>
                    </div>
                    <Button variant="danger" onClick={handleClearData}>
                        Apagar Tudo
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default SettingsTab;