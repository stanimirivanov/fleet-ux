import { useLocation, useSearchParams } from '@solidjs/router';
import { createEffect, createMemo } from 'solid-js';
import type {
  DemoRegistryScene,
  RegistryAssetRow,
} from '../../demo/registry-fixture';
import {
  filterRegistryAssets,
  projectRegistrySnapshot,
  type RegistryReviewCutoffs,
  readRegistryFilters,
  readRegistryReviewCutoffs,
  readRegistrySelection,
} from '../../model/registry-review';

/** URL-owned selection and bitemporal review state for the sample registry. */
export function useRegistryReview(props: {
  readonly tenantId: string;
  readonly assets: readonly RegistryAssetRow[];
  readonly getDetail: (assetId: string) => DemoRegistryScene | null;
}) {
  const location = useLocation();
  const [, setSearchParams] = useSearchParams();
  const filters = createMemo(() => readRegistryFilters(location.search));
  const visibleAssets = createMemo(() =>
    filterRegistryAssets(props.assets, filters()),
  );
  const requestedAsset = createMemo(() =>
    readRegistrySelection(location.search, 'asset'),
  );
  const selectedAsset = createMemo(() => {
    const request = requestedAsset();
    if (request.status === 'invalid') return null;
    const id =
      request.status === 'value'
        ? request.value
        : (props.assets.find((row) => row.modeled)?.asset.id ??
          props.assets[0]?.asset.id);
    return props.assets.find((row) => row.asset.id === id) ?? null;
  });
  const scene = createMemo(() => {
    const asset = selectedAsset();
    if (!asset?.modeled) return null;
    const detail = props.getDetail(asset.asset.id);
    return detail?.tenantId === props.tenantId &&
      detail.rootAssetId === asset.asset.id
      ? detail
      : null;
  });
  const cutoffRead = createMemo(() =>
    readRegistryReviewCutoffs(location.search),
  );
  const cutoffs = createMemo<RegistryReviewCutoffs | null>(() => {
    const read = cutoffRead();
    if (read.status === 'valid') return read.cutoffs;
    if (read.status === 'missing') return scene()?.defaultCutoffs ?? null;
    return null;
  });
  const snapshot = createMemo(() => {
    const detail = scene();
    const review = cutoffs();
    return detail && review ? projectRegistrySnapshot(detail, review) : null;
  });
  const structure = createMemo(() => {
    const detail = scene();
    const current = snapshot();
    return detail && current ? { detail, current } : null;
  });

  // A missing pair is canonicalized together. URL history restores both values.
  createEffect(() => {
    const read = cutoffRead();
    const defaults = scene()?.defaultCutoffs;
    if (read.status === 'missing' && defaults) {
      setSearchParams(
        {
          effective_at_ms: String(defaults.effectiveAtMs),
          known_at_ms: String(defaults.knownAtMs),
        },
        { replace: true },
      );
    }
  });

  const requestedNode = createMemo(() =>
    readRegistrySelection(location.search, 'node'),
  );
  const selectedNodeId = createMemo(() => {
    const detail = scene();
    const current = snapshot();
    const request = requestedNode();
    if (!detail || !current || request.status === 'invalid') return null;
    if (request.status === 'missing') return detail.rootAssetId;
    return current.nodes.some((node) => node.id === request.value)
      ? request.value
      : null;
  });
  const requestedSource = createMemo(() =>
    readRegistrySelection(location.search, 'source'),
  );
  const selectedSource = createMemo(() => {
    const current = snapshot();
    const request = requestedSource();
    if (!current || request.status === 'invalid') return null;
    if (request.status === 'missing') return current.sourceReviews[0] ?? null;
    return (
      current.sourceReviews.find((review) => review.key === request.value) ??
      null
    );
  });
  const requestedSourceKey = createMemo(() => {
    const request = requestedSource();
    if (request.status === 'value') return request.value;
    return request.status === 'invalid' ? '(invalid source selection)' : null;
  });

  const selectAsset = (assetId: string) =>
    setSearchParams({ asset: assetId, node: undefined, source: undefined });
  const selectNode = (nodeId: string) => setSearchParams({ node: nodeId });
  const selectSource = (key: string) => setSearchParams({ source: key });
  const search = (q: string) =>
    setSearchParams({ q: q || undefined }, { replace: true });
  const selectType = (type: string) =>
    setSearchParams({ type: type || undefined });
  const applyCutoffs = (effectiveAtMs: number, knownAtMs: number) =>
    setSearchParams({
      effective_at_ms: String(effectiveAtMs),
      known_at_ms: String(knownAtMs),
    });
  const resetCutoffs = () => {
    const defaults = scene()?.defaultCutoffs;
    if (defaults) applyCutoffs(defaults.effectiveAtMs, defaults.knownAtMs);
  };

  return {
    filters,
    visibleAssets,
    requestedAsset,
    selectedAsset,
    scene,
    cutoffRead,
    cutoffs,
    snapshot,
    structure,
    selectedNodeId,
    selectedSource,
    requestedSourceKey,
    selectAsset,
    selectNode,
    selectSource,
    search,
    selectType,
    applyCutoffs,
    resetCutoffs,
  };
}
