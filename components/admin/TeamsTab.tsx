import React, { useState, useMemo } from 'react';
import type { AppData, Team, CrewMember, CrewFunction } from '../../types';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { exportToCsv, printReport } from '../../utils/helpers';

interface TeamsTabProps {
  data: AppData;
  handleDataUpdate: (prompt: string, optimisticUpdate?: (prevData: AppData) => AppData) => Promise<void>;
  isProcessing: boolean;
}

const crewFunctions: CrewFunction[] = ['Apoio', 'Bolineiro', 'Estás Mestre', 'Proeiro', 'Topo de Proa', 'Topo de Ré'];

const TeamsTab: React.FC<TeamsTabProps> = ({ data, handleDataUpdate, isProcessing }) => {
    const [formData, setFormData] = useState<Partial<Team>>({});
    const [crew, setCrew] = useState<CrewMember[]>([{ name: '', funcao: 'Apoio' }]);
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);

    const sortedTeams = useMemo(() => {
        return [...data.teams].sort((a, b) => {
            const categoryA = data.categories.find(c => c.id === a.categoryId)?.name || '';
            const categoryB = data.categories.find(c => c.id === b.categoryId)?.name || '';
            if (categoryA.localeCompare(categoryB) !== 0) {
                return categoryA.localeCompare(categoryB);
            }
            return a.name.localeCompare(b.name);
        });
    }, [data.teams, data.categories]);

    const resetForm = () => {
        setFormData({});
        setCrew([{ name: '', funcao: 'Apoio' }]);
        setEditingTeam(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCrewChange = (index: number, field: keyof CrewMember, value: string) => {
        const newCrew = [...crew];
        newCrew[index] = { ...newCrew[index], [field]: value };
        setCrew(newCrew);
    };

    const addCrewMember = () => setCrew([...crew, { name: '', funcao: 'Apoio' }]);
    const removeCrewMember = (index: number) => setCrew(crew.filter((_, i) => i !== index));

    const handleEdit = (team: Team) => {
        setEditingTeam(team);
        setFormData({ name: team.name, cidade: team.cidade, categoryId: team.categoryId, skipper: team.skipper });
        setCrew(team.crew.length > 0 ? team.crew : [{ name: '', funcao: 'Apoio' }]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (team: Team) => {
        if (window.confirm(`Tem certeza que deseja excluir a equipe "${team.name}"?`)) {
            if (data.results.some(r => r.teamId === team.id)) {
                alert('Não é possível excluir esta equipe, pois ela possui resultados registrados.');
                return;
            }
            const prompt = `Delete the item with type 'team' and id '${team.id}' from the data.`;
            const optimisticUpdate = (prevData: AppData) => ({
                ...prevData,
                teams: prevData.teams.filter(t => t.id !== team.id),
            });
            await handleDataUpdate(prompt, optimisticUpdate);
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { name, categoryId, skipper, cidade } = formData;
        if (!name || !cidade || !categoryId || !skipper) {
            alert('Nome da equipe, cidade, categoria e popeiro são campos obrigatórios.');
            return;
        }

        const finalCrew = crew.filter(c => c.name.trim() !== '');
        let prompt;
        let optimisticUpdate;

        if (editingTeam) {
            const updatedTeam = { ...editingTeam, name, cidade, categoryId, skipper, crew: finalCrew };
            prompt = `Update the following item of type 'team' in the data: ${JSON.stringify(updatedTeam)}`;
            optimisticUpdate = (prevData: AppData) => ({
                ...prevData,
                teams: prevData.teams.map(t => t.id === updatedTeam.id ? updatedTeam : t),
            });
        } else {
            const newTeam: Team = {
                id: `team_${Date.now()}`,
                type: 'team',
                crew: finalCrew,
                ...formData,
            } as Team;
            prompt = `Add the following new item of type 'team' to the data: ${JSON.stringify(newTeam)}`;
            optimisticUpdate = (prevData: AppData) => ({
                ...prevData,
                teams: [...prevData.teams, newTeam],
            });
        }
        await handleDataUpdate(prompt, optimisticUpdate);
        resetForm();
    };

    const handleExport = () => {
        const dataToExport = sortedTeams.map(team => ({
            equipe: team.name,
            cidade: team.cidade,
            categoria: data.categories.find(c => c.id === team.categoryId)?.name || team.categoryId,
            popeiro: team.skipper,
            tripulacao: team.crew.map(c => `${c.name} (${c.funcao})`).join('; '),
        }));
        exportToCsv('equipes.csv', dataToExport);
    };

    const handlePrint = () => {
        const title = 'Relatório de Equipes';
        const tableHeader = `
            <thead>
                <tr>
                    <th>Equipe</th>
                    <th>Cidade</th>
                    <th>Categoria</th>
                    <th>Popeiro</th>
                    <th>Tripulação</th>
                </tr>
            </thead>
        `;
        const tableBody = sortedTeams.map(team => `
            <tr>
                <td>${team.name}</td>
                <td>${team.cidade || '-'}</td>
                <td>${data.categories.find(c => c.id === team.categoryId)?.name || 'N/A'}</td>
                <td>${team.skipper}</td>
                <td>${team.crew.map(c => `${c.name} (${c.funcao})`).join(', ') || '-'}</td>
            </tr>
        `).join('');
    
        const content = `<table>${tableHeader}<tbody>${tableBody}</tbody></table>`;
        printReport(title, content);
    };

    return (
        <div className="space-y-6">
            <Card title={editingTeam ? "Editar Equipe" : "Cadastrar Nova Equipe"}>
                <form onSubmit={handleSubmit}>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Input id="team-name" label="Nome da Equipe" name="name" type="text" value={formData.name || ''} onChange={handleInputChange} required />
                        <Input id="team-city" label="Cidade" name="cidade" type="text" value={formData.cidade || ''} onChange={handleInputChange} placeholder="Ex: Aracaju" required />
                        <Select id="team-category" label="Categoria" name="categoryId" value={formData.categoryId || ''} onChange={handleInputChange} required>
                            <option value="">Selecione a categoria</option>
                            {data.categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </Select>
                        <Input id="team-skipper" label="Popeiro da Embarcação" name="skipper" type="text" value={formData.skipper || ''} onChange={handleInputChange} required />
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Tripulação</label>
                        {crew.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] items-center gap-2 mb-1 px-1">
                                <label className="text-xs font-medium text-slate-400">Nome do Tripulante</label>
                                <label className="text-xs font-medium text-slate-400">Função</label>
                                <div></div>
                            </div>
                        )}
                        {crew.map((member, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] items-center gap-2 mb-2">
                                <input
                                    className="w-full p-3 bg-slate-700/50 border-2 border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                                    type="text"
                                    placeholder={`Nome do Tripulante ${index + 1}`}
                                    value={member.name}
                                    onChange={(e) => handleCrewChange(index, 'name', e.target.value)}
                                />
                                <select
                                    className="w-full p-3 bg-slate-700/50 border-2 border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors h-[54px]"
                                    value={member.funcao}
                                    onChange={(e) => handleCrewChange(index, 'funcao', e.target.value as CrewFunction)}
                                >
                                    {crewFunctions.map(func => <option key={func} value={func}>{func}</option>)}
                                </select>
                                {crew.length > 1 ? (
                                    <Button type="button" size="sm" variant="danger" onClick={() => removeCrewMember(index)}>
                                        Remover
                                    </Button>
                                ) : <div />}
                            </div>
                        ))}
                        <Button type="button" size="sm" variant="secondary" onClick={addCrewMember}>
                            Adicionar Tripulante
                        </Button>
                    </div>
                    <div className="flex gap-4 mt-4">
                        <Button type="submit" isLoading={isProcessing} variant={editingTeam ? 'warning' : 'primary'}>
                            {editingTeam ? 'Atualizar Equipe' : 'Cadastrar Equipe'}
                        </Button>
                        {editingTeam && <Button type="button" variant="secondary" onClick={resetForm}>Cancelar</Button>}
                    </div>
                </form>
            </Card>

            <Card 
                title="Equipes Cadastradas"
                actions={<>
                    <Button onClick={handleExport} variant="secondary" size="sm">Exportar para CSV</Button>
                    <Button onClick={handlePrint} variant="secondary" size="sm">Imprimir / PDF</Button>
                </>}
            >
                {sortedTeams.length === 0 ? (
                    <p className="text-center text-slate-400 py-4">Nenhuma equipe cadastrada ainda.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-700/50">
                                <tr>
                                    <th className="p-3">Equipe</th>
                                    <th className="p-3">Cidade</th>
                                    <th className="p-3">Categoria</th>
                                    <th className="p-3">Popeiro</th>
                                    <th className="p-3">Tripulação</th>
                                    <th className="p-3">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedTeams.map(team => (
                                    <tr key={team.id} className="border-b border-slate-700 hover:bg-slate-700/80">
                                        <td className="p-3 font-semibold">{team.name}</td>
                                        <td className="p-3">{team.cidade || '-'}</td>
                                        <td className="p-3">{data.categories.find(c => c.id === team.categoryId)?.name || 'N/A'}</td>
                                        <td className="p-3 text-slate-400">{team.skipper}</td>
                                        <td className="p-3 text-slate-400 text-sm">
                                            {team.crew.map(c => `${c.name} (${c.funcao})`).join(', ') || '-'}
                                        </td>
                                        <td className="p-3">
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="warning" onClick={() => handleEdit(team)}>Editar</Button>
                                                <Button size="sm" variant="danger" onClick={() => handleDelete(team)}>Excluir</Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default TeamsTab;