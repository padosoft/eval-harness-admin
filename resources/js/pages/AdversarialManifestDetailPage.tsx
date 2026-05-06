import { Link, useParams } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { useApiResource } from '@/hooks/useApiResource';
import { useI18n } from '@/hooks/useI18n';
import ErrorPanel from '@/components/ui/ErrorPanel';
import EmptyState from '@/components/ui/EmptyState';
import type { AdversarialManifestDetail } from '@/types/api';

const AdversarialManifestDetailPage = () => {
  const { name } = useParams();
  const { createClient } = useAppContext();
  const client = createClient();
  const { t } = useI18n();
  const data = useApiResource<AdversarialManifestDetail>(() => client.getAdversarialManifestDetail(name ?? ''), [name], {
    cacheKey: name ? `adversarial:manifest:${name}` : undefined,
    ttlMs: 60_000,
  });

  if (!name) {
    return <EmptyState title={t('heading_adversarial')}>{t('empty_no_manifest')}</EmptyState>;
  }

  if (data.status === 'error' && data.error) {
    return <ErrorPanel error={data.error} />;
  }

  if (data.status === 'idle' || data.status === 'loading') {
    return <p>{t('text_loading')}</p>;
  }

  if (!data.data) {
    return <EmptyState title={t('empty_no_manifest')}>{t('text_error_hint')}</EmptyState>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="screen-title">
          {t('heading_adversarial_detail')} {data.data.name}
        </h2>
        <Link to="/adversarial" className="text-sm text-blue-600">
          {t('action_back')}
        </Link>
      </div>
      <section className="panel rounded-ui">
        <p className="text-sm text-slate-700">
          {t('label_rows')}: {data.data.runs}
        </p>
        <p className="text-sm text-slate-700">
          {t('label_status')}: {data.data.latest_status ?? t('text_not_available')}
        </p>
        <p className="text-sm text-slate-700">
          {t('label_compliance')}: {data.data.compliance ?? t('text_not_available')}
        </p>
        <p className="text-sm text-slate-700">
          {t('label_coverage')}: {data.data.coverage ?? t('text_not_available')}
        </p>
      </section>
      {data.data.cohorts ? (
        <section className="panel rounded-ui">
          <h3 className="mb-2 font-semibold">{t('heading_cohorts')}</h3>
          <ul className="space-y-2 text-sm">
            {data.data.cohorts.map((cohort) => (
              <li key={cohort.cohort} className="flex justify-between rounded-ui border p-2">
                <span>{cohort.cohort}</span>
                <span>{cohort.pass_rate}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <section className="panel rounded-ui">
        <h3 className="mb-2 font-semibold">{t('heading_top_failures')}</h3>
        <ul className="space-y-1 text-sm">
          {data.data.items.map((item) => (
            <li key={item.category} className="flex justify-between rounded-ui border p-2">
              <span>{item.category}</span>
              <span>{item.failures}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default AdversarialManifestDetailPage;
