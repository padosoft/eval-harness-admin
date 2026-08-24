import { useI18n } from '@/hooks/useI18n';
import EmptyState from '@/components/ui/EmptyState';
import { formatNumber } from '@/utils/format';
import type { ReportBudget, ReportCost } from '@/types/models';

interface Props {
  cost: ReportCost | null;
  budget: ReportBudget | null;
}

const usd = (value: number | undefined): string => (typeof value === 'number' ? `$${value.toFixed(4)}` : '—');

/**
 * What the run cost — and, more importantly, what part of it nobody can price.
 *
 * A cost panel that silently omits the calls it has no rate for shows a small
 * number where the truth is an unknown one. That number gets believed,
 * budgeted against, and quoted in a meeting, so the incomplete case says so in
 * words rather than in a footnote.
 */
const CostPanel = ({ cost, budget }: Props) => {
  const { t } = useI18n();

  if (!cost && !budget) {
    return <EmptyState title={t('empty_no_cost')}>{t('text_cost_help')}</EmptyState>;
  }

  const halted = budget?.halted === true;
  const incomplete = cost ? cost.complete === false : false;

  return (
    <div className="space-y-4">
      {halted ? (
        // First and loudest: every figure below describes a partial run, and
        // the rows that never executed are disproportionately the ones that
        // would have failed.
        <div role="alert" className="rounded-ui border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          <p className="font-semibold">{t('text_budget_halted')}</p>
          <p>{budget?.reason}</p>
          <p className="mt-1">{t('text_budget_halted_help')}</p>
        </div>
      ) : null}

      {cost ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="panel rounded-ui">
              <p className="text-xs uppercase tracking-wide text-slate-500">{t('label_total_cost')}</p>
              <p className="text-2xl font-semibold">{usd(cost.total_usd)}</p>
              <p className="mt-1 text-xs text-slate-500">
                {t('label_reported')} {usd(cost.reported_usd)} · {t('label_derived')} {usd(cost.derived_usd)}
              </p>
            </div>
            <div className="panel rounded-ui">
              <p className="text-xs uppercase tracking-wide text-slate-500">{t('label_provider_calls')}</p>
              <p className="text-2xl font-semibold">{formatNumber(cost.calls ?? 0)}</p>
            </div>
            <div className="panel rounded-ui">
              <p className="text-xs uppercase tracking-wide text-slate-500">{t('label_tokens')}</p>
              <p className="text-2xl font-semibold">{formatNumber(cost.total_tokens ?? 0)}</p>
            </div>
          </div>

          {incomplete ? (
            <div role="status" className="rounded-ui border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              <p className="font-semibold">{t('text_cost_incomplete')}</p>
              <p>
                {t('text_cost_incomplete_help')
                  .replace(':n', String(cost.unpriced_calls ?? 0))
                  .replace(':models', (cost.unpriced_models ?? []).join(', ') || '—')}
              </p>
            </div>
          ) : null}

          {(cost.models ?? []).length > 0 ? (
            <section className="panel rounded-ui overflow-x-auto">
              <h3 className="mb-2 font-semibold">{t('section_cost_by_model')}</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-1">{t('label_model')}</th>
                    <th className="py-1">{t('label_calls')}</th>
                    <th className="py-1">{t('label_tokens')}</th>
                    <th className="py-1">{t('label_cost')}</th>
                  </tr>
                </thead>
                <tbody>
                  {(cost.models ?? []).map((model) => (
                    <tr key={model.model} className="border-t border-slate-100">
                      <td className="py-1 font-medium">{model.model}</td>
                      <td className="py-1">{formatNumber(model.calls ?? 0)}</td>
                      <td className="py-1">{formatNumber(model.total_tokens ?? 0)}</td>
                      <td className="py-1">{model.priced === false ? t('label_unpriced') : usd(model.cost_usd)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ) : null}
        </>
      ) : null}

      {budget && typeof budget.limit_usd === 'number' && !halted ? (
        <p className="text-sm text-slate-600">
          {t('text_budget_within').replace(':spent', usd(budget.spent_usd)).replace(':limit', usd(budget.limit_usd))}
        </p>
      ) : null}
    </div>
  );
};

export default CostPanel;
