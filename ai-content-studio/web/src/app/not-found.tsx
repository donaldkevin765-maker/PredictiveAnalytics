import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/10 to-purple-600/10 border border-brand-500/10 mb-6">
        <span className="text-4xl font-bold text-brand-400">?</span>
      </div>
      <h1 className="text-3xl font-bold text-white">Pagina non trovata</h1>
      <p className="mt-2 text-gray-500 text-center max-w-md">
        La pagina che stai cercando non esiste o &egrave; stata spostata.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:from-brand-500 hover:to-brand-400 transition-all"
      >
        Torna alla Dashboard
      </Link>
    </div>
  )
}
