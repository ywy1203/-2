import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '../ui';

export function Header({ title, categoryName }: { title?: string, categoryName?: string }) {
  const [isExporting, setIsExporting] = React.useState(false);

  const handleDownloadHTML = async () => {
    try {
      setIsExporting(true);
      const response = await fetch('/api/export-html');
      if (!response.ok) throw new Error('Export failed: ' + response.statusText);
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title || 'project'}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert('导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <header className="h-12 flex items-center justify-between px-6 bg-white shrink-0">
      <div className="flex items-center text-sm">
        <span className="text-slate-500">{categoryName || '员工台账'}</span>
        <span className="mx-2 text-slate-300">/</span>
        <span className="text-slate-900 font-semibold">{title || '借调台账'}</span>
      </div>
      <div>
        <Button variant="outline" size="sm" onClick={handleDownloadHTML} disabled={isExporting} className="h-8 text-slate-500 hover:text-slate-700">
          <Download className="w-4 h-4 mr-1.5" /> {isExporting ? '正在打包导出...' : '导出项目(单HTML)'}
        </Button>
      </div>
    </header>
  );
}
