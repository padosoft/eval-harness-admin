const EmptyState = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="panel rounded-ui border-dashed text-slate-600">
    <h3 className="screen-title">{title}</h3>
    <p className="screen-subtitle mt-1">{children}</p>
  </div>
);

export default EmptyState;
