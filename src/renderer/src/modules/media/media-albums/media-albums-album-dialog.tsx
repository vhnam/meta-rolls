import { Field as FormischField, Form, reset, useForm } from '@formisch/react';
import type { SubmitHandler } from '@formisch/react';
import { useEffect } from 'react';

import { Button } from '#/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '#/components/ui/dialog';
import { Field, FieldError, FieldGroup, FieldLabel } from '#/components/ui/field';
import { Input } from '#/components/ui/input';
import { type AlbumSchema, albumSchema } from '#/schemas/album.schema';
import { type Album } from '#/types';

type MediaAlbumsAlbumDialogProps = {
  open: boolean;
  album: Album | null;
  onOpenChange: (open: boolean) => void;
  onSaveAlbum: (album: AlbumSchema) => void | Promise<void>;
};

export const MediaAlbumsAlbumDialog = ({
  open,
  album,
  onOpenChange,
  onSaveAlbum
}: MediaAlbumsAlbumDialogProps) => {
  const isEditing = album !== null;
  const form = useForm({
    schema: albumSchema,
    initialInput: {
      name: album?.name ?? ''
    }
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    reset(form, { initialInput: { name: album?.name ?? '' } });
  }, [album, form, open]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset(form, { initialInput: { name: '' } });
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit: SubmitHandler<typeof albumSchema> = async (values) => {
    await onSaveAlbum(values);
    reset(form, { initialInput: { name: '' } });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <Form of={form} onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Rename album' : 'Add album'}</DialogTitle>
          </DialogHeader>
          <FieldGroup className="py-6">
            <FormischField of={form} path={['name']}>
              {(field) => (
                <Field data-invalid={field.errors !== null}>
                  <FieldLabel htmlFor="form-name">Album name</FieldLabel>
                  <Input
                    {...field.props}
                    id="form-name"
                    value={field.input}
                    aria-invalid={field.errors !== null}
                    placeholder="My album"
                    autoComplete="off"
                  />
                  {field.errors && (
                    <FieldError errors={field.errors.map((message) => ({ message }))} />
                  )}
                </Field>
              )}
            </FormischField>
          </FieldGroup>
          <DialogFooter>
            <DialogClose
              render={
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
              }
            />
            <Button type="submit" disabled={form.isSubmitting}>
              {isEditing ? 'Save' : 'Add'}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
