import type { SVGProps } from 'react';

function SignOutIcon(props: SVGProps<SVGSVGElement>) {
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
        d="M2.25 1.5A.75.75 0 0 0 1.5 2.25v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75V12a.75.75 0 0 0-1.5 0v1H3V3h4v1a.75.75 0 0 0 1.5 0V2.25a.75.75 0 0 0-.75-.75z"
      />
      <path
        fill={props.color || 'currentColor'}
        d="M10.22 4.97a.75.75 0 0 0 0 1.06l1.22 1.22H6.75a.75.75 0 0 0 0 1.5h4.69l-1.22 1.22a.75.75 0 1 0 1.06 1.06l2.5-2.5a.75.75 0 0 0 0-1.06l-2.5-2.5a.75.75 0 0 0-1.06 0"
      />
    </svg>
  );
}

export { SignOutIcon };
