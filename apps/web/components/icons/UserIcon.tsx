import type { SVGProps } from 'react';

function UserIcon(props: SVGProps<SVGSVGElement>) {
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
        d="M8 1.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6m0 1.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3"
      />
      <path
        fill={props.color || 'currentColor'}
        fillRule="evenodd"
        d="M7 9h2c2.76 0 5 1.9 5 4.25v.5a.75.75 0 0 1-.75.75H2.75a.75.75 0 0 1-.75-.75v-.5C2 10.9 4.24 9 7 9m-3.45 4h8.9c-.18-1.38-1.6-2.5-3.45-2.5H7c-1.85 0-3.27 1.12-3.45 2.5"
      />
    </svg>
  );
}

export { UserIcon };
