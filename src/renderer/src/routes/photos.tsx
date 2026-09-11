import { createFileRoute } from '@tanstack/react-router';
import { PhotosScreen } from '#/modules/photos/photos-screen';

export const Route = createFileRoute('/photos')({
  component: PhotosScreen
});
