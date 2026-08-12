export default function ErrorBox({ message }: { message: string }) {
  return (
    <div className="mt-2 rounded bg-red-950/60 border border-red-700/60 px-3 py-2 text-red-300 text-sm" role="alert">
      {message}
    </div>
  )
}