import type { SVGProps } from 'react';

function TargetIcon(props: SVGProps<SVGSVGElement>) {
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
        d="M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1m0 1.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11M8 4.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7M8 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4m0 1.25a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5"
        clipRule="evenodd"
      />
    </svg>
  );
}

export { TargetIcon };
