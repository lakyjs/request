import type CancelError from './CancelError';
import OxiosError from '@/core/OxiosError';

export default function isCancel(val: unknown): val is CancelError {
  return val instanceof OxiosError && (val as CancelError).__CANCEL__ === true;
}
