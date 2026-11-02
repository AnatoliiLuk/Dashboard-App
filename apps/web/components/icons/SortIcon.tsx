import type { SVGProps } from 'react';

function SortIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="none"
      viewBox="0 0 16 16"
      aria-hidden="true"
      {...props}
    >
      <path
        fill={props.color || 'currentColor'}
        d="M4.5 2a.75.75 0 0 1 .53.22l2.5 2.5a.75.75 0 0 1-1.06 1.06L5.25 4.56v8.69a.75.75 0 0 1-1.5 0V4.56L2.53 5.78a.75.75 0 0 1-1.06-1.06l2.5-2.5A.75.75 0 0 1 4.5 2m7 0a.75.75 0 0 1 .75.75v8.69l1.22-1.22a.75.75 0 1 1 1.06 1.06l-2.5 2.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06l1.22 1.22V2.75A.75.75 0 0 1 11.5 2"
      />
    </svg>
  );
}

export { SortIcon };
