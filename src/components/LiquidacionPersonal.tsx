'use client';
import React, { useState } from 'react';
import {
  Search, User, Calendar, Clock, MinusCircle,
  CheckCircle, Calculator, ChevronDown, ChevronUp,
  X, DollarSign, Shield, CreditCard
} from 'lucide-react';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Persona {
  cedula: string;
  nombre: string;
  valorTurno: number;       // valor base por día (del Excel)
  valorHoraAdicional: number; // calculado del Excel si existe
  formaPago: string;
}

interface FormLiquidacion {
  diasTurno: number;
  turnosAdicionales: number;
  horasAdicionales: number;
  tieneDescuentoSeguridad: boolean;
  valorDescuentoSeguridad: number;
  tieneDescuentoPrestamo: boolean;
  valorDescuentoPrestamo: number;
  observaciones: string;
}

interface Resultado {
  subtotalTurnos: number;
  subtotalTurnosAdicionales: number;
  subtotalHoras: number;
  totalBruto: number;
  descuentoSeguridad: number;
  descuentoPrestamo: number;
  totalDescuentos: number;
  neto: number;
}

// ── Base de personas del Excel (MARZO_2026 - 2DA QUINCENA) ───────────────────
// Extraída de la planilla real

const PERSONAS: Persona[] = [
  // ADMINISTRACION
  { cedula: '31483643',    nombre: 'Garzon Eloisa',                valorTurno: 43000,  valorHoraAdicional: 2125, formaPago: 'Transferencia' },
  { cedula: '1118295832',  nombre: 'Llanten Fernandez Mildred A.', valorTurno: 20000,  valorHoraAdicional: 2125, formaPago: 'AV Villas' },
  { cedula: '1118293542',  nombre: 'Cabrera Velez Katherine',       valorTurno: 23350,  valorHoraAdicional: 2919, formaPago: 'Bancolombia' },
  { cedula: '1193412592',  nombre: 'Zharith Nicol Polanco',         valorTurno: 20000,  valorHoraAdicional: 2500, formaPago: 'Nequi' },
  { cedula: '1007779358',  nombre: 'Arredondo Angie Melissa',       valorTurno: 30000,  valorHoraAdicional: 3750, formaPago: 'Transferencia' },
  // 5TA - 6TA
  { cedula: '1118306042',  nombre: 'Jhoan Granada',                 valorTurno: 17000,  valorHoraAdicional: 2125, formaPago: 'Transferencia' },
  { cedula: '16453190',    nombre: 'Eidier Pabon',                  valorTurno: 17000,  valorHoraAdicional: 2125, formaPago: 'Transferencia' },
  { cedula: '1114542641',  nombre: 'Alejandra Chacon',              valorTurno: 17000,  valorHoraAdicional: 2125, formaPago: 'Transferencia' },
  { cedula: '94253614',    nombre: 'Juan Alquiber Arcilla',         valorTurno: 17000,  valorHoraAdicional: 2125, formaPago: 'Transferencia' },
  { cedula: '1007779173',  nombre: 'Diana Arias',                   valorTurno: 17000,  valorHoraAdicional: 2125, formaPago: 'Transferencia' },
  // 6TA - 6TA
  { cedula: '16461820',    nombre: 'Guillermo Dominguez',           valorTurno: 17000,  valorHoraAdicional: 2125, formaPago: 'Transferencia' },
  { cedula: '1115094396',  nombre: 'Mariland Johana Agudelo',       valorTurno: 17000,  valorHoraAdicional: 2125, formaPago: 'Transferencia' },
  { cedula: '66998930',    nombre: 'Maria Eugenia Noriega',         valorTurno: 17000,  valorHoraAdicional: 2125, formaPago: 'Transferencia' },
  { cedula: '1118309123',  nombre: 'Yuri Anzola',                   valorTurno: 17000,  valorHoraAdicional: 2125, formaPago: 'Efectivo' },
  { cedula: '1115088040',  nombre: 'Marcos Henao',                  valorTurno: 23000,  valorHoraAdicional: 2875, formaPago: 'Transferencia' },
  { cedula: '88270810',    nombre: 'Noe Contreras',                 valorTurno: 40000,  valorHoraAdicional: 5000, formaPago: 'Transferencia' },
  // CARTON COLOMBIA
  { cedula: '52406220',    nombre: 'Claudia Ovalle',                valorTurno: 17000,  valorHoraAdicional: 2125, formaPago: 'Transferencia' },
  { cedula: '1111775892',  nombre: 'Jose Davinson Riascos',         valorTurno: 17000,  valorHoraAdicional: 2125, formaPago: 'Transferencia' },
  // GUACANDA
  { cedula: '16461107',    nombre: 'Galarza Carlos Andres',         valorTurno: 17000,  valorHoraAdicional: 2125, formaPago: 'Transferencia' },
  { cedula: '1006072723',  nombre: 'Esteban Alejandro Arias',       valorTurno: 23000,  valorHoraAdicional: 2875, formaPago: 'Transferencia' },
  { cedula: '1118305208',  nombre: 'Marilin Valdes',                valorTurno: 23350,  valorHoraAdicional: 2919, formaPago: 'Transferencia' },
  { cedula: '7510791',     nombre: 'Gildardo Emilio Moscoso',       valorTurno: 20000,  valorHoraAdicional: 2500, formaPago: 'Transferencia' },
  { cedula: '',            nombre: 'Miguel Angel Saavedra',         valorTurno: 17000,  valorHoraAdicional: 2125, formaPago: 'Transferencia' },
  { cedula: '1118288989',  nombre: 'Francisco Echavarria',          valorTurno: 20000,  valorHoraAdicional: 2500, formaPago: 'Transferencia' },
  // MAYORISTA (TERCERA)
  { cedula: '111472110',   nombre: 'Emilsen Mayorga',               valorTurno: 17000,  valorHoraAdicional: 2125, formaPago: 'Transferencia' },
  { cedula: '1093214577',  nombre: 'Claudia Alvares',               valorTurno: 17000,  valorHoraAdicional: 2125, formaPago: 'Transferencia' },
  { cedula: '1118302471',  nombre: 'Angela Ramirez',                valorTurno: 17000,  valorHoraAdicional: 2125, formaPago: 'Transferencia' },
  { cedula: '1118308900',  nombre: 'Mariana Ceron',                 valorTurno: 17000,  valorHoraAdicional: 2125, formaPago: 'Transferencia' },
  { cedula: '16454804',    nombre: 'Luis Carlos Suarez',            valorTurno: 17000,  valorHoraAdicional: 2125, formaPago: 'Transferencia' },
  { cedula: '',            nombre: 'Consuelo Perlaza',              valorTurno: 17000,  valorHoraAdicional: 2125, formaPago: 'Transferencia' },
  { cedula: '16445901',    nombre: 'Miguel Benites',                valorTurno: 17000,  valorHoraAdicional: 2125, formaPago: 'Transferencia' },
  { cedula: '16590651',    nombre: 'Parmenides Noreña',             valorTurno: 17000,  valorHoraAdicional: 2125, formaPago: 'Transferencia' },
  // ROZO
  { cedula: '1006287986',  nombre: 'Monica Loango',                 valorTurno: 23500,  valorHoraAdicional: 2938, formaPago: 'Transferencia' },
  { cedula: '66932221',    nombre: 'Loango Maria Yesenia',          valorTurno: 23500,  valorHoraAdicional: 2938, formaPago: 'Transferencia' },
  { cedula: '1098653743',  nombre: 'Jhon Perez',                    valorTurno: 23500,  valorHoraAdicional: 2938, formaPago: 'Nequi' },
  { cedula: '1113067117',  nombre: 'Erika Johana Iter',             valorTurno: 23500,  valorHoraAdicional: 2938, formaPago: 'Transferencia' },
  { cedula: '1112390304',  nombre: 'Jackeline Cazares',             valorTurno: 23500,  valorHoraAdicional: 2938, formaPago: 'Transferencia' },
  { cedula: '83250261',    nombre: 'Tamayo Ipus Jolman Agusto',     valorTurno: 23500,  valorHoraAdicional: 2938, formaPago: 'Transferencia' },
  { cedula: '16269074',    nombre: 'Aragon Cuartas Onney',          valorTurno: 23500,  valorHoraAdicional: 2938, formaPago: 'Transferencia' },
  // 2DA - 10
  { cedula: '6332003',     nombre: 'Jose Leonel Ospina',            valorTurno: 17000,  valorHoraAdicional: 2125, formaPago: 'Transferencia' },
  { cedula: '18590428',    nombre: 'Francisco Lopez',               valorTurno: 17000,  valorHoraAdicional: 2125, formaPago: 'Transferencia' },
  // MAYORISTA
  { cedula: '29939491',    nombre: 'Garzon Donella',                valorTurno: 23350,  valorHoraAdicional: 2919, formaPago: 'Transferencia' },
  { cedula: '16446859',    nombre: 'Marcos Alvares',                valorTurno: 17000,  valorHoraAdicional: 2125, formaPago: 'Transferencia' },
  // GUABINAS
  { cedula: '94379974',    nombre: 'Hiroshi Takata',                valorTurno: 17000,  valorHoraAdicional: 2125, formaPago: 'Transferencia' },
  { cedula: '10127217',    nombre: 'Jhon Jairo Castañeda',          valorTurno: 23000,  valorHoraAdicional: 2875, formaPago: 'Transferencia' },
  { cedula: '1114121378',  nombre: 'Isamar Gaurin',                 valorTurno: 17000,  valorHoraAdicional: 2125, formaPago: 'Transferencia' },
  { cedula: '16454486',    nombre: 'Antonio Murillo',               valorTurno: 17000,  valorHoraAdicional: 2125, formaPago: 'Transferencia' },
  { cedula: '1041328013',  nombre: 'Luz Mery Henao',                valorTurno: 17000,  valorHoraAdicional: 2125, formaPago: 'Transferencia' },
  // BOLIVAR
  { cedula: '94404511',    nombre: 'Ospina Fredy Antonio',          valorTurno: 17000,  valorHoraAdicional: 2125, formaPago: 'Transferencia' },
  { cedula: '1118302461',  nombre: 'Yulieth Ceron',                 valorTurno: 17000,  valorHoraAdicional: 2125, formaPago: 'Transferencia' },
  { cedula: '31488255',    nombre: 'Yamileth Miranda',              valorTurno: 17000,  valorHoraAdicional: 2125, formaPago: 'Transferencia' },
  { cedula: '1118290778',  nombre: 'Diana Lorena Riascos',          valorTurno: 17000,  valorHoraAdicional: 2125, formaPago: 'Transferencia' },
];

