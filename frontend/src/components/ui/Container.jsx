import { cn } from '../../utils/cn.js';

/** Centered content column (prototype .uwrap). */
export default function Container({ className, children, as: Tag = 'div' }) {
  return <Tag className={cn('mx-auto w-full max-w-[1080px] px-8 max-md:px-4', className)}>{children}</Tag>;
}
