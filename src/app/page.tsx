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
} from "lucide-react";

const features = [
  { icon: TrendingUp, title: "Ventas", desc: "Facturación y gestión de clientes" },
  { icon: ShoppingCart, title: "Compras", desc: "Órdenes de compra y proveedores" },
  { icon: Package, title: "Inventario", desc: "Control de stock en tiempo real" },
  { icon: Calculator, title: "Contabilidad", desc: "Plan de cuentas y libro diario" },
  { icon: Users, title: "RRHH", desc: "Empleados y departamentos" },
  { icon: Contact, title: "CRM", desc: "Pipeline de leads y seguimiento" },
  { icon: BarChart3, title: "Reportes", desc: "Gráficas y exportación PDF/Excel" },
  { icon: ShieldCheck, title: "Seguridad", desc: "Autenticación y roles de usuario" },
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
            <p className="text-3xl font-bold text-blue-400">7+</p>
            <p className="text-sm text-slate-400 mt-1">Módulos</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-blue-400">13</p>
            <p className="text-sm text-slate-400 mt-1">Tablas de BD</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-blue-400">100%</p>
            <p className="text-sm text-slate-400 mt-1">TypeScript</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-slate-500">
          <span>
            ERP<span className="text-blue-400/60">360</span> &copy; {new Date().getFullYear()}
          </span>
          <span>INNOVAQ Solutions</span>
        </div>
      </footer>
    </div>
  );
}
