// Definindo a interface para garantir o "Type Safety" (como uma Classe no C#)
interface MachineProps {
  name: string;
  status: 'OPERATIONAL' | 'MAINTENANCE' | 'DOWN';
  lastService: string;
}

export default function MachineCard({ name, status, lastService }: MachineProps) {
  // Lógica simples para mudar a cor do círculo baseada no status
  const statusColor = {
    OPERATIONAL: 'bg-green-500',
    MAINTENANCE: 'bg-yellow-500',
    DOWN: 'bg-red-500',
  }[status];

  return (
    <div className="p-6 bg-white rounded-xl shadow-md border border-slate-200 flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">{name}</h3>
        <span className={`h-3 w-3 rounded-full ${statusColor}`} title={status}></span>
      </div>
      
      <p className="text-sm text-slate-500">
        Última manutenção: <span className="font-medium">{lastService}</span>
      </p>

      <button className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-semibold">
        Ver Detalhes
      </button>
    </div>
  );
}