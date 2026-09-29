import type { SVGProps } from 'react';

function CircleCheckIcon(props: SVGProps<SVGSVGElement>) {
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
        d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0m4.558 4.336a.71.71 0 0 0-1.002.066l-4.957 5.664-2.171-2.314a.71.71 0 0 0-1.036.973l2.707 2.886a.71.71 0 0 0 .518.224l.084-.005a.7.7 0 0 0 .45-.237l5.474-6.255a.71.71 0 0 0-.067-1.002"
        clipRule="evenodd"
      />
    </svg>
  );
}

export { CircleCheckIcon };
