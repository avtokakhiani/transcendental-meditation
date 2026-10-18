import { CONTENT_STATUSES, ContentStatusLabel } from '@tm/shared';
import { inputClass, labelClass } from './ui';

export function StatusSelect({ defaultValue = 'draft' }: { defaultValue?: string }) {
  return (
    <label className={labelClass}>
      სტატუსი
      <select name="status" defaultValue={defaultValue} className={inputClass}>
        {CONTENT_STATUSES.map((status) => (
          <option key={status} value={status}>
            {ContentStatusLabel[status]}
          </option>
        ))}
      </select>
    </label>
  );
}
