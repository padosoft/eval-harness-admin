import type { ReactNode } from 'react';

const StatCard = ({ label, value, helper }: { label: string; value: ReactNode; helper?: ReactNode }) => (
  <article className="panel rounded-ui">
    <p className="screen-subtitle">{label}</p>
    <p className="mt-2 text-2xl font-semibold">{value}</p>
    {helper ? <p className="screen-subtitle mt-1">{helper}</p> : null}
  </article>
);

export default StatCard;