// Descuento de seguridad social fijo (del Excel: $76,200 o $4,000 según aplica)
const DESCUENTO_SEG_SOCIAL_FULL = 76200;
const DESCUENTO_PRESTAMOS_DEFAULT = 4000;

// ── Utilidades ────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  `$${Math.round(n).toLocaleString('es-CO')}`;

function calcular(p: Persona, f: FormLiquidacion): Resultado {
  const subtotalTurnos = f.diasTurno * p.valorTurno;
  const subtotalTurnosAdicionales = f.turnosAdicionales * p.valorTurno;
  const subtotalHoras = f.horasAdicionales * p.valorHoraAdicional;
  const totalBruto = subtotalTurnos + subtotalTurnosAdicionales + subtotalHoras;
  const descuentoSeguridad = f.tieneDescuentoSeguridad ? f.valorDescuentoSeguridad : 0;
  const descuentoPrestamo = f.tieneDescuentoPrestamo ? f.valorDescuentoPrestamo : 0;
  const totalDescuentos = descuentoSeguridad + descuentoPrestamo;
  const neto = Math.max(0, totalBruto - totalDescuentos);
  return { subtotalTurnos, subtotalTurnosAdicionales, subtotalHoras, totalBruto, descuentoSeguridad, descuentoPrestamo, totalDescuentos, neto };
}

