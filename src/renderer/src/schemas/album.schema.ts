import * as v from 'valibot';

export const albumSchema = v.object({
  name: v.pipe(
    v.string(),
    v.trim(),
    v.nonEmpty('Please enter the album name.'),
    v.maxLength(255, 'The album name must be less than 255 characters.')
  )
});

export type AlbumSchema = v.InferOutput<typeof albumSchema>;
