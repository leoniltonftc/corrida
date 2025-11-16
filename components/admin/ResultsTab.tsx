import React, { useState, useEffect, useMemo } from 'react';
import type { AppData, Result } from '../../types';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Select } from '../common/Select';
import { Input } from '../common/Input';
import { formatElapsedTime, exportToCsv, printReport } from '../../utils/helpers';

interface ResultsTabProps {
  data: AppData;
  handleDataUpdate: (prompt: string, optimisticUpdate?: (prevData: AppData) => AppData) => Promise<void>;
  isProcessing: boolean;
}

const ResultsTab: React.FC<ResultsTabProps> = ({ data, handleDataUpdate, isProcessing }) => {
    const [formData, setFormData] = useState<Partial<Result>>({});
    const [editingResult, setEditingResult] = useState<Result | null>(null);
    const [currentTime, setCurrentTime] = useState(Date.now());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(Date.now()), 100);
        return () => clearInterval(timer);
    }, []);

    const resetForm = () => {
        setFormData({});
        setEditingResult(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'position' ? parseInt(value) : value }));
    };

    const handleEdit = (result: Result) => {
        setEditingResult(result);
        setFormData({
            raceId: result.raceId,
            teamId: result.teamId,
            position: result.position,
            notes: result.notes,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (result: Result) => {
        const teamName = data.teams.find(t => t.id === result.teamId)?.name || 'Equipe desconhecida';
        if (window.confirm(`Tem certeza que deseja excluir o resultado da equipe "${teamName}"?`)) {
            const prompt = `Delete the item with type 'result' and id '${result.id}' from the data.`;
            const optimisticUpdate = (prevData: AppData) => ({
                ...prevData,
                results: prevData.results.filter(r => r.id !== result.id),
            });
            await handleDataUpdate(prompt, optimisticUpdate);
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { raceId, teamId, position } = formData;
        if (!raceId || !teamId || !position) {
            alert('Corrida, equipe e posição são campos obrigatórios.');
            return;
        }

        const race = data.races.find(r => r.id === raceId);
        let finishTime: string | undefined;
        let elapsedTimeMs: number | undefined;

        if (race?.status === 'active' && race.startTime) {
            elapsedTimeMs = currentTime - new Date(race.startTime).getTime();
            finishTime = formatElapsedTime(elapsedTimeMs);
        }

        let prompt;
        let optimisticUpdate;
        const resultPayload = { ...formData, finishTime, elapsedTimeMs };

        if (editingResult) {
            const updatedResult = { ...editingResult, ...resultPayload };
            prompt = `Update the following item of type 'result' in the data: ${JSON.stringify(updatedResult)}`;
            optimisticUpdate = (prevData: AppData) => ({
                ...prevData,
                results: prevData.results.map(r => r.id === updatedResult.id ? updatedResult : r),
            });
        } else {
            const newResult: Result = {
                id: `result_${Date.now()}`,
                type: 'result',
                timestamp: new Date().toISOString(),
                ...resultPayload,
            } as Result;
            prompt = `Add the following new item of type 'result' to the data: ${JSON.stringify(newResult)}`;
            optimisticUpdate = (prevData: AppData) => ({
                ...prevData,
                results: [...prevData.results, newResult],
            });
        }
        await handleDataUpdate(prompt, optimisticUpdate);
        resetForm();
    };

    const eligibleTeams = useMemo(() => {
        if (!formData.raceId) return [];
        const race = data.races.find(r => r.id === formData.raceId);
        if (!race) return [];

        const teamsInRace = data.teams.filter(t => t.categoryId === race.categoryId);
        const teamsWithResult = data.results
            .filter(r => r.raceId === formData.raceId)
            .map(r => r.teamId);
            
        return teamsInRace.filter(t => !teamsWithResult.includes(t.id));
    }, [formData.raceId, data.races, data.teams, data.results]);

    const timerDisplay = useMemo(() => {
        if (!formData.raceId) return null;
        const race = data.races.find(r => r.id === formData.raceId);
        if (race?.status !== 'active' || !race.startTime) return null;

        const elapsed = currentTime - new Date(race.startTime).getTime();
        return <div className="mt-2 p-2 bg-green-100 text-green-800 rounded-lg text-center font-mono">⏱️ Tempo Atual: {formatElapsedTime(elapsed)}</div>;

    }, [formData.raceId, data.races, currentTime]);

    const handleExport = () => {
        const dataToExport = data.results
            .sort((a,b) => a.position - b.position)
            .sort((a,b) => (data.races.find(r => r.id === a.raceId)?.date || '')
            .localeCompare(data.races.find(r => r.id === b.raceId)?.date || ''))
            .map(result => ({
            posicao: result.position,
            corrida: data.races.find(r => r.id === result.raceId)?.name || result.raceId,
            equipe: data.teams.find(t => t.id === result.teamId)?.name || result.teamId,
            tempo_final: result.finishTime,
            tempo_em_ms: result.elapsedTimeMs,
            observacoes: result.notes,
            timestamp_registro: new Date(result.timestamp).toLocaleString('pt-BR'),
        }));
        exportToCsv('resultados.csv', dataToExport);
    };

    const handlePrint = () => {
        const title = 'Relatório de Resultados';
        let content = '';
        
        const resultsByRace = data.results.reduce((acc, result) => {
            (acc[result.raceId] = acc[result.raceId] || []).push(result);
            return acc;
        }, {} as Record<string, AppData['results']>);
    
        for (const raceId in resultsByRace) {
            const race = data.races.find(r => r.id === raceId);
            if (race) {
                content += `<h2>${race.name} - ${data.categories.find(c => c.id === race.categoryId)?.name || 'N/A'}</h2>`;
                const sortedResults = resultsByRace[raceId].sort((a, b) => a.position - b.position);
                
                const tableHeader = `
                    <thead>
                        <tr>
                            <th>Pos.</th>
                            <th>Equipe</th>
                            <th>Popeiro</th>
                            <th>Tempo</th>
                            <th>Observações</th>
                        </tr>
                    </thead>
                `;
                const tableBody = sortedResults.map(result => {
                    const team = data.teams.find(t => t.id === result.teamId);
                    return `
                        <tr>
                            <td><b>${result.position}º</b></td>
                            <td>${team?.name || 'N/A'}</td>
                            <td>${team?.skipper || 'N/A'}</td>
                            <td>${result.finishTime || '-'}</td>
                            <td>${result.notes || ''}</td>
                        </tr>
                    `;
                }).join('');
                
                content += `<table>${tableHeader}<tbody>${tableBody}</tbody></table>`;
            }
        }
    
        if (!content) {
            content = '<p>Nenhum resultado registrado para gerar o relatório.</p>';
        }
    
        printReport(title, content);
    };

    return (
        <div className="space-y-6">
            <Card title={editingResult ? "Editar Resultado" : "Registrar Resultado"}>
                <form onSubmit={handleSubmit}>
                    <div className="grid md:grid-cols-2 gap-4">
                        <Select label="Corrida" id="result-race" name="raceId" value={formData.raceId || ''} onChange={handleInputChange} required>
                            <option value="">Selecione a corrida</option>
                            {data.races.map(race => <option key={race.id} value={race.id}>{race.name}</option>)}
                        </Select>
                        <Select label="Equipe" id="result-team" name="teamId" value={formData.teamId || ''} onChange={handleInputChange} required disabled={!formData.raceId}>
                            <option value="">Selecione a equipe</option>
                            {editingResult && <option key={editingResult.teamId} value={editingResult.teamId}>{data.teams.find(t => t.id === editingResult.teamId)?.name}</option>}
                            {eligibleTeams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                        </Select>
                        <Input label="Posição" id="result-position" name="position" type="number" min="1" value={formData.position || ''} onChange={handleInputChange} required />
                        <Input label="Observações" id="result-notes" name="notes" type="text" value={formData.notes || ''} onChange={handleInputChange} placeholder="Ex: Penalização, etc." />
                    </div>
                     {timerDisplay}
                    <div className="flex gap-4 mt-4">
                        <Button type="submit" isLoading={isProcessing} variant={editingResult ? 'warning' : 'primary'}>
                            {editingResult ? 'Atualizar Resultado' : 'Registrar Resultado'}
                        </Button>
                        {editingResult && <Button type="button" variant="secondary" onClick={resetForm}>Cancelar</Button>}
                    </div>
                </form>
            </Card>

            <Card 
                title="Resultados Registrados"
                actions={<>
                    <Button onClick={handleExport} variant="secondary" size="sm">Exportar para CSV</Button>
                    <Button onClick={handlePrint} variant="secondary" size="sm">Imprimir / PDF</Button>
                </>}
            >
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3">Pos.</th>
                                <th className="p-3">Corrida</th>
                                <th className="p-3">Equipe</th>
                                <th className="p-3">Tempo</th>
                                <th className="p-3">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.results.map(result => {
                                const raceName = data.races.find(r => r.id === result.raceId)?.name || 'N/A';
                                const teamName = data.teams.find(t => t.id === result.teamId)?.name || 'N/A';
                                return (
                                <tr key={result.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3 font-bold">{result.position}º</td>
                                    <td className="p-3">{raceName}</td>
                                    <td className="p-3 font-semibold">{teamName}</td>
                                    <td className="p-3 font-mono">{result.finishTime || '-'}</td>
                                    <td className="p-3">
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="warning" onClick={() => handleEdit(result)}>Editar</Button>
                                            <Button size="sm" variant="danger" onClick={() => handleDelete(result)}>Excluir</Button>
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default ResultsTab;