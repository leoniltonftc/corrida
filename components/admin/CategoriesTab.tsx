import React, { useState, useEffect } from 'react';
import type { AppData, Category } from '../../types';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';
import { exportToCsv, printReport } from '../../utils/helpers';

interface CategoriesTabProps {
  data: AppData;
  handleDataUpdate: (prompt: string, optimisticUpdate?: (prevData: AppData) => AppData) => Promise<void>;
  isProcessing: boolean;
}

const CategoriesTab: React.FC<CategoriesTabProps> = ({ data, handleDataUpdate, isProcessing }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const resetForm = () => {
        setName('');
        setDescription('');
        setEditingCategory(null);
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setName(category.name);
        setDescription(category.description || '');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (category: Category) => {
        if (window.confirm(`Tem certeza que deseja excluir a categoria "${category.name}"?`)) {
            const isUsed = data.teams.some(t => t.categoryId === category.id) || data.races.some(r => r.categoryId === category.id);
            if (isUsed) {
                alert('Não é possível excluir esta categoria pois ela está sendo usada por equipes ou corridas.');
                return;
            }
            const prompt = `Delete the item with type 'category' and id '${category.id}' from the data.`;
            const optimisticUpdate = (prevData: AppData) => ({
                ...prevData,
                categories: prevData.categories.filter(c => c.id !== category.id),
            });
            await handleDataUpdate(prompt, optimisticUpdate);
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) {
            alert('O nome da categoria é obrigatório.');
            return;
        }

        let prompt;
        let optimisticUpdate;

        if (editingCategory) {
            const updatedCategory = { ...editingCategory, name, description };
            prompt = `Update the following item of type 'category' in the data: ${JSON.stringify(updatedCategory)}`;
            optimisticUpdate = (prevData: AppData) => ({
                ...prevData,
                categories: prevData.categories.map(c => c.id === updatedCategory.id ? updatedCategory : c),
            });
        } else {
            const newCategory: Category = {
                id: `cat_${Date.now()}`,
                type: 'category',
                name,
                description,
            };
            prompt = `Add the following new item of type 'category' to the data: ${JSON.stringify(newCategory)}`;
            optimisticUpdate = (prevData: AppData) => ({
                ...prevData,
                categories: [...prevData.categories, newCategory],
            });
        }
        await handleDataUpdate(prompt, optimisticUpdate);
        resetForm();
    };

    const handleExport = () => {
        const dataToExport = data.categories.map(c => {
            const teams = data.teams
                .filter(t => t.categoryId === c.id)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(t => `${t.name} ${t.cidade ? `(${t.cidade})` : ''}`)
                .join('; ');
            return {
                nome: c.name,
                descricao: c.description,
                equipes_inscritas: teams || 'Nenhuma',
            };
        });
        exportToCsv('categorias.csv', dataToExport);
    };

    const handlePrint = () => {
        const title = 'Relatório de Categorias';
        const tableHeader = `
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Descrição</th>
                    <th>Equipes Inscritas</th>
                </tr>
            </thead>
        `;
        const tableBody = data.categories.map(category => {
            const teamsList = data.teams
                .filter(t => t.categoryId === category.id)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(t => `${t.name} ${t.cidade ? `(${t.cidade})` : ''}`)
                .join(', ');

            return `
                <tr>
                    <td>${category.name}</td>
                    <td>${category.description || ''}</td>
                    <td>${teamsList || 'Nenhuma'}</td>
                </tr>
            `
        }).join('');
        
        const content = `<table>${tableHeader}<tbody>${tableBody}</tbody></table>`;
        printReport(title, content);
    };


    return (
        <div className="space-y-6">
            <Card title={editingCategory ? "Editar Categoria" : "Cadastrar Nova Categoria"}>
                <form onSubmit={handleSubmit}>
                    <Input label="Nome da Categoria" id="category-name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Laser Standard" required />
                    <Textarea label="Descrição" id="category-description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Descrição da categoria, regras específicas, etc." rows={3} />
                    <div className="flex gap-4 mt-4">
                        <Button type="submit" isLoading={isProcessing} variant={editingCategory ? 'warning' : 'primary'}>
                            {editingCategory ? 'Atualizar Categoria' : 'Cadastrar Categoria'}
                        </Button>
                        {editingCategory && <Button type="button" variant="secondary" onClick={resetForm}>Cancelar Edição</Button>}
                    </div>
                </form>
            </Card>

            <Card 
                title="Categorias Cadastradas"
                actions={<>
                    <Button onClick={handleExport} variant="secondary" size="sm">Exportar para CSV</Button>
                    <Button onClick={handlePrint} variant="secondary" size="sm">Imprimir / PDF</Button>
                </>}
            >
                {data.categories.length === 0 ? (
                    <p className="text-center text-slate-400 py-4">Nenhuma categoria cadastrada ainda.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-700/50">
                                <tr>
                                    <th className="p-3">Categoria</th>
                                    <th className="p-3">Descrição</th>
                                    <th className="p-3">Equipes Inscritas</th>
                                    <th className="p-3">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.categories.map(category => {
                                    const registeredTeams = data.teams
                                        .filter(t => t.categoryId === category.id)
                                        .sort((a, b) => a.name.localeCompare(b.name));
                                    return (
                                        <tr key={category.id} className="border-b border-slate-700 hover:bg-slate-700/80">
                                            <td className="p-3 font-semibold">{category.name}</td>
                                            <td className="p-3 text-slate-400">{category.description || '-'}</td>
                                            <td className="p-3 text-sm text-slate-300">
                                                {registeredTeams.length > 0 ? (
                                                    <div>
                                                        <span className="font-bold">{registeredTeams.length} equipe(s)</span>
                                                        <ul className="list-disc list-inside text-xs pl-1">
                                                            {registeredTeams.map(t => <li key={t.id}>{t.name} {t.cidade && `(${t.cidade})`}</li>)}
                                                        </ul>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-500">Nenhuma equipe</span>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="warning" onClick={() => handleEdit(category)}>Editar</Button>
                                                    <Button size="sm" variant="danger" onClick={() => handleDelete(category)}>Excluir</Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default CategoriesTab;