import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '#/components/ui/select';
import { cn } from '#/utils/common';

export type RollsOption = { value: string; label: string };

type RollsOptionSelectProps = {
  value: string;
  options: RollsOption[];
  placeholder?: string;
  className?: string;
  onChange: (value: string) => void;
};

export function RollsOptionSelect({
  value,
  options,
  placeholder,
  className,
  onChange
}: RollsOptionSelectProps) {
  const label = options.find((option) => option.value === value)?.label;
  return (
    <Select items={options} value={value} onValueChange={(next) => next && onChange(next)}>
      <SelectTrigger size="sm" className={cn('w-full', className)}>
        <SelectValue size="sm" placeholder={placeholder}>
          {label}
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="start">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} indicatorPosition="start">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
