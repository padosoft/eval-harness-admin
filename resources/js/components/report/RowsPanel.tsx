import { useMemo, useState } from 'react';
import { useI18n } from '@/hooks/useI18n';
import EmptyState from '@/components/ui/EmptyState';
import { formatPercent } from '@/utils/format';
import type { SampleAggregateRow, SampleExecution } from '@/types/models';
import { failingAggregates, shortHash, worstExecutionOf } from '@/utils/reportBlocks';

interface Props {
  aggregates: SampleAggregateRow[];
  samples: SampleExecution[];
}

/**
 * Per-row detail: the pass rate, its confidence interval, and how the answer
 * was produced.
 *
 * A run-level macro-F1 says whether to worry. This says *which row* to open,
 * which is the only number that leads to a fix — and it defaults to failing
 * rows worst-first for the same reason the CLI briefing does.
 */
const RowsPanel = ({ aggregates, samples }: Props) => {
  const { t } = useI18n();
  const [failingOnly, setFailingOnly] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const rows = useMemo(
    () => (failingOnly ? failingAggregates(aggregates) : aggregates),
    [aggregates, failingOnly],
  );

  if (aggregates.length === 0) {
    return <EmptyState title={t('empty_no_rows')}>{t('text_rows_help')}</EmptyState>;
  }

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={failingOnly} onChange={(event) => setFailingOnly(event.target.checked)} />
        {t('label_failing_only')}
      </label>

      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">{t('text_all_rows_passed')}</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => {
            const execution = worstExecutionOf(samples, row.id);
            const interval = row.pass_rate_ci;
            const isOpen = expanded === row.id;

            return (
              <li key={row.id} className="rounded-ui border">
                <button
                  type="button"
                  className="flex w-full flex-wrap items-baseline justify-between gap-2 px-3 py-2 text-left text-sm"
                  onClick={() => setExpanded(isOpen ? null : row.id)}
                  aria-expanded={isOpen}
                >
                  <span className="font-medium">{row.id}</span>
                  <span className="text-slate-600">
                    {formatPercent(row.pass_rate ?? 0)}
                    {interval && typeof interval.low === 'number' && typeof interval.high === 'number'
                      ? ` (${formatPercent(interval.low)}–${formatPercent(interval.high)})`
                      : ''}
                    {row.unstable ? ` · ${t('label_unstable')}` : ''}
                  </span>
                </button>

                {isOpen ? (
                  <div className="space-y-2 border-t px-3 py-2 text-sm">
                    <p className="text-xs text-slate-500">
                      {/* The join key the regression gate uses, so a reader can
                          match this row to the same row in another run. */}
                      {t('label_row_hash')}: <code>{shortHash(row.row_hash)}</code> · {t('label_repetitions')}:{' '}
                      {row.repetitions ?? 1} · {t('label_errored')}: {row.errored ?? 0}
                    </p>

                    {execution?.actual_output ? (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {t('label_actual_output')}
                        </p>
                        <pre className="mt-1 max-h-40 overflow-auto rounded-ui border bg-slate-50 p-2 text-xs">
                          {execution.actual_output}
                        </pre>
                      </div>
                    ) : null}

                    {execution?.trajectory ? (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {t('label_trajectory')}
                        </p>
                        <p className="mt-1 text-xs text-slate-600">
                          {(execution.trajectory.tool_calls ?? []).length === 0
                            ? t('text_no_tools_called')
                            : (execution.trajectory.tool_calls ?? []).map((call) => call.name).join(' → ')}
                          {typeof execution.trajectory.steps === 'number'
                            ? ` · ${t('label_steps')}: ${execution.trajectory.steps}`
                            : ''}
                        </p>
                        {(execution.trajectory.pending_approvals ?? 0) > 0 ? (
                          <p className="mt-1 text-xs font-semibold text-amber-600">
                            {t('text_pending_approvals').replace(':n', String(execution.trajectory.pending_approvals))}
                          </p>
                        ) : null}
                      </div>
                    ) : null}

                    {execution?.scores ? (
                      <ul className="space-y-1 text-xs">
                        {Object.entries(execution.scores).map(([metric, entry]) => (
                          <li key={metric}>
                            <span className="font-medium">{metric}</span>: {entry?.score ?? '—'}
                            {typeof entry?.details?.judge_reason === 'string' ? (
                              <span className="text-slate-600"> — {String(entry.details.judge_reason)}</span>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default RowsPanel;
