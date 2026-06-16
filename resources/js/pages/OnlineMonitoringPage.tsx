import { useMemo, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useApiResource } from '@/hooks/useApiResource';
import ErrorPanel from '@/components/ui/ErrorPanel';
import EmptyState from '@/components/ui/EmptyState';
import PassRateLineChart from '@/components/charts/PassRateLineChart';
import { formatPercent } from '@/utils/format';
import type { OnlineTrendPayload, ReportListPayload } from '@/types/api';
import { useI18n } from '@/hooks/useI18n';

const OnlineMonitoringPage = () => {
  const { createClient } = useAppContext();
  const client = createClient();
  const { t } = useI18n();

  const reports = useApiResource<ReportListPayload>(() => client.getReports(), [], {
    cacheKey: 'online:reports',
    ttlMs: 30_000,
  });

  const [dataset, setDataset] = useState('');

  const trend = useApiResource<OnlineTrendPayload>(() => {
    if (!dataset) {
      return Promise.resolve({ data: undefined as unknown as OnlineTrendPayload });
    }

    return client.getOnlineTrend(dataset, 90);
  }, [dataset], {
    cacheKey: dataset ? `online:${dataset}` : 'online:empty',
    ttlMs: 60_000,
  });

  const datasetOptions = useMemo(() => {
    if (reports.status !== 'ready' || !reports.data) {
      return [] as string[];
    }

    return [...new Set(reports.data.items.map((row) => row.dataset))];
  }, [reports.status, reports.data]);

  const payload = trend.status === 'ready' ? trend.data : undefined;
  const points = payload?.points ?? [];
  const threshold = payload?.threshold ?? 0;
  const latest = points.length > 0 ? points[points.length - 1] : undefined;
  const driftActive = latest !== undefined && latest.pass_rate < threshold;

  return (
    <div className="space-y-4">
      <h2 className="screen-title">{t('heading_online_monitoring')}</h2>

      {trend.status === 'error' && trend.error ? <ErrorPanel error={trend.error} /> : null}

      <section className="panel rounded-ui">
        <div className="flex flex-wrap gap-3">
          <label className="text-sm">
            {t('label_dataset')}
            <select
              className="mt-1 rounded-ui border border-slate-200 px-2 py-2"
              value={dataset}
              onChange={(event) => setDataset(event.target.value)}
              aria-label={t('label_dataset')}
            >
              <option value="">{t('text_select_dataset')}</option>
              {datasetOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {driftActive ? (
        <div role="alert" className="rounded-ui border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {t('text_drift_alert')} ({formatPercent(latest!.pass_rate)} &lt; {formatPercent(threshold)})
        </div>
      ) : null}

      {trend.status === 'ready' && points.length > 0 ? (
        <section className="panel rounded-ui">
          <h3 className="mb-1 font-semibold">
            {t('heading_online_monitoring')}: {dataset}
          </h3>
          <p className="screen-subtitle mb-2">
            {t('label_threshold')}: {formatPercent(threshold)}
          </p>
          <PassRateLineChart
            points={points}
            threshold={threshold}
            ariaLabel={`${t('heading_online_monitoring')} pass rate — ${dataset}`}
          />
        </section>
      ) : (
        <EmptyState title={t('empty_no_online_trend')}>{t('text_error_hint')}</EmptyState>
      )}
    </div>
  );
};

export default OnlineMonitoringPage;
