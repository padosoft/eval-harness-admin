const StatusTag = ({ status, label }: { status: 'improved' | 'regressed' | 'stable' | string; label?: string }) => {
  const text = label ?? status;

  if (status === 'improved') {
    return <span className="status-ok rounded-ui px-2 py-1 text-xs font-semibold">{text}</span>;
  }

  if (status === 'regressed') {
    return <span className="status-danger rounded-ui px-2 py-1 text-xs font-semibold">{text}</span>;
  }

  return <span className="status-warn rounded-ui px-2 py-1 text-xs font-semibold">{text}</span>;
};

export default StatusTag;
