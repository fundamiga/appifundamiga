'use client';
import Image from 'next/image';
import React, { useState } from 'react';
import { Plus, FileText, Shield, TrendingUp, Download, Trash2, ArrowRight, CheckCircle, FileSpreadsheet, History } from 'lucide-react';
import { FormularioRegistro } from '@/components/formRegis';
import { ListaRegistros } from '@/components/ListaRegistro';
import { InformeConPanelEdicion } from '@/components/InformeConPanelEdicion';
import { BotonAccesoAdmin } from '@/components/BotonAccesoAdmin';
import { ResumenDia } from '@/components/ResumenDia';
import { HistorialDias } from '@/components/HistorialDias';
import { LiquidacionPersonal } from '@/components/LiquidacionPersonal';
import { useRegistroDiario } from '@/hooks/useRegistroDiario';
import { useHistorial, EntradaHistorial } from '@/hooks/useHistorial';
import { useFirmas } from '@/hooks/UseFirmas';
import { RegistroDiario, ItemTabla, ItemFactura } from '@/types';
import DonacionesErrorBoundary from '@/components/DonacionesErrorBoundary';
import { exportarAExcel } from '@/utils/exportarExcel';

interface InformeData {
  id: string;
  registros: RegistroDiario[];
  itemsFacturas: ItemFactura[];
  fechaCreacion: Date;
}

