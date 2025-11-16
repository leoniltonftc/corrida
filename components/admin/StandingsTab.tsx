import React, { useMemo } from 'react';
import type { AppData, Standing } from '../../types';
import { Card } from '../common/Card';
import { calculateStandings } from '../../utils/standings';
import { Button } from '../common/Button';
import { exportToCsv, printReport } from '../../utils/helpers';

interface StandingsTabProps {
  data: AppData;
  isProcessing: boolean;
  handleDataUpdate: (prompt: string) => Promise<void>;
}

const StandingsTab: React.FC<StandingsTabProps> = ({ data }) => {
  const { categories, teams, results } = data;

  const standingsByCategory = useMemo(() => {
    const standingMap = new Map<string, Standing[]>();
    categories.forEach(category => {
      const categoryTeams = teams.filter(t => t.categoryId === category.id);
      if (categoryTeams.length > 0) {
        const categoryResults = results.filter(r => categoryTeams.some(t => t.id === r.teamId));
        standingMap.set(category.name, calculateStandings(categoryResults, categoryTeams));
      }
    });
    return standingMap;
  }, [categories, teams, results]);

  const handleExport = () => {
    const allStandings: any[] = [];
    standingsByCategory.forEach((standings, categoryName) => {
        standings.forEach((s, index) => {
            allStandings.push({
                categoria: categoryName,
                posicao: index + 1,
                equipe: s.teamName,
                popeiro: s.skipper,
                tripulacao: s.crew.map(c => `${c.name} (${c.funcao})`).join('; '),
                ultimo_tempo_registrado: s.latestRaceTime || 'N/A',
                melhor_posicao_obtida: s.bestPosition,
            });
        });
    });
    exportToCsv('classificacao_geral.csv', allStandings);
  };

  const handlePrint = () => {
    const title = 'Relatório de Classificação Geral';
    let content = '';

    if (standingsByCategory.size === 0) {
        content = '<p>Nenhuma classificação disponível para gerar o relatório.</p>';
    } else {
        standingsByCategory.forEach((standings, categoryName) => {
            content += `<h2>${categoryName}</h2>`;
            
            const tableHeader = `
                <thead>
                    <tr>
                        <th>Pos.</th>
                        <th>Equipe</th>
                        <th>Popeiro</th>
                        <th>Tripulação</th>
                        <th>Último Tempo</th>
                        <th>Melhor Posição</th>
                    </tr>
                </thead>
            `;
            const tableBody = standings.map((s, index) => `
                <tr>
                    <td><b>${index + 1}º</b></td>
                    <td>${s.teamName}</td>
                    <td>${s.skipper}</td>
                    <td>${s.crew.map(c => c.name).join(', ')}</td>
                    <td>${s.latestRaceTime || '-'}</td>
                    <td>${s.bestPosition ? `${s.bestPosition}º` : '-'}</td>
                </tr>
            `).join('');
            
            content += `<table>${tableHeader}<tbody>${tableBody}</tbody></table>`;
        });
    }

    printReport(title, content);
  };

  return (
    <Card 
      title="Classificação Geral por Categoria"
      actions={<>
        <Button onClick={handleExport} variant="secondary" size="sm">Exportar para CSV</Button>
        <Button onClick={handlePrint} variant="secondary" size="sm">Imprimir / PDF</Button>
      </>}
    >
      {Array.from(standingsByCategory.entries()).map(([categoryName, standings]) => (
        <div key={categoryName} className="mb-8">
          <h3 className="text-xl font-semibold text-blue-700 mb-3">{categoryName}</h3>
          {standings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3">Pos.</th>
                    <th className="p-3">Equipe</th>
                    <th className="p-3">Popeiro</th>
                    <th className="p-3">Tripulação</th>
                    <th className="p-3">Último Tempo</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((s, index) => (
                    <tr key={s.teamId} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-bold">{index + 1}º</td>
                      <td className="p-3 font-semibold">{s.teamName}</td>
                      <td className="p-3 text-gray-600">{s.skipper}</td>
                      <td className="p-3 text-sm text-gray-600">{s.crew.map(c => c.name).join(', ')}</td>
                      <td className="p-3 font-mono">{s.latestRaceTime || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">Nenhum resultado para esta categoria ainda.</p>
          )}
        </div>
      ))}
    </Card>
  );
};

export default StandingsTab;