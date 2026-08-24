import { render as baseRender, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';

import { AppContextProvider } from '@/context/AppContext';
import { parseBootstrapConfig } from '@/utils/bootstrap';

import CostPanel from '@/components/report/CostPanel';
import PrecisionPanel from '@/components/report/PrecisionPanel';
import RowsPanel from '@/components/report/RowsPanel';
import {
  failingAggregates,
  readBudget,
  readCost,
  readPrecision,
  readSampleAggregates,
  unstableAggregates,
  worstExecutionOf,
} from '@/utils/reportBlocks';
import type { SampleAggregateRow, SampleExecution } from '@/types/models';

/** Every panel reads its labels through useI18n, which needs the app context. */
const render = (ui: ReactElement) =>
  baseRender(
    <AppContextProvider apiBase="https://example.test/api" config={parseBootstrapConfig(null)}>
      {ui}
    </AppContextProvider>,
  );

const aggregates: SampleAggregateRow[] = [
  {
    id: 'refund-window',
    row_hash: '9f2c4a1b3e7d0000',
    repetitions: 3,
    passed: 0,
    errored: 0,
    pass_rate: 0,
    pass_rate_ci: { low: 0.0, high: 0.56, confidence: 0.95 },
    unstable: false,
    score_mean: 0.2,
    score_stddev: 0,
  },
  {
    id: 'flaky-row',
    repetitions: 3,
    passed: 2,
    errored: 0,
    pass_rate: 0.667,
    unstable: true,
    score_mean: 0.7,
    score_stddev: 0.45,
  },
  {
    id: 'clean-row',
    repetitions: 3,
    passed: 3,
    errored: 0,
    pass_rate: 1,
    unstable: false,
    score_mean: 1,
    score_stddev: 0,
  },
];

const samples: SampleExecution[] = [
  {
    id: 'refund-window',
    repetition: 0,
    actual_output: '14 days from purchase.',
    scores: { 'llm-as-judge': { score: 0.2, details: { judge_reason: 'wrong window' } } },
    trajectory: { tool_calls: [{ name: 'search' }], steps: 2, pending_approvals: 1 },
  },
  {
    id: 'refund-window',
    repetition: 1,
    actual_output: 'a better answer',
    scores: { 'llm-as-judge': { score: 0.9 } },
  },
];

describe('reportBlocks', () => {
  /**
   * An older report did not measure a resolution of 0 — it measured nothing,
   * and a zero is a number somebody could act on that nobody produced.
   */
  it('returns null for blocks a pre-1.6 report never carried', () => {
    expect(readPrecision({ dataset: 'rag' })).toBeNull();
    expect(readCost({ dataset: 'rag' })).toBeNull();
    expect(readBudget(undefined)).toBeNull();
    expect(readSampleAggregates(null)).toEqual([]);
  });

  it('orders failing rows worst first and leaves passing rows out', () => {
    const failing = failingAggregates(aggregates);

    expect(failing.map((row) => row.id)).toEqual(['refund-window', 'flaky-row']);
  });

  it('lists rows that disagree with themselves separately', () => {
    expect(unstableAggregates(aggregates).map((row) => row.id)).toEqual(['flaky-row']);
  });

  /**
   * Showing the best execution of a failing row would hide the failure.
   */
  it('picks the worst execution of a row', () => {
    expect(worstExecutionOf(samples, 'refund-window')?.repetition).toBe(0);
    expect(worstExecutionOf(samples, 'nothing-here')).toBeNull();
  });
});

describe('PrecisionPanel', () => {
  it('shows the difference the run could actually detect', () => {
    render(
      <PrecisionPanel
        precision={{ repetitions: 3, resolution: 0.047, target_delta: 0.05, target_resolvable: true }}
        aggregates={aggregates}
      />,
    );

    expect(screen.getByText('4.7%')).toBeInTheDocument();
    expect(screen.getByText(/can detect the difference/i)).toBeInTheDocument();
  });

  it('says how many repetitions the target would need when it is out of reach', () => {
    render(
      <PrecisionPanel
        precision={{ repetitions: 1, resolution: 0.3, target_delta: 0.05, target_resolvable: false, required_repetitions: 60 }}
        aggregates={aggregates}
      />,
    );

    expect(screen.getByText(/60 repetitions would be needed/i)).toBeInTheDocument();
  });

  it('lists the unstable rows', () => {
    render(<PrecisionPanel precision={{ repetitions: 3 }} aggregates={aggregates} />);

    expect(screen.getByText('flaky-row')).toBeInTheDocument();
    expect(screen.queryByText('clean-row')).not.toBeInTheDocument();
  });

  it('degrades to an explanation rather than to zeroes', () => {
    render(<PrecisionPanel precision={null} aggregates={[]} />);

    expect(screen.getByText(/recorded no sampling statistics/i)).toBeInTheDocument();
    expect(screen.queryByText('0.0%')).not.toBeInTheDocument();
  });
});

describe('RowsPanel', () => {
  it('defaults to failing rows, worst first', () => {
    render(<RowsPanel aggregates={aggregates} samples={samples} />);

    expect(screen.getByText('refund-window')).toBeInTheDocument();
    expect(screen.queryByText('clean-row')).not.toBeInTheDocument();
  });

  it('shows every row when the filter is cleared', async () => {
    render(<RowsPanel aggregates={aggregates} samples={samples} />);

    await userEvent.click(screen.getByRole('checkbox'));

    expect(screen.getByText('clean-row')).toBeInTheDocument();
  });

  it('opens a row to its worst execution, its trajectory and the judge reason', async () => {
    render(<RowsPanel aggregates={aggregates} samples={samples} />);

    await userEvent.click(screen.getByRole('button', { name: /refund-window/ }));

    expect(screen.getByText('14 days from purchase.')).toBeInTheDocument();
    expect(screen.getByText(/wrong window/)).toBeInTheDocument();
    // The join key the regression gate uses, so a reader can match this row
    // against the same row in another run.
    expect(screen.getByText('9f2c4a1b3e7d')).toBeInTheDocument();
  });

  /**
   * "I have submitted that" while an approval is pending reads as success and
   * is not.
   */
  it('calls out a run that stopped on an approval', async () => {
    render(<RowsPanel aggregates={aggregates} samples={samples} />);

    await userEvent.click(screen.getByRole('button', { name: /refund-window/ }));

    expect(screen.getByText(/did not finish, it stopped/i)).toBeInTheDocument();
  });
});

describe('CostPanel', () => {
  it('shows the total split into billed and derived', () => {
    render(
      <CostPanel
        cost={{ total_usd: 0.4212, reported_usd: 0, derived_usd: 0.4212, complete: true, calls: 300, total_tokens: 1204880 }}
        budget={null}
      />,
    );

    expect(screen.getByText('$0.4212')).toBeInTheDocument();
  });

  /**
   * A total that omits the calls it cannot price is not a small bill, it is an
   * unknown one — and the small number is the one that gets quoted.
   */
  it('says in words when the total is a floor rather than a figure', () => {
    render(
      <CostPanel
        cost={{ total_usd: 0.15, complete: false, unpriced_calls: 3, unpriced_models: ['llama-3.1-70b'], calls: 10 }}
        budget={null}
      />,
    );

    expect(screen.getByText(/a floor, not a figure/i)).toBeInTheDocument();
    expect(screen.getByText(/llama-3\.1-70b/)).toBeInTheDocument();
  });

  it('marks an unpriced model in the per-model table', () => {
    render(
      <CostPanel
        cost={{
          total_usd: 0.15,
          complete: false,
          models: [{ model: 'llama-3.1-70b', calls: 3, total_tokens: 500, priced: false }],
        }}
        budget={null}
      />,
    );

    expect(screen.getByText('unpriced')).toBeInTheDocument();
  });

  /**
   * The rows that never executed are disproportionately the ones that would
   * have failed, so a halt has to be the loudest thing on the panel.
   */
  it('raises an alert when the run was halted on its budget', () => {
    render(
      <CostPanel
        cost={null}
        budget={{ limit_usd: 2.5, spent_usd: 2.54, halted: true, completed_rows: 148, reason: 'Spent $2.5400 of a $2.5000 budget after 148 rows.' }}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(/Halted on budget/i);
    expect(screen.getByText(/covers a partial run/i)).toBeInTheDocument();
  });

  it('reports a budget that held without alarming anybody', () => {
    render(<CostPanel cost={null} budget={{ limit_usd: 2.5, spent_usd: 0.42, halted: false }} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText(/\$0\.4200 of \$2\.5000 spent/i)).toBeInTheDocument();
  });

  it('degrades to an explanation when a run recorded no cost', () => {
    render(<CostPanel cost={null} budget={null} />);

    expect(screen.getByText(/recorded no cost/i)).toBeInTheDocument();
  });
});
