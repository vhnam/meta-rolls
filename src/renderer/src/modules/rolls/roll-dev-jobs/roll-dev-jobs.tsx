import { IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';

import { Button } from '#/components/ui/button';
import { FILM_PROCESS_LABEL } from '#/constants/rolls';
import { type DevJob, type Roll } from '#/shared/rolls';
import { useRollsStore } from '#/stores/rolls.store';

type RollDevJobsProps = {
  roll: Roll;
  onAdd: () => void;
  onEdit: (job: DevJob) => void;
};

const formatPrice = (job: DevJob) =>
  job.price === null ? null : `${job.price.toLocaleString()} ${job.currency}`;

export function RollDevJobs({ roll, onAdd, onEdit }: RollDevJobsProps) {
  const deleteDevJob = useRollsStore((state) => state.deleteDevJob);
  const setRollStatus = useRollsStore((state) => state.setRollStatus);

  // A received date means the lab returned the roll; offer the matching status.
  const canMarkDeveloped =
    roll.status === 'developing' && roll.devJobs.some((job) => job.receivedAt);

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium">Development</h3>
        <Button size="xs" variant="outline" onClick={onAdd}>
          <IconPlus /> Add dev job
        </Button>
      </div>

      {canMarkDeveloped && (
        <div className="flex items-center justify-between gap-2 border border-border bg-muted px-2 py-1.5 text-xs">
          <span>The lab returned this roll.</span>
          <Button size="xs" onClick={() => void setRollStatus(roll.id, 'developed')}>
            Mark as developed
          </Button>
        </div>
      )}

      {roll.devJobs.length === 0 ? (
        <p className="text-xs text-muted-foreground">No dev jobs yet.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border border border-border">
          {roll.devJobs.map((job) => (
            <li
              key={job.id}
              className="flex items-center justify-between gap-2 px-2 py-1.5 text-xs"
            >
              <div className="min-w-0">
                <div className="truncate font-medium">{job.lab || 'Unnamed lab'}</div>
                <div className="truncate text-muted-foreground">
                  {[
                    FILM_PROCESS_LABEL[job.process],
                    job.sentAt && `sent ${job.sentAt}`,
                    job.receivedAt && `received ${job.receivedAt}`,
                    formatPrice(job)
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </div>
              </div>
              <div className="flex shrink-0 items-center">
                <Button
                  size="icon-xs"
                  variant="ghost"
                  aria-label="Edit dev job"
                  onClick={() => onEdit(job)}
                >
                  <IconPencil />
                </Button>
                <Button
                  size="icon-xs"
                  variant="ghost"
                  aria-label="Delete dev job"
                  onClick={() => void deleteDevJob(job.id)}
                >
                  <IconTrash />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
