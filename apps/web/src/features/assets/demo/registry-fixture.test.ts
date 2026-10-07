import { describe, expect, test } from 'vitest';
import { projectRegistrySnapshot } from '../model/registry-review';
import { getDemoRegistry, getDemoRegistryDetail } from './registry-fixture';

const CURRENT = 1_791_280_800_000;
const BEFORE_CORRECTION = 1_788_510_600_000;
const RETIRED_BINDING_END = 1_791_280_560_000;

describe('sample registry review', () => {
  test('keeps tenant ownership and unmodeled detail distinct from empty facts', () => {
    const rows = getDemoRegistry('tenant-a');
    expect(rows).toHaveLength(8);
    expect(
      rows.filter((row) => row.modeled).map((row) => row.asset.id),
    ).toEqual(['asset-004', 'asset-008']);
    expect(getDemoRegistryDetail('tenant-a', 'asset-001')).toBeNull();
    expect(getDemoRegistryDetail('tenant-b', 'asset-004')).toBeNull();
    expect(getDemoRegistry('tenant-b')).toEqual([]);
  });

  test('reuses inspector facts and keeps observed unassigned distinct from ambiguity', () => {
    const rail = getDemoRegistryDetail('tenant-a', 'asset-004');
    expect(rail).not.toBeNull();
    if (!rail) return;
    expect(rail.defaultCutoffs).toEqual({
      effectiveAtMs: CURRENT,
      knownAtMs: CURRENT,
    });
    const snapshot = projectRegistrySnapshot(rail, rail.defaultCutoffs);
    expect(snapshot.nodes.some((node) => node.id === 'sample-motor-417')).toBe(
      true,
    );
    expect(
      snapshot.relationships.find(
        (relation) => relation.id === 'sample-relationship-motor-417',
      )?.targetAssetId,
    ).toBe('sample-motor-417');
    expect(
      snapshot.sourceReviews.find(
        (source) => source.source.signalId === 'traction.motor.temperature',
      )?.state,
    ).toBe('mapped');
    const unassigned = snapshot.sourceReviews.find(
      (source) => source.source.signalId === 'can.unknown.027',
    );
    expect(unassigned?.state).toBe('unassigned');
    expect(unassigned?.observation).not.toBeNull();
    expect(unassigned?.candidateBindings).toEqual([]);
    const ambiguous = snapshot.sourceReviews.find(
      (source) => source.source.signalId === 'can.aux.current',
    );
    expect(ambiguous?.state).toBe('ambiguous');
    expect(ambiguous?.candidateBindings.map((binding) => binding.id)).toEqual([
      'sample-binding-aux-energy',
      'sample-binding-aux-traction',
    ]);
    expect(snapshot.missingNodeIds).toEqual([]);
  });

  test('records a correction by knowledge time rather than overwriting old attribution', () => {
    const rail = getDemoRegistryDetail('tenant-a', 'asset-004');
    expect(rail).not.toBeNull();
    if (!rail) return;
    const historic = projectRegistrySnapshot(rail, {
      effectiveAtMs: CURRENT,
      knownAtMs: BEFORE_CORRECTION,
    });
    const current = projectRegistrySnapshot(rail, rail.defaultCutoffs);
    const historicMotor = historic.bindings.find(
      (binding) => binding.id === 'sample-binding-motor-temperature',
    );
    const currentMotor = current.bindings.find(
      (binding) => binding.id === 'sample-binding-motor-temperature',
    );
    expect(historicMotor?.revision).toBe('1');
    expect(historicMotor?.target.assetId).toBe('sample-motor-b-417');
    expect(currentMotor?.revision).toBe('2');
    expect(currentMotor?.target.assetId).toBe('sample-motor-417');
    expect(
      historic.sourceReviews.find(
        (source) => source.source.signalId === 'traction.motor.temperature',
      )?.observation,
    ).toBeNull();
  });

  test('expires the retired source mapping at the exact half-open end', () => {
    const rail = getDemoRegistryDetail('tenant-a', 'asset-004');
    expect(rail).not.toBeNull();
    if (!rail) return;
    const before = projectRegistrySnapshot(rail, {
      effectiveAtMs: RETIRED_BINDING_END - 1,
      knownAtMs: CURRENT,
    });
    const atEnd = projectRegistrySnapshot(rail, {
      effectiveAtMs: RETIRED_BINDING_END,
      knownAtMs: CURRENT,
    });
    expect(
      before.sourceReviews.find(
        (source) => source.source.signalId === 'can.unknown.027',
      )?.state,
    ).toBe('mapped');
    expect(
      atEnd.sourceReviews.find(
        (source) => source.source.signalId === 'can.unknown.027',
      )?.state,
    ).toBe('unassigned');
  });

  test('mapped trailer source can have no observed value', () => {
    const trailer = getDemoRegistryDetail('tenant-a', 'asset-008');
    expect(trailer).not.toBeNull();
    if (!trailer) return;
    const snapshot = projectRegistrySnapshot(trailer, trailer.defaultCutoffs);
    const freezer = snapshot.sourceReviews.find(
      (source) => source.source.signalId === 'freezer.air.temperature',
    );
    expect(freezer?.state).toBe('mapped');
    expect(freezer?.observation).toBeNull();
    expect(freezer?.endpointState).toBe('registered');
  });
});
