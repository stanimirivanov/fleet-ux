import { PageHeader } from '#shared/ui';
import { ThemeSample } from './design-system/ThemeSample';
import { APP_ROUTES } from './route-metadata';

export function DesignSystemPage() {
  return (
    <div class="max-w-7xl">
      <PageHeader
        eyebrow="Reference · synthetic states"
        title={APP_ROUTES.designSystem.title}
      >
        Light and dark use the same information hierarchy. These examples
        exercise status language and theme tokens; they are not connected fleet
        data.
      </PageHeader>
      <div class="mt-8 grid gap-5 xl:grid-cols-2">
        <ThemeSample theme="light" />
        <ThemeSample theme="dark" />
      </div>
    </div>
  );
}
