import React, { useState, useMemo } from 'react';
import { LedgerConfig, LedgerRecord, LedgerField } from '../../types';
import { Button, Badge } from '../ui';
import { Trash2, Edit2, CheckSquare, Square, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../utils/cn';

export function LedgerTable({ 
  config, 
  data, 
  selectedIds, 
  isBatchEditingMode = false,
  onSelectionChange,
  onEdit,
  onDelete,
  onRecordChange
}: { 
  config: LedgerConfig; 
  data: LedgerRecord[]; 
  selectedIds: string[]; 
  isBatchEditingMode?: boolean;
  onSelectionChange: (ids: string[]) => void;
  onEdit: (record: LedgerRecord) => void;
  onDelete: (id: string) => void;
  onRecordChange?: (id: string, key: string, value: any) => void;
}) {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const toggleAll = () => {
    if (selectedIds.length === data.length && data.length > 0) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map(d => d.id));
    }
  };
  
  const toggleRow = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(i => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const handleSort = (key: string) => {
    if (sortField === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortField(null);
        setSortDirection('asc');
      }
    } else {
      setSortField(key);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortField) return data;
    
    return [...data].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (aVal === bVal) return 0;
      if (aVal == null || aVal === '') return sortDirection === 'asc' ? 1 : -1;
      if (bVal == null || bVal === '') return sortDirection === 'asc' ? -1 : 1;
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      const aStr = String(aVal);
      const bStr = String(bVal);
      return sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }, [data, sortField, sortDirection]);
  
  const renderCellContent = (record: LedgerRecord, field: LedgerField, isSelected: boolean) => {
    const value = record[field.key];
    
    if (isBatchEditingMode && isSelected) {
      if (field.type === 'select' || field.type === 'status') {
        return (
          <select 
            value={value || ''}
            onChange={(e) => onRecordChange?.(record.id, field.key, e.target.value)}
            className="w-full h-8 text-sm border-slate-200 rounded px-2 focus:ring-1 focus:ring-[#5185ca] focus:border-[#5185ca]"
            onClick={e => e.stopPropagation()}
          >
            <option value="">请选择</option>
            {field.options?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      }
      
      if (field.type === 'date') {
        return (
          <input 
            type="date"
            value={value || ''}
            onChange={(e) => onRecordChange?.(record.id, field.key, e.target.value)}
            className="w-full h-8 text-sm border-slate-200 rounded px-2 focus:ring-1 focus:ring-[#5185ca] focus:border-[#5185ca]"
            onClick={e => e.stopPropagation()}
          />
        );
      }

      if (field.type === 'number') {
        return (
          <input 
            type="number"
            value={value || ''}
            onChange={(e) => onRecordChange?.(record.id, field.key, Number(e.target.value))}
            className="w-full h-8 text-sm border-slate-200 rounded px-2 focus:ring-1 focus:ring-[#5185ca] focus:border-[#5185ca]"
            onClick={e => e.stopPropagation()}
          />
        );
      }

      return (
        <input 
          type="text"
          value={value || ''}
          onChange={(e) => onRecordChange?.(record.id, field.key, e.target.value)}
          className="w-full h-8 text-sm border-slate-200 rounded px-2 focus:ring-1 focus:ring-[#5185ca] focus:border-[#5185ca]"
          onClick={e => e.stopPropagation()}
        />
      );
    }

    if (value == null || value === '') {
      return <span className="text-slate-300">-</span>;
    }
    
    if (field.type === 'status') {
      const variant = value === '已离职' || value === '闲置' || value === '已取消' ? 'danger' 
                    : value === '试用期' || value === '已预约' || value === '商务谈判' ? 'warning' 
                    : 'success';
      return <Badge variant={variant}>{value}</Badge>;
    }
    
    if (field.type === 'number' && typeof value === 'number') {
      return <span className="font-mono text-slate-700">{value.toLocaleString()}</span>;
    }
    
    return <span className="text-slate-700 truncate block">{value}</span>;
  };
  
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Table Area */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-[#5185ca] sticky top-0 z-20 text-white font-medium">
            <tr>
              <th className="px-4 py-3 w-12 text-center border-r border-[#6997d4]">
                <button 
                  onClick={toggleAll}
                  className="flex items-center justify-center p-0.5 text-white/80 hover:text-white"
                >
                  {selectedIds.length === data.length && data.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-white" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="px-4 py-3 w-12 text-center border-r border-[#6997d4]">
                序列
              </th>
              {config.fields.map(field => {
                const isSorted = sortField === field.key;
                return (
                  <th 
                    key={field.key} 
                    onClick={() => handleSort(field.key)}
                    className="px-4 py-3 select-none hover:bg-[#4372af] cursor-pointer group border-r border-[#6997d4] transition-colors"
                  >
                    <div className="flex items-center justify-center">
                      {field.name}
                      <div className="w-3.5 h-3.5 ml-1 flex items-center justify-center">
                        {isSorted ? (
                          sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 transition-opacity" />
                        )}
                      </div>
                    </div>
                  </th>
                );
              })}
              <th className="px-4 py-3 text-center sticky right-0 bg-[#5185ca] border-l border-[#6997d4] z-20 w-28 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedData.map((record, index) => {
              const isSelected = selectedIds.includes(record.id);
              return (
                <tr 
                  key={record.id} 
                  className={cn("hover:bg-slate-50/50 transition-colors group cursor-pointer", isSelected && "bg-blue-50/30 font-medium")}
                  onClick={() => toggleRow(record.id)}
                >
                  <td className="px-4 py-3 text-center border-r border-slate-100" onClick={(e) => { e.stopPropagation(); toggleRow(record.id); }}>
                    <button className="flex items-center justify-center w-full text-slate-400 hover:text-slate-600 transition-colors">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#5185ca]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center border-r border-slate-100 text-slate-500">
                    {index + 1}
                  </td>
                  {config.fields.map(field => (
                    <td key={field.key} className={cn("px-4 py-3 max-w-[200px] border-r border-slate-100 text-center", isBatchEditingMode && isSelected && "p-2")}>
                      {renderCellContent(record, field, isSelected)}
                    </td>
                  ))}
                  <td className={cn("px-4 py-3 text-center sticky right-0 border-l border-slate-100 transition-colors", isSelected ? "bg-[#eef2ff]" : "bg-white group-hover:bg-[#f8fafc]")}>
                    <div className="flex items-center justify-center space-x-1" onClick={e => e.stopPropagation()}>
                      <button className="p-1.5 text-slate-400 hover:text-slate-700 rounded" title="查看">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded" onClick={() => onEdit(record)} title="编辑">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-red-600 rounded" onClick={() => onDelete(record.id)} title="删除">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            
            {data.length === 0 && (
              <tr>
                <td colSpan={config.fields.length + 3} className="px-4 py-12 text-center text-slate-500">
                  <p>暂无数据</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Footer */}
      <div className="flex items-center justify-between p-4 border-t border-slate-100 text-sm text-slate-500">
        <div>共 {data.length} 条记录</div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>上一页</Button>
          <span className="px-3 py-1 font-medium text-slate-700">1</span>
          <Button variant="outline" size="sm" disabled>下一页</Button>
        </div>
      </div>
    </div>
  );
}
