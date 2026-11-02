import type { SVGProps } from 'react';

function CalendarIcon(props: SVGProps<SVGSVGElement>) {
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
        fillRule="evenodd"
        d="M5 1.25a.75.75 0 0 1 .75.75v.5h4.5V2a.75.75 0 0 1 1.5 0v.5h.5a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25h-8.5a2.25 2.25 0 0 1-2.25-2.25v-7.5A2.25 2.25 0 0 1 3.75 2.5h.5V2A.75.75 0 0 1 5 1.25M3 7v5.25c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75V7zm0-1.5h10v-.75a.75.75 0 0 0-.75-.75h-8.5a.75.75 0 0 0-.75.75z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export { CalendarIcon };
