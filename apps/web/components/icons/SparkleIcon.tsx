import type { SVGProps } from 'react';

function SparkleIcon(props: SVGProps<SVGSVGElement>) {
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
        d="M8 1.5 9.5 6.5l5 1.5-5 1.5L8 14.5l-1.5-5-5-1.5 5-1.5z"
      />
    </svg>
  );
}

export { SparkleIcon };
