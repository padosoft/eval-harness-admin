import type { ApiErrorState } from '@/types/api';

const ErrorPanel = ({ error }: { error: ApiErrorState }) => (
  <div className="rounded-ui border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800">
    <p className="text-sm font-semibold uppercase tracking-wide text-rose-900">{error.kind}</p>
    <p className="mt-1 text-sm text-rose-800">{error.message}</p>
  </div>
);

export default ErrorPanel;
