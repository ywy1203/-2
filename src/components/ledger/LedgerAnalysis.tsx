import React, { useState, useEffect } from 'react';
import { LedgerConfig, LedgerRecord } from '../../types';
import { Button } from '../ui';
import { ComposedChart, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { Settings2, Download, BarChart2, LineChart as LineIcon, PieChart as PieIcon, Plus, X, Trash2, Edit2 } from 'lucide-react';

const COLORS = ['#4a77b0', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

type ChartGroupConfig = {
  id: string;
  type?: 'bar' | 'line' | 'pie';
  xField: string;
  xDateGranularity?: 'year' | 'month' | 'day';
  yType: 'count' | 'sum' | 'avg';
  yField?: string;
};

type ChartConfig = {
  id: string;
  title: string;
  type?: 'bar' | 'line' | 'pie'; // Used for legacy config
  series: ChartGroupConfig[];
  
  // legacy fallback fields
  fieldKey?: string;
  groupKey?: string;
  dateGranularity?: 'year' | 'month' | 'day';
  metrics?: {
    id: string;
    type: 'count' | 'sum' | 'avg';
    fieldKey?: string;
  }[];
};

export function LedgerAnalysis({ config, data }: { config: LedgerConfig, data: LedgerRecord[] }) {
  const categoricalFields = config.fields.filter(f => f.type === 'select' || f.type === 'status' || f.type === 'text' || f.type === 'date');
  const numericFields = config.fields.filter(f => f.type === 'number');
  
  const [charts, setCharts] = useState<ChartConfig[]>(() => {
    const saved = localStorage.getItem(`ledger_charts_${config.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((c: any) => {
          if (c.series) {
             c.series.forEach((s: any) => {
               if (!s.type) s.type = c.type || 'bar';
             });
             return c;
          }
          // migrate legacy chart data to series
          const s1: ChartGroupConfig = {
            id: 's1',
            type: c.type || 'bar',
            xField: c.fieldKey || categoricalFields[0]?.key || '',
            xDateGranularity: c.dateGranularity,
            yType: c.metrics?.[0]?.type || 'count',
            yField: c.metrics?.[0]?.fieldKey,
          };
          const series = [s1];
          if (c.metrics && c.metrics.length > 1) {
             series.push({
               id: 's2',
               type: c.type || 'line',
               xField: c.fieldKey || categoricalFields[0]?.key || '',
               xDateGranularity: c.dateGranularity,
               yType: c.metrics[1].type,
               yField: c.metrics[1].fieldKey,
             });
          }
          return {
             id: c.id,
             title: c.title,
             series
          };
        });
      } catch (e) {
        console.error('Failed to parse saved chart config', e);
      }
    }
    return categoricalFields.slice(0, 4).map(f => ({
      id: Math.random().toString(36).substring(7),
      title: `${f.name}统计`,
      series: [{
        id: 's1',
        type: 'bar',
        xField: f.key,
        yType: 'count'
      }]
    }));
  });

  useEffect(() => {
    localStorage.setItem(`ledger_charts_${config.id}`, JSON.stringify(charts));
  }, [charts, config.id]);

  const [editingChartId, setEditingChartId] = useState<string | null>(null);
  const [detailView, setDetailView] = useState<{ fieldName: string, category: string, records: LedgerRecord[] } | null>(null);

  const addChart = () => {
    const newChart: ChartConfig = {
      id: Math.random().toString(36).substring(7),
      title: '新图表',
      series: [{
         id: Math.random().toString(),
         type: 'bar',
         xField: categoricalFields[0]?.key || '',
         yType: 'count'
      }]
    };
    setCharts([...charts, newChart]);
    setEditingChartId(newChart.id);
  };

  const removeChart = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCharts(charts.filter(c => c.id !== id));
    if (editingChartId === id) setEditingChartId(null);
  };

  const updateChart = (id: string, updates: Partial<ChartConfig>) => {
    setCharts(charts.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const formatDateByGranularity = (dateStr: any, granularity?: 'year' | 'month' | 'day') => {
    if (!dateStr || dateStr === '未知') return '未知';
    const str = String(dateStr);
    const parts = str.split('-');
    if (parts.length >= 1 && granularity === 'year') return parts[0];
    if (parts.length >= 2 && granularity === 'month') return `${parts[0]}-${parts[1]}`;
    return str; // Default to full day or whatever is stored
  };

  const handleChartClick = (chart: ChartConfig, category: string | number) => {
    const isPie = chart.series[0]?.type === 'pie';
    const activeSeries = isPie ? chart.series.slice(0, 1) : chart.series;
    const primarySeries = activeSeries[0];
    if (!primarySeries) return;
    const field = config.fields.find(f => f.key === primarySeries.xField);
    if (!field) return;

    let records = data.filter(r => {
      const val = field.type === 'date' && primarySeries.xDateGranularity 
        ? formatDateByGranularity(r[field.key], primarySeries.xDateGranularity)
        : String(r[field.key] || '未知');
      return val === String(category);
    });
    
    setDetailView({
      fieldName: field.name,
      category: String(category),
      records
    });
  };

  const editingChart = charts.find(c => c.id === editingChartId);

  return (
    <div className="flex h-full bg-[#f1f5f9] relative overflow-hidden">
      <button id="add-chart-btn" className="hidden" onClick={addChart}></button>
      <div className="flex-1 p-4 flex flex-col overflow-auto min-w-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 pb-4">
          {charts.map((chart) => {
             const isEditing = editingChartId === chart.id;
             let seriesDefs: { dataKey: string, name: string, type?: 'bar' | 'line' | 'pie' }[] = [];
             let allData: Record<string, any> = {};
             
             const getMetricName = (sg: ChartGroupConfig) => {
                if (sg.yType === 'count') return '记录数';
                const nf = numericFields.find(f => f.key === sg.yField);
                const fName = nf ? nf.name : '未知字段';
                return sg.yType === 'sum' ? `${fName} (求和)` : `${fName} (平均)`;
             };

             const isPie = chart.series[0]?.type === 'pie';
             const activeSeries = isPie ? chart.series.slice(0, 1) : (chart.series.length > 0 ? chart.series : [{ id: 'null', type: 'bar', xField: '', yType: 'count'} as any]);

             let dynamicSeriesList: any[] = [];
             
             activeSeries.forEach((sg, userSeriesIndex) => {
                 const xFieldDef = config.fields.find(f => f.key === sg.xField);
                 if (!xFieldDef) return;
                 
                 if (sg.yType === 'count' && sg.yField) {
                     // Count by category (Sub-series)
                     const yFieldDef = config.fields.find(f => f.key === sg.yField);
                     const distinctYVals = Array.from(new Set(data.map(row => String(row[sg.yField] || '未知'))));
                     distinctYVals.sort(); // Optional sorting
                     
                     distinctYVals.forEach((yVal) => {
                         dynamicSeriesList.push({
                             isSubSeries: true,
                             xField: sg.xField,
                             xDateGranularity: sg.xDateGranularity,
                             yField: sg.yField,
                             yVal: yVal,
                             type: sg.type,
                             name: yVal
                         });
                     });
                 } else {
                     // Normal
                     const yName = getMetricName(sg);
                     const sName = activeSeries.length > 1 ? `第${userSeriesIndex + 1}组 (${xFieldDef.name}): ${yName}` : yName;
                     dynamicSeriesList.push({
                         isSubSeries: false,
                         xField: sg.xField,
                         xDateGranularity: sg.xDateGranularity,
                         yType: sg.yType,
                         yField: sg.yField,
                         type: sg.type,
                         name: sName
                     });
                 }
             });

             dynamicSeriesList.forEach((sg, sIndex) => {
                const xFieldDef = config.fields.find(f => f.key === sg.xField);
                if (!xFieldDef) return;
                
                const dataKey = `s${sIndex}`;
                seriesDefs.push({ dataKey, name: sg.name, type: sg.type });

                data.forEach(row => {
                  let xVal = String(row[sg.xField] || '未知');
                  if (xFieldDef.type === 'date' && sg.xDateGranularity) {
                    xVal = formatDateByGranularity(xVal, sg.xDateGranularity);
                  }
                  
                  if (!allData[xVal]) {
                    allData[xVal] = { name: xVal, _counts: [], _sums: [] };
                  }
                  
                  while (allData[xVal]._counts.length <= sIndex) allData[xVal]._counts.push(0);
                  while (allData[xVal]._sums.length <= sIndex) allData[xVal]._sums.push(0);

                  let isMatch = true;
                  if (sg.isSubSeries) {
                      isMatch = String(row[sg.yField] || '未知') === sg.yVal;
                  }

                  if (isMatch) {
                      allData[xVal]._counts[sIndex]++;
                      if (!sg.isSubSeries && sg.yType !== 'count' && sg.yField) {
                         allData[xVal]._sums[sIndex] += Number(row[sg.yField] || 0);
                      }
                  }
                });
             });

             let distributionData = Object.values(allData).map((acc: any) => {
                const row: any = { name: acc.name };
                dynamicSeriesList.forEach((sg, sIndex) => {
                   let val = 0;
                   const c = acc._counts[sIndex];
                   if (sg.isSubSeries || sg.yType === 'count') {
                      val = c;
                   } else if (sg.yType === 'sum') {
                      val = acc._sums[sIndex];
                   } else if (sg.yType === 'avg') {
                      val = c > 0 ? acc._sums[sIndex] / c : 0;
                   }
                   row[`s${sIndex}`] = (sg.isSubSeries || sg.yType === 'count') ? val : Number(val.toFixed(2));
                });
                row.value = row.s0;
                return row;
             });

             const firstXField = config.fields.find(f => f.key === dynamicSeriesList[0]?.xField);
             if (firstXField?.type === 'date') {
               distributionData.sort((a,b) => a.name.localeCompare(b.name));
             } else {
               distributionData.sort((a,b) => (b.s0 || 0) - (a.s0 || 0));
             }

             return (
              <div 
                key={chart.id} 
                className={`bg-white rounded-md border ${isEditing ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200'} p-4 shadow-sm flex flex-col min-h-[350px] relative group transition-all`}
                onClick={() => setEditingChartId(chart.id)}
              >
                 <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                   <button 
                     onClick={(e) => { e.stopPropagation(); setEditingChartId(chart.id); }}
                     className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                     title="配置图表"
                   >
                     <Settings2 className="w-4 h-4" />
                   </button>
                   <button 
                     onClick={(e) => removeChart(chart.id, e)}
                     className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                     title="删除图表"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                 </div>

                 <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800 tracking-wide pr-16">{chart.title}</h3>
                 </div>
                 
                 <div className="flex-1 w-full h-full min-h-[220px]">
                   {distributionData.length > 0 ? (
                     <ResponsiveContainer width="100%" height="100%">
                        {!isPie ? (
                           <ComposedChart data={distributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                             <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                             <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
                             {seriesDefs.length > 1 && (
                               <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
                             )}
                             <Tooltip 
                               cursor={{ fill: '#f8fafc' }}
                               contentStyle={{ borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgb(0 0 0 / 0.05)', fontSize: '13px' }}
                             />
                             {seriesDefs.length > 1 && <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />}
                             {seriesDefs.map((sd, idx) => {
                                if (sd.type === 'line') {
                                   return (
                                     <Line 
                                       key={sd.dataKey}
                                       yAxisId={idx === 0 ? 'left' : 'right'}
                                       type="monotone" 
                                       dataKey={sd.dataKey} 
                                       name={sd.name} 
                                       stroke={COLORS[idx % COLORS.length]} 
                                       strokeWidth={2}
                                       activeDot={{ onClick: (e: any, payload: any) => handleChartClick(chart, payload.payload.name), className: 'cursor-pointer', r: 6 }}
                                     />
                                   );
                                } else {
                                   return (
                                     <Bar 
                                       key={sd.dataKey}
                                       yAxisId={idx === 0 ? 'left' : 'right'}
                                       dataKey={sd.dataKey} 
                                       name={sd.name} 
                                       fill={seriesDefs.length > 1 ? COLORS[idx % COLORS.length] : undefined}
                                       radius={[2, 2, 0, 0]} 
                                       maxBarSize={40}
                                       onClick={(data) => handleChartClick(chart, data.name)}
                                       className="cursor-pointer"
                                     >
                                       {seriesDefs.length === 1 && distributionData.map((entry, eIdx) => (
                                         <Cell key={`cell-${eIdx}`} fill={COLORS[eIdx % COLORS.length]} className="hover:opacity-80 transition-opacity" />
                                       ))}
                                     </Bar>
                                   );
                                }
                             })}
                           </ComposedChart>
                        ) : (
                           <RechartsPieChart>
                             <Pie
                               data={distributionData}
                               cx="50%"
                               cy="50%"
                               innerRadius={60}
                               outerRadius={80}
                               paddingAngle={2}
                               dataKey="value"
                               onClick={(data) => handleChartClick(chart, data.name)}
                               className="cursor-pointer focus:outline-none"
                             >
                               {distributionData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity" />
                               ))}
                             </Pie>
                             <Tooltip 
                               contentStyle={{ borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgb(0 0 0 / 0.05)', fontSize: '13px' }}
                             />
                             <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                           </RechartsPieChart>
                        )}
                      </ResponsiveContainer>
                   ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">暂无数据</div>
                   )}
                 </div>
              </div>
             );
          })}
          
          {charts.length === 0 && (
            <div className="col-span-2 flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50">
              <BarChart2 className="w-12 h-12 text-slate-300 mb-2" />
              <p className="text-slate-500 font-medium">看版为空</p>
              <Button size="sm" variant="outline" className="mt-4" onClick={addChart}>
                <Plus className="w-4 h-4 mr-1" />
                添加图表
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Editor Sidebar */}
      {editingChartId && editingChart && (
        <div className="w-80 bg-white border-l border-slate-200 flex flex-col shadow-[-4px_0_15px_rgba(0,0,0,0.05)] relative z-20">
          <div className="h-14 border-b border-slate-100 flex items-center justify-between px-5 bg-white">
            <h3 className="font-medium text-slate-800 flex items-center text-base">
              <Settings2 className="w-5 h-5 mr-2 text-blue-600" />
              调整图表配置
            </h3>
            <button onClick={() => setEditingChartId(null)} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-md transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-5 flex-1 overflow-y-auto">
            {/* 1. 图表名称 */}
            <div className="mb-4">
              <input 
                type="text" 
                value={editingChart.title}
                onChange={(e) => updateChart(editingChart.id, { title: e.target.value })}
                className="w-full text-lg font-bold text-slate-800 border-b-2 border-transparent hover:border-slate-200 focus:border-blue-500 py-1 focus:outline-none transition-colors placeholder:text-slate-300"
                placeholder="在此输入图表名称"
              />
            </div>

            {/* 数据系列配置 */}
            <div className="space-y-4 pt-1">
              {(() => {
                const seriesGroup = editingChart.series[0];
                if (!seriesGroup) return null;

                return (
                  <div className="relative group">
                    {/* 图表类型 */}
                    <div className="mb-4">
                      <label className="text-xs font-semibold text-slate-500 uppercase">图表类型</label>
                      <div className="flex border border-slate-200 rounded-lg overflow-hidden p-0.5 bg-white gap-0.5 mt-1 relative">
                        <button 
                          onClick={() => {
                            const newSeries = [{ ...seriesGroup, type: 'bar' as const }];
                            updateChart(editingChart.id, { series: newSeries });
                          }}
                          className={`flex-1 py-1.5 flex justify-center items-center rounded text-sm transition-colors z-10 ${seriesGroup.type === 'bar' || !seriesGroup.type ? 'bg-indigo-50 font-medium text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                          <BarChart2 className="w-4 h-4 mr-1.5" /> 柱图
                        </button>
                        <button 
                          onClick={() => {
                            const newSeries = [{ ...seriesGroup, type: 'line' as const }];
                            updateChart(editingChart.id, { series: newSeries });
                          }}
                          className={`flex-1 py-1.5 flex justify-center items-center rounded text-sm transition-colors z-10 ${seriesGroup.type === 'line' ? 'bg-indigo-50 font-medium text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                          <LineIcon className="w-4 h-4 mr-1.5" /> 趋势
                        </button>
                        <button 
                          onClick={() => {
                            const newSeries = [{ ...seriesGroup, type: 'pie' as const }];
                            updateChart(editingChart.id, { series: newSeries });
                          }}
                          className={`flex-1 py-1.5 flex justify-center items-center rounded text-sm transition-colors z-10 ${seriesGroup.type === 'pie' ? 'bg-indigo-50 font-medium text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                          <PieIcon className="w-4 h-4 mr-1.5" /> 占比
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 mb-3 border-l-2 border-indigo-200 pl-3">
                      <label className="text-xs font-semibold text-slate-500">X轴 (分类维度)</label>
                      <select 
                        value={seriesGroup.xField || ''}
                        onChange={(e) => {
                           const field = categoricalFields.find(f => f.key === e.target.value);
                           const newSeries = [{ ...seriesGroup, xField: e.target.value }];
                           
                           const updates: any = { series: newSeries };
                           if (field && editingChart.title === '新图表') {
                             updates.title = `${field.name}统计`;
                           }
                           updateChart(editingChart.id, updates);
                        }}
                        className="w-full text-sm border border-slate-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:border-indigo-400 font-medium text-slate-700"
                      >
                        {categoricalFields.map(f => (
                          <option key={f.key} value={f.key}>{f.name}</option>
                        ))}
                      </select>
                      
                      {categoricalFields.find(f => f.key === seriesGroup.xField)?.type === 'date' && (
                        <div className="flex border border-slate-200 rounded-md overflow-hidden p-0.5 bg-white gap-0.5 mt-1">
                          <button 
                            onClick={() => {
                              const newSeries = [{ ...seriesGroup, xDateGranularity: 'year' as const }];
                              updateChart(editingChart.id, { series: newSeries });
                            }}
                            className={`flex-1 py-1 flex justify-center items-center rounded-sm text-xs transition-colors ${seriesGroup.xDateGranularity === 'year' ? 'bg-indigo-50 font-medium text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                          >按年</button>
                          <button 
                            onClick={() => {
                              const newSeries = [{ ...seriesGroup, xDateGranularity: 'month' as const }];
                              updateChart(editingChart.id, { series: newSeries });
                            }}
                            className={`flex-1 py-1 flex justify-center items-center rounded-sm text-xs transition-colors ${seriesGroup.xDateGranularity === 'month' ? 'bg-indigo-50 font-medium text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                          >按月</button>
                          <button 
                            onClick={() => {
                              const newSeries = [{ ...seriesGroup, xDateGranularity: 'day' as const }];
                              updateChart(editingChart.id, { series: newSeries });
                            }}
                            className={`flex-1 py-1 flex justify-center items-center rounded-sm text-xs transition-colors ${seriesGroup.xDateGranularity === 'day' || !seriesGroup.xDateGranularity ? 'bg-indigo-50 font-medium text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                          >按日</button>
                        </div>
                      )}
                    </div>

                    {/* Y Data */}
                    {seriesGroup.type !== 'pie' && (
                      <div className="space-y-2 border-l-2 border-emerald-300 pl-3">
                        <label className="text-xs font-semibold text-slate-500">Y轴 (数值指标)</label>
                        <select
                          value={seriesGroup.yType === 'count' ? (seriesGroup.yField ? `countBy_${seriesGroup.yField}` : 'count') : seriesGroup.yType}
                          onChange={e => {
                            const val = e.target.value;
                            let newSeriesItem = { ...seriesGroup };
                            if (val === 'count') {
                              newSeriesItem = { ...newSeriesItem, yType: 'count', yField: undefined };
                            } else if (val.startsWith('countBy_')) {
                              newSeriesItem = { ...newSeriesItem, yType: 'count', yField: val.replace('countBy_', '') };
                            } else {
                              newSeriesItem = { ...newSeriesItem, yType: val as any };
                            }
                            updateChart(editingChart.id, { series: [newSeriesItem] });
                          }}
                          className="w-full text-sm border border-slate-200 rounded-md px-2 py-1.5 bg-white focus:outline-none mb-2 text-slate-700"
                        >
                          <option value="count">记录数 (汇总计数)</option>
                          {categoricalFields.map(f => (
                             <option key={f.key} value={`countBy_${f.key}`}>记录数 (按 {f.name} 分类统计)</option>
                          ))}
                        </select>
                        
                        {seriesGroup.yType !== 'count' && numericFields.length > 0 && (
                          <select
                            value={seriesGroup.yField || ''}
                            onChange={e => {
                              updateChart(editingChart.id, { series: [{ ...seriesGroup, yField: e.target.value }] });
                            }}
                            className="w-full text-sm border border-emerald-200 rounded-md px-2 py-1.5 bg-emerald-50 focus:outline-none text-emerald-800"
                          >
                             {numericFields.map(f => <option key={f.key} value={f.key}>{f.name}</option>)}
                          </select>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

          </div>
        </div>
      )}

      {/* Detail Drill-down Modal */}
      {detailView && (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[85vh] flex flex-col transform transition-all">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50 rounded-t-xl">
              <div>
                <h2 className="text-xl font-semibold text-slate-800 flex items-center">
                  {detailView.fieldName}: <span className="text-blue-600 ml-2">{detailView.category}</span>
                </h2>
                <p className="text-sm text-slate-500 mt-1">共找到 {detailView.records.length} 条相关记录</p>
              </div>
              <button 
                onClick={() => setDetailView(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors bg-white shadow-sm border border-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-0">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-[#f8fafc] sticky top-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)] text-slate-600">
                  <tr>
                    <th className="px-5 py-3 font-medium border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 w-16">序号</th>
                    {config.fields.slice(0, 6).map(f => (
                      <th key={f.key} className="px-5 py-3 font-medium border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                        {f.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {detailView.records.map((record, idx) => (
                    <tr key={record.id || idx} className="hover:bg-blue-50/50 transition-colors group">
                      <td className="px-5 py-3 text-slate-400">{idx + 1}</td>
                      {config.fields.slice(0, 6).map(f => (
                        <td key={f.key} className="px-5 py-3 text-slate-700 whitespace-nowrap">
                           {record[f.key] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {detailView.records.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                        该分类下无对应数据记录
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
