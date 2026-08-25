// ============================================================
//  components/admin/StockBadge.tsx — Stock Status Badge
// ============================================================

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface StockBadgeProps {
  stock: number;
}

export default function StockBadge({ stock }: StockBadgeProps) {
  if (stock <= 0) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1 w-fit bg-red-600 font-sans">
        <XCircle size={12} />
        Agotado (0)
      </Badge>
    );
  }

  if (stock <= 3) {
    return (
      <Badge variant="outline" className="flex items-center gap-1 w-fit text-amber-600 border-amber-600 bg-amber-50 dark:bg-amber-950/20 font-sans">
        <AlertCircle size={12} />
        Bajo ({stock})
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="flex items-center gap-1 w-fit text-emerald-600 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 font-sans">
      <CheckCircle2 size={12} />
      Suficiente ({stock})
    </Badge>
  );
}
