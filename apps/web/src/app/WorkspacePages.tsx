import { ConnectionNotice, PageHeader, TextLink } from '#shared/ui';
import { APP_ROUTES } from './route-metadata';

export function OverviewPage() {
  return (
    <div class="flex max-w-6xl flex-col items-start gap-6">
      <PageHeader eyebrow="Workspace" title={APP_ROUTES.overview.title}>
        This workspace will prioritize assets that need attention and show
        whether their latest evidence can be trusted.
      </PageHeader>
      <div class="w-full max-w-3xl">
        <ConnectionNotice heading="Fleet data is not connected yet">
          The web application has no tenant or telemetry API configured. Asset
          counts, locations, conditions, and alerts will appear only after
          approved backend connections and data-quality rules are in place.
        </ConnectionNotice>
      </div>
      <TextLink href="/design-system">Review the design foundations</TextLink>
    </div>
  );
}

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
