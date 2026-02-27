import Link from "next/link";
import {
  BarChart3,
  ShieldCheck,
  Zap,
  Package,
  TrendingUp,
  Calculator,
  Users,
  Contact,
  ShoppingCart,
  Tractor,
  CalendarDays,
  FlaskConical,
  Banknote,
  Route,
  UserCheck,
  Wrench,
  Activity,
} from "lucide-react";

const features = [
  { icon: Tractor, title: "Operaciones", desc: "Corte, alce y transporte de caña" },
  { icon: CalendarDays, title: "Zafra", desc: "Planificación de campañas de cosecha" },
  { icon: FlaskConical, title: "Laboratorio", desc: "Análisis Brix, Pol, Fibra y calidad" },
  { icon: Route, title: "Logística", desc: "Rutas, viajes y seguimiento GPS" },
  { icon: UserCheck, title: "Colonos", desc: "Portal de colonos y liquidaciones" },
  { icon: Banknote, title: "Nómina", desc: "Planilla, IGSS, ISR y pagos" },
  { icon: Wrench, title: "Mant. Industrial", desc: "Equipos, OT y repuestos" },
  { icon: Activity, title: "Business Intelligence", desc: "KPIs y análisis predictivo" },
  { icon: TrendingUp, title: "Ventas", desc: "Facturación y gestión de clientes" },
  { icon: ShoppingCart, title: "Compras", desc: "Órdenes de compra y proveedores" },
  { icon: Package, title: "Inventario", desc: "Control de stock en tiempo real" },
  { icon: Calculator, title: "Contabilidad", desc: "Plan de cuentas y libro diario" },
  { icon: Users, title: "RRHH", desc: "Empleados y departamentos" },
  { icon: Contact, title: "CRM", desc: "Pipeline de leads y seguimiento" },
  { icon: BarChart3, title: "Reportes", desc: "Gráficas y exportación PDF/Excel" },
  { icon: ShieldCheck, title: "Seguridad", desc: "Auth, CSRF, rate limiting y headers" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Navbar */}
      <nav className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold">
            ERP<span className="text-blue-400">360</span>
          </span>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-slate-300 hover:text-white transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/registro"
              className="text-sm bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors font-medium"
            >
              Crear Cuenta
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-600/20 rounded-full px-4 py-1.5 text-sm text-blue-400 mb-8">
            <Zap className="w-4 h-4" />
            Gestión Empresarial Inteligente
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
            Tu empresa en un
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              solo lugar
            </span>
          </h1>
          <p className="text-lg text-slate-400 mt-6 max-w-2xl mx-auto leading-relaxed">
            ERP360 integra ventas, compras, inventario, contabilidad, recursos humanos y CRM
            en una plataforma moderna y fácil de usar.
          </p>
          <div className="flex items-center justify-center gap-4 mt-10">
            <Link
              href="/dashboard"
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-blue-600/25"
            >
              Ir al Dashboard
            </Link>
            <Link
              href="/registro"
              className="border border-slate-600 hover:border-slate-500 text-white px-8 py-3.5 rounded-xl text-sm font-semibold transition-colors"
            >
              Crear Cuenta Gratis
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Módulos Integrados</h2>
          <p className="text-slate-400 text-center mb-12 max-w-lg mx-auto">
            Todo lo que necesitas para gestionar tu empresa de forma eficiente
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:border-blue-600/30 hover:bg-slate-800 transition-all group"
                >
                  <Icon className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-white mb-1">{feat.title}</h3>
                  <p className="text-sm text-slate-400">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-t border-slate-800">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-3xl font-bold text-blue-400">24+</p>
            <p className="text-sm text-slate-400 mt-1">Módulos</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-blue-400">44</p>
            <p className="text-sm text-slate-400 mt-1">Tablas de BD</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-blue-400">100%</p>
            <p className="text-sm text-slate-400 mt-1">TypeScript</p>
          </div>
        </div>
      </section>

      {/* Publication Banner */}
      <section className="py-12 px-6 border-t border-slate-800 bg-gradient-to-r from-blue-600/10 to-cyan-600/10">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-slate-400 uppercase tracking-wider mb-2">Publicado en</p>
          <a
            href="https://www.innnovaqsolution.com/ERP360/TranscañaERP"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-lg font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            www.innnovaqsolution.com/ERP360/TranscañaERP
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
          <p className="text-sm text-slate-500 mt-2">TranscañaERP &mdash; Gestión Empresarial por INNOVAQ Solutions</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <span>
            ERP<span className="text-blue-400/60">360</span> &copy; {new Date().getFullYear()}
          </span>
          <a
            href="https://www.innnovaqsolution.com/ERP360/TranscañaERP"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-400 transition-colors"
          >
            www.innnovaqsolution.com/ERP360/TranscañaERP
          </a>
          <span>INNOVAQ Solutions</span>
        </div>
      </footer>
    </div>
  );
}
