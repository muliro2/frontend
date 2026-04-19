export function useExportServiceOrders() {
  // Adicione o parâmetro 'order' aqui na definição
  const exportServiceOrder = (order: any) => {
    console.log("Preparando para exportar a ordem:", order);
    // No futuro, aqui entrará a lógica de gerar o PDF/Print
    window.print(); 
  };

  return { exportServiceOrder };
}