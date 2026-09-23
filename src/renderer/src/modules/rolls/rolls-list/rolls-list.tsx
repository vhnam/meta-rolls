import { IconPlus, IconMovie } from '@tabler/icons-react';
import { useMemo } from 'react';

import { Button } from '#/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyMedia } from '#/components/ui/empty';
import { Input } from '#/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip';
import {
  ALL_FILTER,
  ROLL_SORT,
  ROLL_SORT_LABEL,
  ROLL_STATUS_LABEL,
  type RollSort
} from '#/constants/rolls';
import { ROLL_STATUSES } from '#/shared/rolls';
import { useRollsStore } from '#/stores/rolls.store';
import { cn } from '#/utils/common';

import { RollsOptionSelect } from '../rolls-option-select';
import {
  cameraLabel,
  filterRolls,
  groupByStatus,
  relevantDate,
  stockLabel
} from './rolls-list-model';

type RollsListProps = {
  onAddRoll: () => void;
};

export function RollsList({ onAddRoll }: RollsListProps) {
  const rolls = useRollsStore((state) => state.rolls);
  const stocks = useRollsStore((state) => state.stocks);
  const cameras = useRollsStore((state) => state.cameras);
  const selectedRollId = useRollsStore((state) => state.selectedRollId);
  const statusFilter = useRollsStore((state) => state.statusFilter);
  const stockFilter = useRollsStore((state) => state.stockFilter);
  const cameraFilter = useRollsStore((state) => state.cameraFilter);
  const search = useRollsStore((state) => state.search);
  const sort = useRollsStore((state) => state.sort);
  const selectRoll = useRollsStore((state) => state.selectRoll);
  const setStatusFilter = useRollsStore((state) => state.setStatusFilter);
  const setStockFilter = useRollsStore((state) => state.setStockFilter);
  const setCameraFilter = useRollsStore((state) => state.setCameraFilter);
  const setSearch = useRollsStore((state) => state.setSearch);
  const setSort = useRollsStore((state) => state.setSort);

  const groups = useMemo(
    () =>
      groupByStatus(
        filterRolls(rolls, stocks, cameras, {
          status: statusFilter,
          stock: stockFilter,
          camera: cameraFilter,
          search,
          sort
        })
      ),
    [rolls, stocks, cameras, statusFilter, stockFilter, cameraFilter, search, sort]
  );
  const stockById = useMemo(() => new Map(stocks.map((s) => [s.id, s])), [stocks]);
  const cameraById = useMemo(() => new Map(cameras.map((c) => [c.id, c])), [cameras]);

  return (
    <aside className="flex h-full min-h-0 min-w-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-7 shrink-0 items-center justify-between border-b border-border bg-sidebar-accent px-1">
        <div className="px-2 text-tiny font-medium">Rolls</div>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="ghost" size="icon-xs" aria-label="Add roll" onClick={onAddRoll} />
            }
          >
            <IconPlus />
          </TooltipTrigger>
          <TooltipContent>
            <p>Add roll</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="flex shrink-0 flex-col gap-1 border-b border-border p-1">
        <div>
          <Input
            value={search}
            placeholder="Search rolls"
            aria-label="Search rolls"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-1">
          <RollsOptionSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: ALL_FILTER, label: 'All statuses' },
              ...ROLL_STATUSES.map((s) => ({ value: s, label: ROLL_STATUS_LABEL[s] }))
            ]}
          />
          <RollsOptionSelect
            value={sort}
            onChange={(value) => setSort(value as RollSort)}
            options={Object.values(ROLL_SORT).map((s) => ({ value: s, label: ROLL_SORT_LABEL[s] }))}
          />
          <RollsOptionSelect
            value={stockFilter}
            onChange={setStockFilter}
            options={[
              { value: ALL_FILTER, label: 'All stocks' },
              ...stocks.map((s) => ({ value: s.id, label: stockLabel(s) }))
            ]}
          />
          <RollsOptionSelect
            value={cameraFilter}
            onChange={setCameraFilter}
            options={[
              { value: ALL_FILTER, label: 'All cameras' },
              ...cameras.map((c) => ({ value: c.id, label: cameraLabel(c) }))
            ]}
          />
        </div>
      </div>

      {groups.length > 0 ? (
        <div className="min-h-0 flex-1 scroll-fade overflow-auto">
          {groups.map((group) => (
            <section key={group.status}>
              <h3 className="sticky top-0 z-10 flex items-center justify-between bg-sidebar-accent px-2 text-tiny font-medium">
                <span>{ROLL_STATUS_LABEL[group.status]}</span>
                <span className="text-muted-foreground">{group.rolls.length}</span>
              </h3>
              {group.rolls.map((roll) => {
                const date = relevantDate(roll);
                return (
                  <button
                    key={roll.id}
                    type="button"
                    onClick={() => selectRoll(roll.id)}
                    className={cn(
                      'flex w-full flex-col gap-0.5 px-2 py-1.5 text-left text-xs hover:bg-sidebar-accent',
                      selectedRollId === roll.id && 'bg-sidebar-accent'
                    )}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium">{roll.name}</span>
                      {date && <span className="shrink-0 text-muted-foreground">{date}</span>}
                    </span>
                    <span className="truncate text-muted-foreground">
                      {stockLabel(stockById.get(roll.stockId))} · ISO {roll.shotIso}
                      {roll.cameraId && ` · ${cameraLabel(cameraById.get(roll.cameraId))}`}
                    </span>
                  </button>
                );
              })}
            </section>
          ))}
        </div>
      ) : (
        <Empty className="flex-1">
          <EmptyMedia variant="icon">
            <IconMovie />
          </EmptyMedia>
          <EmptyContent>
            <EmptyDescription>
              {rolls.length === 0 ? 'No rolls yet. Add your first roll' : 'No rolls match'}
            </EmptyDescription>
            {rolls.length === 0 && (
              <Button size="sm" onClick={onAddRoll}>
                Add roll
              </Button>
            )}
          </EmptyContent>
        </Empty>
      )}
    </aside>
  );
}
