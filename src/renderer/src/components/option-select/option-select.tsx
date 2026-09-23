import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '#/components/ui/select';
import { cn } from '#/utils/common';

export type SelectOption = { value: string; label: string };

type OptionSelectProps = {
  value: string;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  onChange: (value: string) => void;
};

export function OptionSelect({
  value,
  options,
  placeholder,
  className,
  onChange
}: OptionSelectProps) {
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
