import { useI18n } from '@/hooks/useI18n';
import EmptyState from '@/components/ui/EmptyState';
import { formatPercent } from '@/utils/format';
import type { ReportPrecision, SampleAggregateRow } from '@/types/models';
import { unstableAggregates } from '@/utils/reportBlocks';

interface Props {
  precision: ReportPrecision | null;
  aggregates: SampleAggregateRow[];
}

/**
 * The number no other eval dashboard prints: the smallest difference this run
 * could actually have detected.
 *
 * Every other panel here reports what happened. This one reports what the run
 * was *capable* of noticing — which is the difference between "the score moved
 * two points" and "the score moved two points and we can prove it".
 */
const PrecisionPanel = ({ precision, aggregates }: Props) => {
  const { t } = useI18n();

  if (!precision) {
    // Deliberately not a zero: a report from before repeated sampling did not
    // measure a resolution of 0, it measured nothing.
    return <EmptyState title={t('empty_no_precision')}>{t('text_precision_help')}</EmptyState>;
  }

  const unstable = unstableAggregates(aggregates);

  // The run-level block is a documented shape of the same payload, so a report
  // that records its statistics there must not read as "no statistics".
  const resolution = precision.resolution ?? precision.run?.resolution;
  const resolvable =
    typeof precision.target_resolvable === 'boolean'
      ? precision.target_resolvable
      : precision.run?.target_resolvable;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="panel rounded-ui">
          <p className="text-xs uppercase tracking-wide text-slate-500">{t('label_repetitions')}</p>
          <p className="text-2xl font-semibold">{precision.repetitions ?? 1}</p>
        </div>
        <div className="panel rounded-ui">
          <p className="text-xs uppercase tracking-wide text-slate-500">{t('label_resolution')}</p>
          <p className="text-2xl font-semibold">{typeof resolution === 'number' ? formatPercent(resolution) : '—'}</p>
          <p className="mt-1 text-xs text-slate-500">{t('text_resolution_help')}</p>
        </div>
        <div className="panel rounded-ui">
          <p className="text-xs uppercase tracking-wide text-slate-500">{t('label_target_delta')}</p>
          <p className="text-2xl font-semibold">
            {typeof precision.target_delta === 'number' ? formatPercent(precision.target_delta) : '—'}
          </p>
          {/* Three states, not two: claiming "not detectable" when the run
              simply did not record it is an assertion nobody made. */}
          {resolvable === undefined ? (
            <p className="mt-1 text-xs text-slate-500">{t('text_target_unknown')}</p>
          ) : (
            <p className={`mt-1 text-xs ${resolvable ? 'text-emerald-600' : 'text-amber-600'}`}>
              {resolvable
                ? t('text_target_resolvable')
                : t('text_target_not_resolvable').replace(':n', String(precision.required_repetitions ?? '—'))}
            </p>
          )}
        </div>
      </div>

      {precision.summary ? <p className="text-sm text-slate-600">{precision.summary}</p> : null}

      <section className="panel rounded-ui">
        <h3 className="mb-1 font-semibold">{t('section_unstable_rows')}</h3>
        <p className="mb-3 text-xs text-slate-500">{t('text_unstable_help')}</p>
        {unstable.length === 0 ? (
          <p className="text-sm text-slate-500">{t('text_no_unstable_rows')}</p>
        ) : (
          <ul className="space-y-2">
            {unstable.map((row) => (
              <li key={row.id} className="flex flex-wrap items-baseline justify-between gap-2 rounded-ui border px-3 py-2 text-sm">
                <span className="font-medium">{row.id}</span>
                <span className="text-slate-600">
                  {t('label_pass_rate')} {formatPercent(row.pass_rate ?? 0)} · {t('label_score')}{' '}
                  {typeof row.score_mean === 'number' ? row.score_mean.toFixed(4) : '—'}
                  {typeof row.score_stddev === 'number' ? ` ± ${row.score_stddev.toFixed(4)}` : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default PrecisionPanel;