export default function SistemaControlDonaciones() {
  const [mostrarInforme, setMostrarInforme] = useState(false);
  const [mostrarMultiplesInformes, setMostrarMultiplesInformes] = useState(false);
  const [informes, setInformes] = useState<InformeData[]>([]);
  const [informeActual, setInformeActual] = useState<InformeData | null>(null);
  const [toastExito, setToastExito] = useState<string | null>(null);
  const [informeHistorial, setInformeHistorial] = useState<{registros: RegistroDiario[], itemsFacturas: ItemFactura[]} | null>(null);

  const mostrarToast = (msg: string) => {
    setToastExito(msg);
    setTimeout(() => setToastExito(null), 3000);
  };
  
  const {
    registros,
    registroActual,
    itemsFacturas,
    handleInputChange,
    handleDonacionChange,
    handleFacturaChange,
    handleItemsFacturasChange,
    handleFirmaChange,
    agregarRegistro,
    eliminarRegistro,
    reiniciarFormulario
  } = useRegistroDiario();

  const { firmas } = useFirmas();
  const { historial, guardarEnHistorial, eliminarEntrada } = useHistorial();

  const handleAgregarRegistro = () => {
    const registroParaInforme: RegistroDiario = JSON.parse(JSON.stringify(registroActual));
    const itemsFacturasParaInforme = itemsFacturas.map(item => ({ ...item }));
    const exito = agregarRegistro();
    if (!exito) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    const nuevoInforme: InformeData = {
      id: Date.now().toString(),
      registros: [registroParaInforme],
      itemsFacturas: itemsFacturasParaInforme,
      fechaCreacion: new Date()
    };

    setInformes(prev => [...prev, nuevoInforme]);
    setInformeActual(nuevoInforme);
    mostrarToast(`✅ Registro "${registroParaInforme.ubicacion}" agregado correctamente`);
  };

  const handleGenerarInforme = () => {
    const tieneRegistroActual = !!registroActual.ubicacion && registroActual.donaciones.valor > 0;

    if (!tieneRegistroActual && informes.length === 0) {
      alert('Debes agregar al menos un registro');
      return;
    }

    if (tieneRegistroActual) {
      const registroParaInforme: RegistroDiario = JSON.parse(JSON.stringify(registroActual));
      const itemsFacturasParaInforme = itemsFacturas.map(item => ({ ...item }));
      const exito = agregarRegistro();
      if (!exito) {
        alert('Por favor completa todos los campos obligatorios');
        return;
      }

      const nuevoInforme: InformeData = {
        id: Date.now().toString(),
        registros: [registroParaInforme],
        itemsFacturas: itemsFacturasParaInforme,
        fechaCreacion: new Date()
      };

      setInformes(prev => [...prev, nuevoInforme]);
      setInformeActual(nuevoInforme);
      setMostrarInforme(true);
      return;
    }

    const ultimoInforme = informes[informes.length - 1];
    setInformeActual(ultimoInforme);
    setMostrarInforme(true);
  };

 const handleNuevoInforme = () => {
  if (registros.length > 0) {
    guardarEnHistorial(registros, itemsFacturas);
  }

  reiniciarFormulario();
  setMostrarInforme(false);
  setInformeActual(null);
  setInformes([]);
};

  const handleVerInforme = (informe: InformeData) => {
    setInformeActual(informe);
    setMostrarInforme(true);
  };

  const handleEliminarInforme = (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este informe? Esta acción no se puede deshacer.')) return;
    setInformes(informes.filter(inf => inf.id !== id));
    if (informeActual?.id === id) {
      setMostrarInforme(false);
      setInformeActual(null);
    }
  };

  const handleActualizarRegistrosInforme = (
    registrosActualizados: RegistroDiario[], 
    itemsActualizados: ItemTabla[],
    itemsFacturasActualizados: ItemFactura[]
  ) => {
    if (!informeActual) return;
    
    const informeActualizado = {
      ...informeActual,
      registros: registrosActualizados,
      itemsFacturas: itemsFacturasActualizados
    };
    
    setInformeActual(informeActualizado);
    setInformes(informes.map(inf => 
      inf.id === informeActual.id ? informeActualizado : inf
    ));
  };

  const handleDescargarExcel = async () => {
    if (registros.length === 0) {
      alert('No hay registros para exportar');
      return;
    }
    await exportarAExcel(registros, itemsFacturas);
    mostrarToast('📊 Archivo Excel descargado correctamente');
  };

  const handleVerInformeHistorial = (entrada: EntradaHistorial) => {
    setInformeHistorial({ registros: entrada.registros, itemsFacturas: entrada.itemsFacturas });
    setMostrarInforme(true);
  };

  const handleDescargarPDFMultiple = () => {
    if (informes.length === 0) {
      alert('No hay informes para descargar');
      return;
    }
    setMostrarMultiplesInformes(true);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  if (mostrarMultiplesInformes) {
    return (
      <div className="bg-white min-h-screen">
        {informes.map((informe, idx) => (
          <div key={informe.id} style={{ pageBreakAfter: idx < informes.length - 1 ? 'always' : 'avoid' }}>
            <InformeConPanelEdicion 
              registros={informe.registros}
              itemsFacturas={informe.itemsFacturas}
              firmasExternas={firmas}
              onNuevoInforme={() => {
                setMostrarMultiplesInformes(false);
                setMostrarInforme(false);
              }}
              onActualizarRegistros={(registrosActualizados, itemsActualizados, itemsFacturasActualizados) => {
                setInformes(informes.map(inf => 
                  inf.id === informe.id 
                    ? { ...inf, registros: registrosActualizados, itemsFacturas: itemsFacturasActualizados }
                    : inf
                ));
              }}
            />
          </div>
        ))}
        <button
          onClick={() => setMostrarMultiplesInformes(false)}
          className="fixed top-4 left-4 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-6 rounded-xl shadow-lg print:hidden font-bold transition-all active:scale-95"
        >
          Volver al Panel
        </button>
      </div>
    );
  }

  if (mostrarInforme && (informeActual || informeHistorial)) {
    const regsMostrar = informeHistorial ? informeHistorial.registros : informeActual!.registros;
    const factMostrar = informeHistorial ? informeHistorial.itemsFacturas : informeActual!.itemsFacturas;
    return (
      <DonacionesErrorBoundary
        key={mostrarInforme ? 'informe' : 'formulario'}
        onResetReal={() => {
          setMostrarInforme(false);
          setInformeActual(null);
          setInformeHistorial(null);
        }}
      >
        <>
          <InformeConPanelEdicion
            registros={regsMostrar}
            itemsFacturas={factMostrar}
            firmasExternas={firmas}
            onNuevoInforme={() => {
              setMostrarInforme(false);
              setInformeActual(null);
              setInformeHistorial(null);
              if (!informeHistorial) handleNuevoInforme();
            }}
            onActualizarRegistros={informeHistorial ? () => {} : handleActualizarRegistrosInforme}
          />
          <BotonAccesoAdmin />
        </>
      </DonacionesErrorBoundary>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Toast de éxito */}
      {toastExito && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl text-sm font-bold flex items-center gap-2 animate-fade-in">
          {toastExito}
        </div>
      )}
      {/* Luces Ambientales Suaves - Reemplazan el fondo radial oscuro */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-emerald-100/30 blur-[120px] rounded-full -z-10 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-100/20 blur-[100px] rounded-full -z-10 translate-x-1/4 -translate-y-1/4"></div>

      {/* Navbar Minimalista */}
      <nav className="bg-white/60 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 p-1 bg-white rounded-2xl shadow-sm border border-gray-100">
              <Image src="/LOGO.png" alt="Fundamiga Logo" fill className="object-contain p-1" priority />
            </div>
            <div>
              <span className="text-xl font-black text-slate-800 tracking-tight block leading-none">Fundamiga</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Control de Donaciones</p>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-emerald-100 shadow-sm">
            <CheckCircle size={14} className="text-emerald-600" />
            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-tighter">Sistema Operativo</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 relative">
        {/* Page Header */}
        <div className="mb-12 relative">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-1.5 w-10 bg-emerald-500 rounded-full shadow-sm shadow-emerald-100"></div>
              <div className="h-1.5 w-4 bg-yellow-400 rounded-full shadow-sm shadow-yellow-100"></div>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-tight">
              Control Diario de <span className="text-emerald-600">Donaciones</span>
            </h1>
          </div>
          <p className="text-slate-500 font-medium mt-4 text-lg max-w-2xl border-l-4 border-yellow-400 pl-6 leading-relaxed">
            Gestión administrativa y registro centralizado para el seguimiento de impacto social de la fundación.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Resumen del día en tiempo real */}
          <ResumenDia registros={registros} registroActual={registroActual} />

          {/* Contenedor Principal Formulario */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_8px_40px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-300">
            {/* Header del Formulario Interno */}
            <div className="group relative bg-white px-8 py-8 border-b border-gray-50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/20 via-transparent to-yellow-50/20"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="p-4 bg-white rounded-2xl border-2 border-emerald-500 text-emerald-600 shadow-lg shadow-emerald-50 group-hover:border-yellow-400 group-hover:text-yellow-600 transition-all duration-500 transform group-hover:rotate-6">
                      <Plus size={24} strokeWidth={3} />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white shadow-sm"></div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Nuevo Registro Diario</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-black px-2 py-0.5 bg-emerald-500 text-white rounded-md uppercase tracking-wider">Módulo de Ingreso</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Validación de Fondos</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Espacio del Formulario */}
            <div className="p-8">
              <FormularioRegistro
                registroActual={registroActual}
                itemsFacturas={itemsFacturas}
                onInputChange={handleInputChange}
                onDonacionChange={handleDonacionChange}
                onFacturaChange={handleFacturaChange}
                onItemsFacturasChange={handleItemsFacturasChange}
                onFirmaChange={handleFirmaChange}
              />

              {/* Botones de Acción */}
              <div className="flex flex-col sm:flex-row gap-5 mt-12">
                <button
                  onClick={handleAgregarRegistro}
                  className="flex-[1.5] group relative bg-emerald-600 hover:bg-emerald-700 text-white py-4 px-8 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-emerald-100 transition-all duration-300 active:scale-[0.98] overflow-hidden"
                >
                  <Plus size={22} strokeWidth={3} />
                  <span>Añadir Registro</span>
                </button>

                <button
                  onClick={handleGenerarInforme}
                  className="flex-1 group relative bg-yellow-400 hover:bg-yellow-500 text-yellow-950 py-4 px-8 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-yellow-50 transition-all duration-300 active:scale-[0.98] border-b-4 border-yellow-600"
                >
                  <FileText size={22} strokeWidth={3} />
                  <span>Generar Informe</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={handleDescargarExcel}
                  className="flex-1 group relative bg-white hover:bg-green-50 text-green-700 py-4 px-8 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-sm border border-green-200 transition-all duration-300 active:scale-[0.98]"
                >
                  <FileSpreadsheet size={22} strokeWidth={2.5} />
                  <span>Exportar Excel</span>
                </button>
              </div>
            </div>
          </div>

          {/* Historial de Informes */}
          {informes.length > 0 && (
            <div className="space-y-8 pb-10">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-100">
                    <TrendingUp size={24} className="text-yellow-900" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Historial del Día</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{informes.length} Informes listos</p>
                  </div>
                </div>
                <button
                  onClick={handleDescargarPDFMultiple}
                  className="bg-white hover:bg-emerald-50 text-emerald-700 py-3 px-6 rounded-2xl text-xs font-black transition-all flex items-center gap-3 border border-emerald-100 shadow-sm"
                >
                  <Download size={18} />
                  Descargar Todo (PDF)
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {informes.map((informe, index) => (
                  <div key={informe.id} className="group bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-emerald-100/30 transition-all duration-500">
                    <div className="flex items-start justify-between mb-6">
                      <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                        <FileText size={20} />
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-tighter">Informe #{index + 1}</span>
                        <p className="text-[11px] font-bold text-slate-400 uppercase mt-2">{new Date(informe.fechaCreacion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between items-end border-b border-slate-50 pb-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total</span>
                        <span className="text-2xl font-black text-slate-800">${informe.registros.reduce((sum, reg) => sum + reg.donaciones.valor, 0).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button onClick={() => handleVerInforme(informe)} className="flex-1 bg-slate-900 text-white py-3 rounded-2xl text-xs font-black hover:bg-emerald-600 transition-all flex items-center justify-center gap-2">
                        Ver Detalles <ArrowRight size={14} />
                      </button>
                      <button onClick={() => handleEliminarInforme(informe.id)} className="p-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Liquidación de Personal */}
          <LiquidacionPersonal />

          {/* Historial de días anteriores */}
          <HistorialDias
            historial={historial}
            onVerInforme={handleVerInformeHistorial}
            onEliminar={(id) => {
              if (!confirm('¿Eliminar esta jornada del historial?')) return;
              eliminarEntrada(id);
            }}
          />
        </div>
      </main>

      <BotonAccesoAdmin />
    </div>
  );
}
