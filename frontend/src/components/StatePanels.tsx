export function LoadingSpinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="state-panel">
      <div className="spinner" />
      <p>{label}</p>
    </div>
  );
}

export function EmptyState({ title = "Nothing here yet", message }: { title?: string; message?: string }) {
  return (
    <div className="state-panel">
      <div className="empty-icon">📭</div>
      <h4>{title}</h4>
      {message && <p>{message}</p>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="state-panel state-panel-error">
      <div className="empty-icon">⚠️</div>
      <h4>Something went wrong</h4>
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn-secondary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
