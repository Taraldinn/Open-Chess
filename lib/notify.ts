import { toast } from 'sonner';

type NotifyColor = 'red' | 'green' | 'orange' | 'blue' | 'gray' | 'yellow';

export function notify({
  title,
  message,
  color,
}: {
  title: string;
  message?: string;
  color?: NotifyColor;
}) {
  const opts = { description: message };
  if (color === 'red') return toast.error(title, opts);
  if (color === 'green') return toast.success(title, opts);
  if (color === 'orange') return toast.warning(title, opts);
  return toast(title, opts);
}
