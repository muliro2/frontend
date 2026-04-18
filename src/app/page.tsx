import MachineCard from '@/components/MachineCard';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <h1 className="text-3xl font-bold mb-8 text-slate-900">Painel de Máquinas</h1>
      
      {/* Grid para exibir os cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MachineCard 
          name="Chapa de Espetinhos A1" 
          status="OPERATIONAL" 
          lastService="12/04/2026" 
        />
        <MachineCard 
          name="Exaustor Industrial" 
          status="MAINTENANCE" 
          lastService="15/04/2026" 
        />
      </div>
    </main>
  );
}