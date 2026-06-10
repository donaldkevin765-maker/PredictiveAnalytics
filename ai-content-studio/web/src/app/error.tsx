'use client'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-600/10 border border-red-500/10 mb-6">
        <span className="text-4xl font-bold text-red-400">!</span>
      </div>
      <h1 className="text-3xl font-bold text-white">Qualcosa &egrave; andato storto</h1>
      <p className="mt-2 text-gray-500 text-center max-w-md">
        {error.message || 'Si &egrave; verificato un errore imprevisto.'}
      </p>
      <button
        onClick={reset}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:from-brand-500 hover:to-brand-400 transition-all"
      >
        Riprova
      </button>
    </div>
  )
}
