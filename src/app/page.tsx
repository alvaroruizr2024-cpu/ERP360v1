import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <main className="flex flex-col items-center gap-8 px-4 text-center">
        <h1 className="text-5xl font-bold tracking-tight">
          ERP<span className="text-blue-400">360</span>
        </h1>
        <p className="text-lg text-slate-300 max-w-md">
          Sistema de Gestion Empresarial - INNOVAQ Solutions
        </p>

        <div className="flex gap-4 mt-4">
          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold hover:bg-blue-500 transition-colors"
          >
            Iniciar Sesion
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-600 px-6 py-3 text-sm font-semibold hover:bg-slate-700 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </main>

      <footer className="absolute bottom-6 text-sm text-slate-500">
        INNOVAQ Solutions &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
