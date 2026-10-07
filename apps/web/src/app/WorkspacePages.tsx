import { PageHeader, TextLink } from '#shared/ui';

export function NotFoundPage() {
  return (
    <div class="flex max-w-3xl flex-col items-start gap-6">
      <PageHeader eyebrow="Navigation" title="Page not found">
        This address does not match an available FleetIQ workspace.
      </PageHeader>
      <TextLink href="/">Return to fleet overview</TextLink>
    </div>
  );
}
