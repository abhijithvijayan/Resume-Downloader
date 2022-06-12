import {Environment} from './utils/constants';

export type NullOr<T> = null | T;

declare global {
  const ENVIRONMENT: Environment;
}
