import React, { useState, useEffect } from 'react';
import type { AppData, Race } from '../../types';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { getWeatherForecast } from '../../services/weatherService';
import { exportToCsv, printReport } from '../../utils/helpers';

interface RacesTabProps {
  data: AppData;
  handleDataUpdate: (prompt: string, optimisticUpdate?: (prevData: AppData) => AppData) => Promise<void>;
  isProcessing: boolean;
  obsMasterEnabled: boolean;
  setObsMasterEnabled: (enabled: boolean) => void;
}

const RacesTab: React.FC<RacesTabProps> = ({ data, handleDataUpdate, isProcessing, obsMasterEnabled, setObsMasterEnabled }) => {
    const [formData, setFormData] = useState<Partial<Race> & { date?: string }>({ status: 'scheduled', obsVisible: true });
    const [editingRace, setEditingRace] = useState<Race | null>(null);
    const [isWeatherLoading, setIsWeatherLoading] = useState(false);

    useEffect(() => {
      const fetchWeather = async () => {
        if (formData.date) {
          setIsWeatherLoading(true);
          try {
            const weatherInfo = await getWeatherForecast(formData.date);
            if (weatherInfo) {
              setFormData(prev => ({ ...prev, ...weatherInfo }));
            } else {
              setFormData(prev => ({ 
                  ...prev, 
                  windSpeed: undefined, 
                  windDirection: undefined,
                  temperature: undefined,
                  rain: undefined,
                  humidity: undefined
              }));
            }
          } catch (error) {
            console.error("Falha ao buscar previsão do tempo:", error);
             setFormData(prev => ({ 
                  ...prev, 
                  windSpeed: undefined, 
                  windDirection: undefined,
                  temperature: undefined,
                  rain: undefined,
                  humidity: undefined
              }));
          } finally {
            setIsWeatherLoading(false);
          }
        }
      };
      
      const dateChanged = editingRace ? formData.date !== editingRace.date.substring(0, 16) : !!formData.date;
      if (dateChanged) {
        const timer = setTimeout(fetchWeather, 500); // Debounce de 0.5s
        return () => clearTimeout(timer);
      }
    }, [formData.date, editingRace]);

    const resetForm = () => {
        setFormData({ status: 'scheduled', obsVisible: true });
        setEditingRace(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEdit = (race: Race) => {
        setEditingRace(race);
        setFormData({
            name: race.name,
            categoryId: race.categoryId,
            date: race.date.substring(0, 16), // Formato para datetime-local
            windSpeed: race.windSpeed,
            windDirection: race.windDirection,
            temperature: race.temperature,
            rain: race.rain,
            humidity: race.humidity,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (race: Race) => {
        if (window.confirm(`Tem certeza que deseja excluir a corrida "${race.name}"?`)) {
            if (data.results.some(r => r.raceId === race.id)) {
                alert('Não é possível excluir esta corrida, pois existem resultados associados a ela.');
                return;
            }
            const prompt = `Delete the item with type 'race' and id '${race.id}' from the data.`;
            const optimisticUpdate = (prevData: AppData) => ({
                ...prevData,
                races: prevData.races.filter(r => r.id !== race.id),
            });
            await handleDataUpdate(prompt, optimisticUpdate);
        }
    };

    const handleStatusChange = async (race: Race, newStatus: Race['status']) => {
        if (newStatus === 'active') {
            const alreadyActiveRace = data.races.find(r => r.id !== race.id && r.status === 'active');
            if (alreadyActiveRace) {
                alert(`A corrida "${alreadyActiveRace.name}" já está ativa. Finalize-a antes de iniciar uma nova.`);
                return;
            }
        }

        const updatedRace = { ...race, status: newStatus };
        if (newStatus === 'active' && !race.startTime) {
            updatedRace.startTime = new Date().toISOString();
        }
        const prompt = `Update the following item of type 'race' in the data: ${JSON.stringify(updatedRace)}`;
        const optimisticUpdate = (prevData: AppData) => ({
            ...prevData,
            races: prevData.races.map(r => r.id === race.id ? updatedRace : r),
        });
        await handleDataUpdate(prompt, optimisticUpdate);
    };

    const toggleObsVisibility = async (race: Race) => {
        const updatedRace = { ...race, obsVisible: !race.obsVisible };
        const prompt = `Update the following item of type 'race' in the data: ${JSON.stringify(updatedRace)}`;
        const optimisticUpdate = (prevData: AppData) => ({
            ...prevData,
            races: prevData.races.map(r => r.id === race.id ? updatedRace : r),
        });
        await handleDataUpdate(prompt, optimisticUpdate);
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { name, categoryId, date } = formData;
        if (!name || !categoryId || !date) {
            alert('Nome da corrida, categoria e data são campos obrigatórios.');
            return;
        }

        let prompt;
        let optimisticUpdate;
        const racePayload = { ...formData, date: new Date(date).toISOString() };

        if (editingRace) {
            const updatedRace = { ...editingRace, ...racePayload };
            prompt = `Update the following item of type 'race' in the data: ${JSON.stringify(updatedRace)}`;
            optimisticUpdate = (prevData: AppData) => ({
                ...prevData,
                races: prevData.races.map(r => r.id === updatedRace.id ? updatedRace : r),
            });
        } else {
            const newRace: Race = {
                id: `race_${Date.now()}`,
                type: 'race',
                timestamp: new Date().toISOString(),
                ...racePayload,
            } as Race;
            prompt = `Add the following new item of type 'race' to the data: ${JSON.stringify(newRace)}`;
            optimisticUpdate = (prevData: AppData) => ({
                ...prevData,
                races: [...prevData.races, newRace],
            });
        }
        await handleDataUpdate(prompt, optimisticUpdate);
        resetForm();
    };

    const getStatusBadge = (status: Race['status']) => {
        const styles: Record<Race['status'], string> = {
            scheduled: "bg-teal-500/20 text-teal-300",
            active: "bg-emerald-500/20 text-emerald-300 animate-pulse",
            finished: "bg-slate-600/50 text-slate-300",
        };
        const text: Record<Race['status'], string> = {
            scheduled: "Programada",
            active: "Ativa",
            finished: "Finalizada",
        };
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{text[status]}</span>;
    };
    
    const racesWithResults = data.races.filter(race => race.status === 'active' || race.status === 'finished' || data.results.some(res => res.raceId === race.id));

    const handleExport = () => {
        const dataToExport = data.races.map(race => ({
            corrida: race.name,
            categoria: data.categories.find(c => c.id === race.categoryId)?.name || race.categoryId,
            data_hora: new Date(race.date).toLocaleString('pt-BR'),
            status: race.status,
            hora_inicio: race.startTime ? new Date(race.startTime).toLocaleTimeString('pt-BR') : '',
            vento_velocidade_kmh: race.windSpeed,
            vento_direcao: race.windDirection,
            temperatura_c: race.temperature,
            chuva_mm: race.rain,
            umidade_percentual: race.humidity,
            visivel_no_obs: race.obsVisible,
        }));
        exportToCsv('corridas.csv', dataToExport);
    };

    const handlePrint = () => {
        const title = 'Relatório de Corridas';
        const tableHeader = `
            <thead>
                <tr>
                    <th>Corrida</th>
                    <th>Categoria</th>
                    <th>Data/Hora</th>
                    <th>Status</th>
                    <th>Clima</th>
                </tr>
            </thead>
        `;
        const tableBody = data.races.map(race => {
            const clima = [
                race.windSpeed ? `Vento: ${race.windSpeed}km/h ${race.windDirection}` : '',
                race.temperature ? `Temp: ${race.temperature}°C` : '',
                race.rain ? `Chuva: ${race.rain}mm` : '',
                race.humidity ? `Umidade: ${race.humidity}%` : ''
            ].filter(Boolean).join('<br>');
    
            return `
                <tr>
                    <td>${race.name}</td>
                    <td>${data.categories.find(c => c.id === race.categoryId)?.name || 'N/A'}</td>
                    <td>${new Date(race.date).toLocaleString('pt-BR')}</td>
                    <td>${race.status}</td>
                    <td>${clima || '-'}</td>
                </tr>
            `;
        }).join('');
    
        const content = `<table>${tableHeader}<tbody>${tableBody}</tbody></table>`;
        printReport(title, content);
    };


    return (
         <div className="space-y-6">
            <Card title={editingRace ? "Editar Corrida" : "Criar Nova Corrida"}>
                <form onSubmit={handleSubmit}>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Input label="Nome da Corrida" id="race-name" name="name" type="text" value={formData.name || ''} onChange={handleInputChange} required />
                        <Select label="Categoria" id="race-category" name="categoryId" value={formData.categoryId || ''} onChange={handleInputChange} required>
                            <option value="">Selecione a categoria</option>
                            {data.categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </Select>
                        <Input label="Data e Hora" id="race-date" name="date" type="datetime-local" value={formData.date || ''} onChange={handleInputChange} required />
                        
                        <Input label="Velocidade do Vento (km/h)" id="race-wind-speed" name="windSpeed" type="text" value={formData.windSpeed === undefined ? '' : formData.windSpeed} readOnly disabled placeholder="Aguardando data..." isLoading={isWeatherLoading} />
                        <Input label="Direção do Vento" id="race-wind-dir" name="windDirection" type="text" value={formData.windDirection || ''} readOnly disabled placeholder="Aguardando data..." />
                        <Input label="Temperatura (°C)" id="race-temp" name="temperature" type="text" value={formData.temperature === undefined ? '' : formData.temperature} readOnly disabled placeholder="Aguardando data..." />
                        <Input label="Chuva (mm)" id="race-rain" name="rain" type="text" value={formData.rain === undefined ? '' : formData.rain} readOnly disabled placeholder="Aguardando data..." />
                        <Input label="Umidade (%)" id="race-humidity" name="humidity" type="text" value={formData.humidity === undefined ? '' : formData.humidity} readOnly disabled placeholder="Aguardando data..." />
                    </div>
                    <div className="flex gap-4 mt-4">
                        <Button type="submit" isLoading={isProcessing} variant={editingRace ? 'warning' : 'primary'}>
                            {editingRace ? 'Atualizar Corrida' : 'Criar Corrida'}
                        </Button>
                        {editingRace && <Button type="button" variant="secondary" onClick={resetForm}>Cancelar</Button>}
                    </div>
                </form>
            </Card>

            <Card 
                title="Corridas Programadas"
                actions={<>
                    <Button onClick={handleExport} variant="secondary" size="sm">Exportar para CSV</Button>
                    <Button onClick={handlePrint} variant="secondary" size="sm">Imprimir / PDF</Button>
                </>}
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-700/50">
                            <tr>
                                <th className="p-3">Corrida</th>
                                <th className="p-3">Data/Hora</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.races.map(race => (
                                <tr key={race.id} className="border-b border-slate-700 hover:bg-slate-700/80">
                                    <td className="p-3 font-semibold">{race.name} <br/><small className="font-normal text-slate-400">{data.categories.find(c=>c.id === race.categoryId)?.name}</small></td>
                                    <td className="p-3">{new Date(race.date).toLocaleString('pt-BR')}</td>
                                    <td className="p-3">{getStatusBadge(race.status)}</td>
                                    <td className="p-3">
                                        <div className="flex flex-wrap gap-2">
                                            {race.status === 'scheduled' && <Button size="sm" variant="success" onClick={() => handleStatusChange(race, 'active')}>▶ Iniciar</Button>}
                                            {race.status === 'active' && <Button size="sm" variant="warning" onClick={() => handleStatusChange(race, 'finished')}>⏹️ Finalizar</Button>}
                                            <Button size="sm" variant="warning" onClick={() => handleEdit(race)}>Editar</Button>
                                            <Button size="sm" variant="danger" onClick={() => handleDelete(race)}>Excluir</Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Card title="Controle de Exibição OBS">
                <div className="bg-teal-900/50 border-l-4 border-teal-500 p-4 rounded-r-lg mb-6 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-teal-300">🎥 Controle Mestre do Overlay OBS</h3>
                        <p className="text-sm text-teal-400">O overlay está <strong className={obsMasterEnabled ? 'text-emerald-400' : 'text-rose-400'}>{obsMasterEnabled ? 'ativado' : 'desativado'}</strong>.</p>
                    </div>
                    <Button variant={obsMasterEnabled ? 'danger' : 'success'} onClick={() => setObsMasterEnabled(!obsMasterEnabled)}>
                        {obsMasterEnabled ? 'Desativar Overlay' : 'Ativar Overlay'}
                    </Button>
                </div>

                <h3 className="font-bold text-slate-300 mb-2">Controle Individual por Corrida</h3>
                <p className="text-sm text-slate-400 mb-4">Escolha quais corridas ativas ou finalizadas devem aparecer no overlay.</p>

                <div className="space-y-3">
                    {racesWithResults.length > 0 ? racesWithResults.map(race => (
                        <div key={race.id} className={`p-3 rounded-lg flex justify-between items-center transition-colors ${race.obsVisible ? 'bg-emerald-900/50' : 'bg-slate-700/50'}`}>
                            <div>
                                <p className="font-semibold">{race.name}</p>
                                <p className="text-sm text-slate-400">{data.categories.find(c=>c.id === race.categoryId)?.name}</p>
                            </div>
                            <Button size="sm" variant={race.obsVisible ? 'secondary' : 'primary'} onClick={() => toggleObsVisibility(race)}>
                                {race.obsVisible ? 'Ocultar no OBS' : 'Exibir no OBS'}
                            </Button>
                        </div>
                    )) : <p className="text-center text-slate-500 py-4">Nenhuma corrida ativa ou com resultados para exibir.</p>}
                </div>

            </Card>
        </div>
    );
};

export default RacesTab;