import { useEffect, useState } from 'react';

import { CommonStockSelect } from '#/components/common-stock-select';
import { OptionSelect } from '#/components/option-select';
import { Button } from '#/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '#/components/ui/dialog';
import { Field, FieldGroup, FieldLabel } from '#/components/ui/field';
import { Input } from '#/components/ui/input';
import { FILM_FORMAT_LABEL } from '#/constants/rolls';
import { type CommonFilmStock } from '#/shared/common-film-stocks';
import { FILM_FORMATS, type FilmFormat, type FilmStock } from '#/shared/rolls';
import { useRollsStore } from '#/stores/rolls.store';

const NEW_STOCK = 'new';

type RollFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RollFormDialog({ open, onOpenChange }: RollFormDialogProps) {
  const stocks = useRollsStore((state) => state.stocks);
  const cameras = useRollsStore((state) => state.cameras);
  const createRolls = useRollsStore((state) => state.createRolls);
  const createStock = useRollsStore((state) => state.createStock);

  const activeStocks = stocks.filter((stock) => !stock.archived);
  const [stockId, setStockId] = useState(NEW_STOCK);
  const [cameraId, setCameraId] = useState('none');
  const [quantity, setQuantity] = useState('1');
  const [draft, setDraft] = useState({
    brand: '',
    name: '',
    iso: '400',
    format: '135' as FilmFormat,
    exposures: '36'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setStockId(activeStocks[0]?.id ?? NEW_STOCK);
      setQuantity('1');
    }
    // Reset only when the dialog opens; stocks may reload while it is open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const creatingStock = stockId === NEW_STOCK;
  const fillFromCommon = (common: CommonFilmStock) =>
    setDraft({
      brand: common.brand,
      name: common.name,
      iso: String(common.iso),
      format: common.format,
      exposures: String(common.exposures)
    });
  const canSubmit = !saving && (!creatingStock || draft.brand.trim() || draft.name.trim());

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }
    setSaving(true);
    try {
      let resolvedStockId = stockId;
      if (creatingStock) {
        const stock: Partial<FilmStock> = {
          brand: draft.brand.trim(),
          name: draft.name.trim(),
          iso: Number(draft.iso) || 400,
          format: draft.format,
          exposures: Number(draft.exposures) || 36
        };
        resolvedStockId = await createStock(stock);
      }
      await createRolls({
        stockId: resolvedStockId,
        cameraId: cameraId === 'none' ? null : cameraId,
        quantity: Number(quantity) || 1
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add roll</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <FieldGroup>
              <Field>
                <FieldLabel>Film stock</FieldLabel>
                <OptionSelect
                  value={stockId}
                  onChange={setStockId}
                  options={[
                    ...activeStocks.map((stock) => ({
                      value: stock.id,
                      label: `${stock.brand} ${stock.name} · ISO ${stock.iso} · ${FILM_FORMAT_LABEL[stock.format]}`
                    })),
                    { value: NEW_STOCK, label: 'New film stock…' }
                  ]}
                />
              </Field>
              {creatingStock && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                    <CommonStockSelect onPick={fillFromCommon} />
                  </div>
                  <Field>
                    <FieldLabel htmlFor="stock-brand">Brand</FieldLabel>
                    <Input
                      id="stock-brand"
                      value={draft.brand}
                      placeholder="Kodak"
                      autoComplete="off"
                      onChange={(e) => setDraft({ ...draft, brand: e.target.value })}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="stock-name">Name</FieldLabel>
                    <Input
                      id="stock-name"
                      value={draft.name}
                      placeholder="Portra 400"
                      autoComplete="off"
                      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="stock-iso">ISO</FieldLabel>
                    <Input
                      id="stock-iso"
                      type="number"
                      min={1}
                      value={draft.iso}
                      onChange={(e) => setDraft({ ...draft, iso: e.target.value })}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="stock-exposures">Exposures</FieldLabel>
                    <Input
                      id="stock-exposures"
                      type="number"
                      min={1}
                      value={draft.exposures}
                      onChange={(e) => setDraft({ ...draft, exposures: e.target.value })}
                    />
                  </Field>
                  <Field className="col-span-2">
                    <FieldLabel>Format</FieldLabel>
                    <OptionSelect
                      value={draft.format}
                      onChange={(format) => setDraft({ ...draft, format: format as FilmFormat })}
                      options={FILM_FORMATS.map((format) => ({
                        value: format,
                        label: FILM_FORMAT_LABEL[format]
                      }))}
                    />
                  </Field>
                </div>
              )}
              <Field>
                <FieldLabel>Camera (optional)</FieldLabel>
                <OptionSelect
                  value={cameraId}
                  onChange={setCameraId}
                  options={[
                    { value: 'none', label: 'No camera' },
                    ...cameras
                      .filter((camera) => !camera.archived)
                      .map((camera) => ({
                        value: camera.id,
                        label: `${camera.brand} ${camera.model}`
                      }))
                  ]}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="roll-quantity">Quantity</FieldLabel>
                <Input
                  id="roll-quantity"
                  type="number"
                  min={1}
                  max={50}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </Field>
            </FieldGroup>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button type="submit" disabled={!canSubmit}>
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