const formVacio = (p?: Persona): FormLiquidacion => ({
  diasTurno: 0,
  turnosAdicionales: 0,
  horasAdicionales: 0,
  tieneDescuentoSeguridad: false,
  valorDescuentoSeguridad: p ? DESCUENTO_SEG_SOCIAL_FULL : DESCUENTO_SEG_SOCIAL_FULL,
  tieneDescuentoPrestamo: false,
  valorDescuentoPrestamo: DESCUENTO_PRESTAMOS_DEFAULT,
  observaciones: '',
});

// ── Campo numérico reutilizable ───────────────────────────────────────────────

const NumField: React.FC<{
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  min?: number;
  step?: number;
  hint?: string;
}> = ({ label, value, onChange, prefix = '', min = 0, step = 1, hint }) => (
  <div className="group">
    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 group-focus-within:text-emerald-600 transition-colors">
      {label}
    </label>
    {hint && <p className="text-[10px] text-slate-400 mb-1">{hint}</p>}
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none">
          {prefix}
        </span>
      )}
      <input
        type="number"
        min={min}
        step={step}
        value={value || ''}
        onChange={e => onChange(Number(e.target.value) || 0)}
        className={`w-full ${prefix ? 'pl-7' : 'pl-4'} pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-700 font-bold focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 outline-none transition-all`}
      />
    </div>
  </div>
);

