import type { ActionHandler, GasketTrace, HookHandler, GasketActions, Gasket } from '@gasket/core';

type isolateLifecycle<T> = (source: GasketTrace, name: string, fn: HookHandler<T>) => HookHandler<T>
type isolateAction<T> = (source: GasketTrace, name: string, fn: ActionHandler<T>) => ActionHandler<T>
type interceptActions = (source: GasketTrace, actions: GasketActions) => GasketActions
type makeTraceBranch = (source: Gasket | GasketTrace) => GasketTrace
