import { OptionSelect } from '#/components/option-select';
import { Field, FieldLabel } from '#/components/ui/field';
import {
  COMMON_FILM_STOCKS,
  type CommonFilmStock,
  commonStockLabel
} from '#/shared/common-film-stocks';

type CommonStockSelectProps = {
  onPick: (stock: CommonFilmStock) => void;
};

/** Fills a new-stock form from the built-in list; always shows the placeholder so it can be reused. */
export function CommonStockSelect({ onPick }: CommonStockSelectProps) {
  return (
    <Field>
      <FieldLabel>Start from a common stock</FieldLabel>
      <OptionSelect
        value=""
        placeholder="Choose…"
        options={COMMON_FILM_STOCKS.map((item, index) => ({
          value: String(index),
          label: commonStockLabel(item)
        }))}
        onChange={(index) => {
          const picked = COMMON_FILM_STOCKS[Number(index)];
          if (picked) {
            onPick(picked);
          }
        }}
      />
    </Field>
  );
}
