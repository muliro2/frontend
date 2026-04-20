export function useExportServiceOrders() {
  const exportServiceOrder = (order: any) => {
    console.log("Preparando para exportar a ordem:", order);
    window.print(); 
  };

  return { exportServiceOrder };
}