// ── Componente Principal ──────────────────────────────────────────────────────

export const LiquidacionPersonal: React.FC = () => {
  const [busqueda, setBusqueda] = useState('');
  const [personaSeleccionada, setPersonaSeleccionada] = useState<Persona | null>(null);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [form, setForm] = useState<FormLiquidacion>(formVacio());
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [mostrarValorTurno, setMostrarValorTurno] = useState(false);

  const filtradas = PERSONAS.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.cedula.includes(busqueda)
  );

  const seleccionar = (p: Persona) => {
    setPersonaSeleccionada(p);
    setBusqueda(p.nombre);
    setMostrarDropdown(false);
    setResultado(null);
    setForm(formVacio(p));
  };

  const limpiar = () => {
    setPersonaSeleccionada(null);
    setBusqueda('');
    setResultado(null);
    setForm(formVacio());
    setMostrarValorTurno(false);
  };

  const set = (field: keyof FormLiquidacion, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleCalcular = () => {
    if (!personaSeleccionada) return;
    setResultado(calcular(personaSeleccionada, form));
  };

  const res = resultado;
  const valorTurnoEditable = personaSeleccionada ? (mostrarValorTurno ? personaSeleccionada.valorTurno : personaSeleccionada.valorTurno) : 0;

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_8px_40px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-300">

      {/* ── Header ── */}
      <div className="relative bg-white px-8 py-8 border-b border-gray-50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/20 via-transparent to-yellow-50/20" />
        <div className="relative flex items-center gap-5">
          <div className="relative">
            <div className="p-4 bg-white rounded-2xl border-2 border-emerald-500 text-emerald-600 shadow-lg shadow-emerald-50">
              <Calculator size={24} strokeWidth={3} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white shadow-sm" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Liquidación de Personal</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[9px] font-black px-2 py-0.5 bg-emerald-500 text-white rounded-md uppercase tracking-wider">
                Módulo de Nómina
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                2da Quincena · Marzo 2026
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-8 space-y-8">

        {/* ── 1. Buscar persona ── */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 rounded-l-2xl" />
          <h3 className="font-black text-base text-slate-800 mb-4 flex items-center gap-2">
            <User size={16} className="text-emerald-600" />
            Buscar Persona
          </h3>

          <div className="relative">
            <div className="flex items-center gap-3 pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus-within:bg-white focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-50 transition-all">
              <Search size={18} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Escribe nombre o cédula del trabajador…"
                value={busqueda}
                onChange={e => {
                  setBusqueda(e.target.value);
                  setMostrarDropdown(true);
                  if (personaSeleccionada?.nombre !== e.target.value) {
                    setPersonaSeleccionada(null);
                    setResultado(null);
                  }
                }}
                onFocus={() => setMostrarDropdown(true)}
                className="flex-1 bg-transparent outline-none text-slate-700 font-semibold text-sm placeholder:text-gray-400 placeholder:font-normal"
              />
              {busqueda && (
                <button onClick={limpiar} className="text-gray-400 hover:text-red-500 transition-colors">
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Dropdown */}
            {mostrarDropdown && busqueda && !personaSeleccionada && filtradas.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto">
                {filtradas.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => seleccionar(p)}
                    className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-emerald-50 text-left transition-colors border-b border-gray-50 last:border-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <User size={14} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{p.nombre}</p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        C.C. {p.cedula || '—'} · Turno: {fmt(p.valorTurno)}/día · {p.formaPago}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {mostrarDropdown && busqueda && !personaSeleccionada && filtradas.length === 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl p-4 text-center text-sm text-slate-400">
                No se encontraron resultados para <strong>"{busqueda}"</strong>
              </div>
            )}
          </div>

          {/* Persona seleccionada - tarjeta */}
          {personaSeleccionada && (
            <div className="mt-4 flex items-center gap-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                <User size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-slate-800">{personaSeleccionada.nombre}</p>
                <div className="flex flex-wrap gap-3 mt-1">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    C.C. {personaSeleccionada.cedula || 'N/A'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                    Valor turno/día: {fmt(personaSeleccionada.valorTurno)}
                  </span>
                  <span className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                    Hora adicional: {fmt(personaSeleccionada.valorHoraAdicional)}
                  </span>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                    {personaSeleccionada.formaPago}
                  </span>
                </div>
              </div>
              <button onClick={limpiar} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                <X size={18} />
              </button>
            </div>
          )}
        </div>

        {/* ── 2. Formulario (solo si hay persona seleccionada) ── */}
        {personaSeleccionada && (
          <>
            {/* Días y turnos */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-yellow-400 rounded-l-2xl" />
              <h3 className="font-black text-base text-slate-800 mb-5 flex items-center gap-2">
                <Calendar size={16} className="text-yellow-500" />
                Días y Turnos Trabajados
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <NumField
                  label="Días de turno trabajados"
                  value={form.diasTurno}
                  onChange={v => set('diasTurno', v)}
                  hint={`Máx. recomendado: 15 días | ${fmt(form.diasTurno * personaSeleccionada.valorTurno)}`}
                />
                <NumField
                  label="Turnos adicionales"
                  value={form.turnosAdicionales}
                  onChange={v => set('turnosAdicionales', v)}
                  hint={`Valor: ${fmt(form.turnosAdicionales * personaSeleccionada.valorTurno)}`}
                />
                <NumField
                  label="Horas laboradas adicionales"
                  value={form.horasAdicionales}
                  onChange={v => set('horasAdicionales', v)}
                  hint={`${fmt(personaSeleccionada.valorHoraAdicional)}/hora → ${fmt(form.horasAdicionales * personaSeleccionada.valorHoraAdicional)}`}
                />
              </div>
            </div>

            {/* Descuentos */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-400 rounded-l-2xl" />
              <h3 className="font-black text-base text-slate-800 mb-5 flex items-center gap-2">
                <MinusCircle size={16} className="text-red-400" />
                Descuentos
              </h3>

              <div className="space-y-5">
                {/* Seguridad Social */}
                <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => set('tieneDescuentoSeguridad', !form.tieneDescuentoSeguridad)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${form.tieneDescuentoSeguridad ? 'bg-emerald-500' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.tieneDescuentoSeguridad ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                    <div>
                      <p className="font-black text-sm text-slate-700 flex items-center gap-2">
                        <Shield size={14} className="text-blue-500" />
                        Descuento Seguridad Social
                      </p>
                      <p className="text-[10px] text-slate-400">Valor por defecto: {fmt(DESCUENTO_SEG_SOCIAL_FULL)}</p>
                    </div>
                  </label>
                  {form.tieneDescuentoSeguridad && (
                    <NumField
                      label="Valor descuento seguridad social"
                      value={form.valorDescuentoSeguridad}
                      onChange={v => set('valorDescuentoSeguridad', v)}
                      prefix="$"
                    />
                  )}
                </div>

                {/* Préstamos */}
                <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => set('tieneDescuentoPrestamo', !form.tieneDescuentoPrestamo)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${form.tieneDescuentoPrestamo ? 'bg-emerald-500' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.tieneDescuentoPrestamo ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                    <div>
                      <p className="font-black text-sm text-slate-700 flex items-center gap-2">
                        <CreditCard size={14} className="text-orange-500" />
                        Descuento por Préstamos y Aportes
                      </p>
                      <p className="text-[10px] text-slate-400">Valor por defecto: {fmt(DESCUENTO_PRESTAMOS_DEFAULT)}</p>
                    </div>
                  </label>
                  {form.tieneDescuentoPrestamo && (
                    <NumField
                      label="Valor descuento préstamos"
                      value={form.valorDescuentoPrestamo}
                      onChange={v => set('valorDescuentoPrestamo', v)}
                      prefix="$"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                Observaciones (opcional)
              </label>
              <textarea
                value={form.observaciones}
                onChange={e => set('observaciones', e.target.value)}
                placeholder="Notas adicionales sobre la liquidación…"
                rows={2}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-slate-700 font-medium text-sm focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 outline-none transition-all resize-none"
              />
            </div>

            {/* Botón calcular */}
            <button
              onClick={handleCalcular}
              className="w-full group relative bg-emerald-600 hover:bg-emerald-700 text-white py-4 px-8 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-emerald-100 transition-all duration-300 active:scale-[0.98]"
            >
              <Calculator size={22} strokeWidth={3} />
              Calcular Liquidación
            </button>
          </>
        )}

        {/* ── 3. Resultado ── */}
        {res && personaSeleccionada && (
          <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle size={20} className="text-emerald-400" />
              <h3 className="font-black text-lg">Liquidación: {personaSeleccionada.nombre}</h3>
            </div>

            {/* Desglose */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Turnos ({form.diasTurno} días × {fmt(personaSeleccionada.valorTurno)})</span>
                <span className="font-bold">{fmt(res.subtotalTurnos)}</span>
              </div>
              {res.subtotalTurnosAdicionales > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Turnos adicionales ({form.turnosAdicionales} × {fmt(personaSeleccionada.valorTurno)})</span>
                  <span className="font-bold">{fmt(res.subtotalTurnosAdicionales)}</span>
                </div>
              )}
              {res.subtotalHoras > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Horas adicionales ({form.horasAdicionales}h × {fmt(personaSeleccionada.valorHoraAdicional)})</span>
                  <span className="font-bold">{fmt(res.subtotalHoras)}</span>
                </div>
              )}
              <div className="border-t border-slate-700 pt-2 flex justify-between text-sm">
                <span className="text-slate-300 font-semibold">Total bruto</span>
                <span className="font-black text-white">{fmt(res.totalBruto)}</span>
              </div>
              {res.descuentoSeguridad > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-red-400">− Seguridad Social</span>
                  <span className="font-bold text-red-400">−{fmt(res.descuentoSeguridad)}</span>
                </div>
              )}
              {res.descuentoPrestamo > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-red-400">− Préstamos y Aportes</span>
                  <span className="font-bold text-red-400">−{fmt(res.descuentoPrestamo)}</span>
                </div>
              )}
            </div>

            {/* Neto */}
            <div className="bg-emerald-500 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest">Neto a Pagar</p>
                <p className="text-white text-3xl font-black mt-1">{fmt(res.neto)}</p>
              </div>
              <div className="text-right">
                <p className="text-emerald-200 text-xs font-bold uppercase tracking-widest">Forma de pago</p>
                <p className="text-white font-black mt-1">{personaSeleccionada.formaPago}</p>
              </div>
            </div>

            {form.observaciones && (
              <p className="text-slate-400 text-xs italic border-t border-slate-700 pt-3">
                Obs: {form.observaciones}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
